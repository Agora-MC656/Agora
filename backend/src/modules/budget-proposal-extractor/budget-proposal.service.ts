import type { BudgetProposalRepository } from "./budget-proposal.repository.js";
import type { BudgetProposal } from "./ic-budget-proposal.types.js";

export const IC_INSTITUTION = "Instituto de Computação da Unicamp";

export interface BudgetProposalExtraction {
  extract(year: number): Promise<BudgetProposal>;
}

export class BudgetProposalService {
  private readonly pendingProposals = new Map<
    number,
    Promise<BudgetProposal>
  >();

  constructor(
    private readonly repository: BudgetProposalRepository,
    private readonly extractor: BudgetProposalExtraction,
  ) {}

  getIcBudgetProposal(year: number): Promise<BudgetProposal> {
    const pending = this.pendingProposals.get(year);
    if (pending) {
      return pending;
    }

    const proposal = this.findOrExtract(year).finally(() => {
      this.pendingProposals.delete(year);
    });
    this.pendingProposals.set(year, proposal);
    return proposal;
  }

  private async findOrExtract(year: number): Promise<BudgetProposal> {
    const cachedProposal = await this.repository.findByInstitutionAndYear(
      IC_INSTITUTION,
      year,
    );

    if (cachedProposal) {
      return cachedProposal;
    }

    const proposal = await this.extractor.extract(year);
    await this.repository.save(proposal);

    return proposal;
  }
}
