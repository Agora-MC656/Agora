export type BudgetProposalItem = {
  section: string;
  subsection: string | null;
  description: string;
  estimatedAmountCents: number;
  approvedAmountCents: number;
  fundingSource: string;
  priority: string;
};

export type BudgetProposal = {
  institution: string;
  year: number;
  documentType: "budget_proposal";
  sourceUrl: string;
  extractedAt: Date;
  items: BudgetProposalItem[];
};

export type ParsedBudgetItemLine = Omit<
  BudgetProposalItem,
  "section" | "subsection"
>;
