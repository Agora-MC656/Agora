import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryVotingRepository } from "./voting.repository.js";
import { DuplicateVoteError, VotingService } from "./voting.service.js";

describe("VotingService", () => {
  let service: VotingService;

  beforeEach(() => {
    service = new VotingService(new InMemoryVotingRepository());
  });

  it("registra o voto de um participante em uma pauta", () => {
    const vote = service.castVote("orcamento-2026", {
      voterId: "ana",
      option: "sim",
    });

    expect(vote).toEqual({
      proposalId: "orcamento-2026",
      voterId: "ana",
      option: "sim",
    });
  });

  it("impede que o mesmo participante vote duas vezes na mesma pauta", () => {
    service.castVote("orcamento-2026", { voterId: "ana", option: "sim" });

    expect(() =>
      service.castVote("orcamento-2026", { voterId: "ana", option: "nao" }),
    ).toThrow(DuplicateVoteError);

    expect(service.getResult("orcamento-2026").totalVotes).toBe(1);
  });

  it("permite que o mesmo participante vote em pautas diferentes", () => {
    service.castVote("orcamento-2026", { voterId: "ana", option: "sim" });
    service.castVote("obras-2026", { voterId: "ana", option: "nao" });

    expect(service.getResult("orcamento-2026").totals).toEqual({
      sim: 1,
      nao: 0,
    });
    expect(service.getResult("obras-2026").totals).toEqual({ sim: 0, nao: 1 });
  });

  it("apura os totais por opcao apenas da pauta consultada", () => {
    service.castVote("orcamento-2026", { voterId: "ana", option: "sim" });
    service.castVote("orcamento-2026", { voterId: "bruno", option: "sim" });
    service.castVote("orcamento-2026", { voterId: "carla", option: "nao" });
    service.castVote("obras-2026", { voterId: "davi", option: "sim" });

    expect(service.getResult("orcamento-2026")).toEqual({
      proposalId: "orcamento-2026",
      totals: { sim: 2, nao: 1 },
      totalVotes: 3,
    });
  });

  it("retorna totais zerados para uma pauta sem votos", () => {
    expect(service.getResult("pauta-vazia")).toEqual({
      proposalId: "pauta-vazia",
      totals: { sim: 0, nao: 0 },
      totalVotes: 0,
    });
  });
});
