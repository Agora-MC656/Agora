import { PDFParse } from "pdf-parse";

import { UnsupportedIcBudgetProposalYearError } from "./budget-proposal.errors.js";
import { parseIcBudgetProposal2020 } from "./ic-budget-proposal.parser.js";
import {
  IcBudgetProposalWebsiteSource,
  type BudgetProposalSource,
} from "./ic-budget-proposal.source.js";
import type { BudgetProposal } from "./ic-budget-proposal.types.js";

export type PdfTextExtractor = (data: Uint8Array) => Promise<string>;

export async function extractPdfText(data: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

export class IcBudgetProposalExtractor {
  constructor(
    private readonly source: BudgetProposalSource = new IcBudgetProposalWebsiteSource(),
    private readonly pdfTextExtractor: PdfTextExtractor = extractPdfText,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async extract(year: number): Promise<BudgetProposal> {
    if (year !== 2020) {
      throw new UnsupportedIcBudgetProposalYearError(year);
    }

    const document = await this.source.fetch(year);
    const text = await this.pdfTextExtractor(document.data);
    const items = parseIcBudgetProposal2020(text);

    if (items.length === 0) {
      throw new Error(`No budget proposal items were extracted for ${year}.`);
    }

    return {
      institution: "Instituto de Computação da Unicamp",
      year,
      documentType: "budget_proposal",
      sourceUrl: document.pdfUrl,
      extractedAt: this.now(),
      items,
    };
  }
}
