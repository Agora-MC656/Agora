export const VOTE_OPTIONS = ["sim", "nao"] as const;

export type VoteOption = (typeof VOTE_OPTIONS)[number];

export type Vote = {
  proposalId: string;
  voterId: string;
  option: VoteOption;
};

export type VotingResult = {
  proposalId: string;
  totals: Record<VoteOption, number>;
  totalVotes: number;
};
