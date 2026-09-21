import { InvalidBudgetProposalYearError } from "./budget-proposal.errors.js";

const FOUR_DIGIT_YEAR_PATTERN = /^\d{4}$/;

export function parseBudgetProposalYear(value: string | undefined): number {
  if (!value || !FOUR_DIGIT_YEAR_PATTERN.test(value)) {
    throw new InvalidBudgetProposalYearError(value);
  }

  return Number(value);
}
