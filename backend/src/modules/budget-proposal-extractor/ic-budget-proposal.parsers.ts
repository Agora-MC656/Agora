import { parseIcBudgetProposal2020 } from "./ic-budget-proposal.parser.js";
import type { BudgetProposalItem } from "./ic-budget-proposal.types.js";

/**
 * Estratégia de interpretação do texto de uma proposta orçamentária do IC.
 * O layout do PDF muda entre exercícios, então cada exercício suportado tem
 * seu próprio parser.
 */
export interface BudgetProposalParser {
  readonly year: number;
  parse(text: string): BudgetProposalItem[];
}

export const icBudgetProposal2020Parser: BudgetProposalParser = {
  year: 2020,
  parse: parseIcBudgetProposal2020,
};

export const IC_BUDGET_PROPOSAL_PARSERS: readonly BudgetProposalParser[] = [
  icBudgetProposal2020Parser,
];
