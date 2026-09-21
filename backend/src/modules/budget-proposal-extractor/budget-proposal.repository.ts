import type { BudgetProposal } from "./ic-budget-proposal.types.js";

export interface BudgetProposalRepository {
  findByInstitutionAndYear(
    institution: string,
    year: number,
  ): Promise<BudgetProposal | null>;
  save(proposal: BudgetProposal): Promise<void>;
}

function createRepositoryKey(institution: string, year: number): string {
  return `${institution}:${year}`;
}

export class InMemoryBudgetProposalRepository implements BudgetProposalRepository {
  private readonly proposals = new Map<string, BudgetProposal>();

  findByInstitutionAndYear(
    institution: string,
    year: number,
  ): Promise<BudgetProposal | null> {
    const key = createRepositoryKey(institution, year);
    return Promise.resolve(this.proposals.get(key) ?? null);
  }

  save(proposal: BudgetProposal): Promise<void> {
    const key = createRepositoryKey(proposal.institution, proposal.year);
    this.proposals.set(key, proposal);
    return Promise.resolve();
  }
}
