export class InvalidBudgetProposalYearError extends Error {
  constructor(value: string | undefined) {
    super(`Invalid budget proposal year: ${value ?? "missing"}.`);
    this.name = "InvalidBudgetProposalYearError";
  }
}

export class UnsupportedIcBudgetProposalYearError extends Error {
  constructor(public readonly year: number) {
    super(`Unsupported IC budget proposal year: ${year}.`);
    this.name = "UnsupportedIcBudgetProposalYearError";
  }
}
