import { createServer, type Server } from "node:http";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { gorillaRouter } from "./gorilla.routes.js";
import { GorillaService } from "./gorilla.service.js";

describe("Módulo Gorilla", () => {
  describe("GorillaService", () => {
    const service = new GorillaService();
    const tempTestPath = resolve(import.meta.dirname, "test-output.json");

    afterAll(async () => {
      await rm(tempTestPath, { force: true }).catch(() => {});
    });

    it("deve carregar e parsear os dados do arquivo local de exemplo", async () => {
      const data = await service.getStoredResults();

      expect(data).toBeDefined();
      expect(data.search_id).toBeDefined();
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results.length).toBeGreaterThan(0);
    });

    it("deve lançar erro quando o caminho do arquivo for inválido", async () => {
      await expect(
        service.getStoredResults("caminho/que/nao/existe.json"),
      ).rejects.toThrow();
    });

    it("deve realizar o fluxo completo com fetchAndSave (POST, polling e salvar arquivo)", async () => {
      // 1ª chamada: POST inicia busca
      // 2ª chamada: GET polling status: running
      // 3ª chamada: GET polling status: completed
      let callCount = 0;
      const mockFetch = vi
        .fn()
        .mockImplementation((url: string, init?: RequestInit) => {
          callCount++;
          if (init?.method === "POST") {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  search_id: "test-search-123",
                  status: "running",
                }),
            } as Response);
          }

          const isLast = callCount >= 3;
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve(
                isLast
                  ? {
                      search_id: "test-search-123",
                      status: "completed",
                      total: 1,
                      results: [{ id: "mock-1", title: "Post orcamento" }],
                    }
                  : { status: "running" },
              ),
          } as Response);
        });

      const result = await service.fetchAndSave(
        "orçamento participativo",
        "mock-key",
        mockFetch,
        tempTestPath,
        0, // sem delay para teste rápido
      );

      expect(callCount).toBe(3);
      expect(result.status).toBe("completed");
      expect(result.results).toHaveLength(1);

      // Confirma que o arquivo foi realmente escrito e pode ser lido de volta
      const savedData = await service.getStoredResults(tempTestPath);
      expect(savedData.search_id).toBe("test-search-123");
    });

    it("deve lançar erro em fetchAndSave se a chave de API não for fornecida", async () => {
      await expect(service.fetchAndSave("teste", "", fetch)).rejects.toThrow(
        "GORILLA_API_KEY não foi configurada",
      );
    });

    it("deve lançar erro se o POST inicial falhar", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad Request"),
      });

      await expect(
        service.fetchAndSave("teste", "mock-key", mockFetch),
      ).rejects.toThrow("Falha no POST do Gorilla (400)");
    });

    it("deve lançar erro caso a resposta do polling não seja ok", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Unauthorized",
      });

      await expect(
        service.pollSearchResults("id-123", "key-123", mockFetch, 0),
      ).rejects.toThrow("Erro no polling: Unauthorized");
    });
  });

  describe("Gorilla HTTP Routes (Integração)", () => {
    let server: Server;
    let baseUrl: string;

    beforeAll(async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/gorilla", gorillaRouter);

      await new Promise<void>((resolve) => {
        server = createServer(testApp);
        server.listen(0, () => {
          const address = server.address();
          if (address && typeof address === "object") {
            baseUrl = `http://127.0.0.1:${address.port}`;
          }
          resolve();
        });
      });
    });

    afterAll(async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    });

    it("deve retornar 200 e os resultados em GET /api/gorilla", async () => {
      const response = await fetch(`${baseUrl}/api/gorilla`);
      expect(response.status).toBe(200);

      const data = (await response.json()) as { results?: unknown[] };
      expect(data).toHaveProperty("results");
      expect(Array.isArray(data.results)).toBe(true);
    });

    it("deve responder com 500 caso ocorra falha na busca em POST /api/gorilla/fetch", async () => {
      const response = await fetch(`${baseUrl}/api/gorilla/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "teste" }),
      });

      // Em ambiente de teste sem GORILLA_API_KEY no CI, deve retornar 500 informando o erro
      expect(response.status).toBe(500);
      const data = (await response.json()) as { error?: string };
      expect(data).toHaveProperty("error");
    });
  });
});
