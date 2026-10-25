import { describe, expect, it, vi } from "vitest";

import {
  GORILLA_SEARCH_URL,
  GorillaSearchAdapter,
} from "./gorilla-search.adapter.js";

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("GorillaSearchAdapter", () => {
  it("inicia a busca, consulta o estado até 'completed' e devolve os resultados", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ search_id: "busca-1", status: "running" }),
      )
      .mockResolvedValueOnce(jsonResponse({ status: "running" }))
      .mockResolvedValueOnce(
        jsonResponse({
          search_id: "busca-1",
          status: "completed",
          total: 1,
          results: [{ id: "post-1", title: "Orçamento do IC" }],
        }),
      );
    const adapter = new GorillaSearchAdapter({
      apiKey: "chave",
      fetchFn,
      pollIntervalMs: 0,
    });

    const result = await adapter.search("orçamento");

    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(fetchFn).toHaveBeenNthCalledWith(
      1,
      GORILLA_SEARCH_URL,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "chave" }) as unknown,
        body: JSON.stringify({ query: "orçamento", since: "30d", limit: 5 }),
      }),
    );
    expect(fetchFn).toHaveBeenNthCalledWith(
      2,
      `${GORILLA_SEARCH_URL}?id=busca-1`,
      { headers: { "x-api-key": "chave" } },
    );
    expect(result).toEqual({
      search_id: "busca-1",
      status: "completed",
      total: 1,
      results: [{ id: "post-1", title: "Orçamento do IC" }],
    });
  });

  it("devolve lista vazia quando a API não envia resultados", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ search_id: "busca-2", status: "running" }),
      )
      .mockResolvedValueOnce(jsonResponse({ status: "completed" }));
    const adapter = new GorillaSearchAdapter({
      apiKey: "chave",
      fetchFn,
      pollIntervalMs: 0,
    });

    await expect(adapter.search("teste")).resolves.toEqual({
      search_id: "busca-2",
      status: "completed",
      results: [],
    });
  });

  it("falha sem chamar a API quando a chave não está configurada", async () => {
    const fetchFn = vi.fn();
    const adapter = new GorillaSearchAdapter({ apiKey: "", fetchFn });

    await expect(adapter.search("teste")).rejects.toThrow(
      "GORILLA_API_KEY não foi configurada",
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("falha quando o POST inicial é recusado", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad Request"),
    });
    const adapter = new GorillaSearchAdapter({ apiKey: "chave", fetchFn });

    await expect(adapter.search("teste")).rejects.toThrow(
      "Falha no POST do Gorilla (400): Bad Request",
    );
  });

  it("falha quando a consulta de estado é recusada", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ search_id: "busca-3", status: "running" }),
      )
      .mockResolvedValueOnce({ ok: false, statusText: "Unauthorized" });
    const adapter = new GorillaSearchAdapter({
      apiKey: "chave",
      fetchFn,
      pollIntervalMs: 0,
    });

    await expect(adapter.search("teste")).rejects.toThrow(
      "Erro no polling: Unauthorized",
    );
  });

  it("desiste após o número máximo de consultas de estado", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ search_id: "busca-4", status: "running" }),
      )
      .mockResolvedValue(jsonResponse({ status: "running" }));
    const adapter = new GorillaSearchAdapter({
      apiKey: "chave",
      fetchFn,
      pollIntervalMs: 0,
      maxPollAttempts: 3,
    });

    await expect(adapter.search("teste")).rejects.toThrow(
      "não terminou após 3 consultas de estado",
    );
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });
});
