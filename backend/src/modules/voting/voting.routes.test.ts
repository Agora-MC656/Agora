import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { VotingController } from "./voting.controller.js";
import {
  InMemoryProposalCatalog,
  type VotingProposalSummary,
} from "./voting.proposals.js";
import { InMemoryVotingRepository } from "./voting.repository.js";
import { createVotingRouter } from "./voting.routes.js";
import { VotingService } from "./voting.service.js";
import type { Vote, VotingResult } from "./voting.types.js";

let server: Server;
let baseUrl: string;

beforeEach(async () => {
  const controller = new VotingController(
    new VotingService(new InMemoryVotingRepository()),
    new InMemoryProposalCatalog([
      {
        id: "orcamento-2026",
        title: "Orçamento 2026",
        description: "Você aprova a proposta?",
        budgetReference: "Informática",
      },
      {
        id: "obras-2026",
        title: "Obras 2026",
        description: "Você aprova as obras?",
        budgetReference: "Obras",
      },
    ]),
  );
  const app = express();
  app.use(express.json());
  app.use("/voting", createVotingRouter(controller));

  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}/voting`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

function castVote(proposalId: string, body: unknown): Promise<Response> {
  return fetch(`${baseUrl}/proposals/${proposalId}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("rotas de votacao", () => {
  it("responde 201 com o voto registrado", async () => {
    const response = await castVote("orcamento-2026", {
      voterId: "ana",
      option: "sim",
    });

    expect(response.status).toBe(201);
    expect((await response.json()) as Vote).toEqual({
      proposalId: "orcamento-2026",
      voterId: "ana",
      option: "sim",
    });
  });

  it("responde 400 quando o corpo da requisicao e invalido", async () => {
    const response = await castVote("orcamento-2026", { voterId: "ana" });

    expect(response.status).toBe(400);
  });

  it("responde 409 quando o participante ja votou na pauta", async () => {
    await castVote("orcamento-2026", { voterId: "ana", option: "sim" });

    const response = await castVote("orcamento-2026", {
      voterId: "ana",
      option: "nao",
    });

    expect(response.status).toBe(409);
  });

  it("responde 200 com a apuracao da pauta", async () => {
    await castVote("orcamento-2026", { voterId: "ana", option: "sim" });
    await castVote("orcamento-2026", { voterId: "bruno", option: "nao" });

    const response = await fetch(`${baseUrl}/proposals/orcamento-2026/results`);

    expect(response.status).toBe(200);
    expect((await response.json()) as VotingResult).toEqual({
      proposalId: "orcamento-2026",
      totals: { sim: 1, nao: 1 },
      totalVotes: 2,
    });
  });

  it("responde 404 ao votar em uma pauta inexistente", async () => {
    const response = await castVote("pauta-inexistente", {
      voterId: "ana",
      option: "sim",
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Pauta não encontrada." });
  });

  it("responde 404 ao apurar uma pauta inexistente", async () => {
    const response = await fetch(
      `${baseUrl}/proposals/pauta-inexistente/results`,
    );

    expect(response.status).toBe(404);
  });

  it("lista as pautas com a apuração atual", async () => {
    await castVote("orcamento-2026", { voterId: "ana", option: "sim" });

    const response = await fetch(`${baseUrl}/proposals`);
    const proposals = (await response.json()) as VotingProposalSummary[];

    expect(response.status).toBe(200);
    expect(proposals.map(({ id }) => id)).toEqual([
      "orcamento-2026",
      "obras-2026",
    ]);
    expect(proposals[0]).toMatchObject({
      title: "Orçamento 2026",
      result: { totals: { sim: 1, nao: 0 }, totalVotes: 1 },
      myVote: null,
    });
  });

  it("inclui o voto do participante informado em cada pauta", async () => {
    await castVote("obras-2026", { voterId: "ana", option: "nao" });

    const response = await fetch(`${baseUrl}/proposals?voterId=%20ana%20`);
    const proposals = (await response.json()) as VotingProposalSummary[];

    expect(proposals.map(({ myVote }) => myVote)).toEqual([null, "nao"]);
  });
});
