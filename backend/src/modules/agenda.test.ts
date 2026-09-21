import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createAgendaRouter,
  generateAgenda,
  type AgendaGenerator,
} from "./agenda.js";

let server: Server | undefined;

async function requestAgenda(
  body: unknown,
  generator: AgendaGenerator,
): Promise<Response> {
  const app = express();
  app.use(express.json());
  app.use("/api/agenda", createAgendaRouter(generator));

  server = createServer(app);
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;

  return fetch(`http://localhost:${port}/api/agenda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(async () => {
  vi.unstubAllEnvs();
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = undefined;
  }
});

describe("geração de pautas", () => {
  it("retorna uma pauta estruturada para o contexto informado", async () => {
    const agenda = { title: "Orçamento", items: ["Prioridades", "Prazos"] };
    const generator = vi.fn<AgendaGenerator>().mockResolvedValue(agenda);

    const response = await requestAgenda(
      { context: "  orçamento do semestre  " },
      generator,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(agenda);
    expect(generator).toHaveBeenCalledWith("orçamento do semestre");
  });

  it("rejeita contexto vazio sem chamar o agente", async () => {
    const generator = vi.fn<AgendaGenerator>();

    const response = await requestAgenda({ context: "   " }, generator);

    expect(response.status).toBe(400);
    expect(generator).not.toHaveBeenCalled();
  });

  it("informa falha do serviço externo sem expor detalhes internos", async () => {
    const generator = vi
      .fn<AgendaGenerator>()
      .mockRejectedValue(new Error("token secreto"));

    const response = await requestAgenda({ context: "orçamento" }, generator);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Não foi possível gerar a pauta.",
    });
  });

  it("informa quando a chave do agente não está configurada", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const response = await requestAgenda(
      { context: "orçamento" },
      generateAgenda,
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "OPENAI_API_KEY não configurada.",
    });
  });
});
