import type { Vote } from "./voting.types.js";

export type VotingRepository = {
  findVote(proposalId: string, voterId: string): Vote | undefined;
  save(vote: Vote): void;
  listByProposal(proposalId: string): Vote[];
};

function voteKey(proposalId: string, voterId: string): string {
  return `${proposalId}:${voterId}`;
}

/**
 * Armazenamento em memoria: suficiente para a primeira versao da votacao e
 * substituivel por um banco de dados sem alterar o servico.
 */
export class InMemoryVotingRepository implements VotingRepository {
  private readonly votes = new Map<string, Vote>();

  findVote(proposalId: string, voterId: string): Vote | undefined {
    return this.votes.get(voteKey(proposalId, voterId));
  }

  save(vote: Vote): void {
    this.votes.set(voteKey(vote.proposalId, vote.voterId), vote);
  }

  listByProposal(proposalId: string): Vote[] {
    return [...this.votes.values()].filter(
      (vote) => vote.proposalId === proposalId,
    );
  }
}
