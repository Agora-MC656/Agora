import { describe, expect, it } from "vitest";

import { InMemoryBudgetProposalRepository } from "./budget-proposal.repository.js";
import {
  BudgetProposalService,
  IC_INSTITUTION,
} from "./budget-proposal.service.js";
import type { BudgetProposal } from "./ic-budget-proposal.types.js";

describe("BudgetProposalService", () => {
  it("extracts once and returns the cached proposal afterwards", async () => {
    const repository = new InMemoryBudgetProposalRepository();
    const proposal: BudgetProposal = {
      institution: IC_INSTITUTION,
      year: 2020,
      documentType: "budget_proposal",
      sourceUrl: "https://ic.unicamp.br/proposta-2020.pdf",
      extractedAt: new Date("2026-09-21T12:00:00.000Z"),
      items: [],
    };
    let extractionCount = 0;
    const extractor = {
      extract: () => {
        extractionCount += 1;
        return Promise.resolve(proposal);
      },
    };
    const service = new BudgetProposalService(repository, extractor);

    const firstResult = await service.getIcBudgetProposal(2020);
    const secondResult = await service.getIcBudgetProposal(2020);

    expect(firstResult).toBe(proposal);
    expect(secondResult).toBe(proposal);
    expect(extractionCount).toBe(1);
  });
});
