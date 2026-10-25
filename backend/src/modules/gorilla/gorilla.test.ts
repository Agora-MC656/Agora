import { createServer, type Server } from "node:http";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { gorillaRouter } from "./gorilla.routes.js";
import { GorillaService } from "./gorilla.service.js";
import type { SocialSearchResults } from "./gorilla.types.js";
import type { SocialSearchProvider } from "./social-search.provider.js";

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

    it("deve buscar no provedor configurado e salvar o resultado", async () => {
      const results: SocialSearchResults = {
        search_id: "test-search-123",
        status: "completed",
        total: 1,
        results: [],
      };
      const search = vi.fn().mockResolvedValue(results);
      const provider: SocialSearchProvider = { search };
      const serviceWithFakeProvider = new GorillaService(
        provider,
        tempTestPath,
      );

      const returned = await serviceWithFakeProvider.fetchAndSave("teste");

      expect(search).toHaveBeenCalledWith("teste");
      expect(returned).toEqual(results);
      await expect(serviceWithFakeProvider.getStoredResults()).resolves.toEqual(
        results,
      );
    });

    it("deve usar a consulta padrão quando nenhuma for informada", async () => {
      const search = vi.fn().mockResolvedValue({
        search_id: "padrao",
        status: "completed",
        results: [],
      });
      const provider: SocialSearchProvider = { search };

      await new GorillaService(provider, tempTestPath).fetchAndSave();

      expect(search).toHaveBeenCalledWith("orçamento participativo");
    });

    it("não deve sobrescrever o arquivo quando o provedor falhar", async () => {
      const provider: SocialSearchProvider = {
        search: vi.fn().mockRejectedValue(new Error("fornecedor indisponível")),
      };
      const before = await service.getStoredResults();

      await expect(
        new GorillaService(provider, tempTestPath).fetchAndSave("teste"),
      ).rejects.toThrow("fornecedor indisponível");
      await expect(service.getStoredResults()).resolves.toEqual(before);
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
