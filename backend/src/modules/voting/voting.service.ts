import type { CastVoteInput } from "./voting.schema.js";
import type { VotingRepository } from "./voting.repository.js";
import { VOTE_OPTIONS, type Vote, type VotingResult } from "./voting.types.js";

export class DuplicateVoteError extends Error {
  constructor(proposalId: string, voterId: string) {
    super(`O participante ${voterId} ja votou na pauta ${proposalId}.`);
    this.name = "DuplicateVoteError";
  }
}

export class VotingService {
  constructor(private readonly repository: VotingRepository) {}

  /** Registra o voto de um participante. Cada participante vota uma unica vez por pauta. */
  castVote(proposalId: string, input: CastVoteInput): Vote {
    if (this.repository.findVote(proposalId, input.voterId) !== undefined) {
      throw new DuplicateVoteError(proposalId, input.voterId);
    }

    const vote: Vote = {
      proposalId,
      voterId: input.voterId,
      option: input.option,
    };

    this.repository.save(vote);

    return vote;
  }

  /** Apura a pauta. Uma pauta sem votos retorna todos os totais zerados. */
  getResult(proposalId: string): VotingResult {
    const votes = this.repository.listByProposal(proposalId);
    const totals = Object.fromEntries(
      VOTE_OPTIONS.map((option) => [option, 0]),
    ) as VotingResult["totals"];

    for (const vote of votes) {
      totals[vote.option] += 1;
    }

    return { proposalId, totals, totalVotes: votes.length };
  }
}
