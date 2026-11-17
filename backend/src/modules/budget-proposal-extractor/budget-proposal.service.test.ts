import { describe, expect, it, vi } from "vitest";

import { InMemoryBudgetProposalRepository } from "./budget-proposal.repository.js";
import {
  BudgetProposalService,
  IC_INSTITUTION,
} from "./budget-proposal.service.js";
import type { BudgetProposal } from "./ic-budget-proposal.types.js";

function makeProposal(year: number): BudgetProposal {
  return {
    institution: IC_INSTITUTION,
    year,
    documentType: "budget_proposal",
    sourceUrl: `https://ic.unicamp.br/proposta-${year}.pdf`,
    extractedAt: new Date("2026-09-21T12:00:00.000Z"),
    items: [],
  };
}

describe("BudgetProposalService", () => {
  it("extracts once and returns the cached proposal afterwards", async () => {
    const repository = new InMemoryBudgetProposalRepository();
    const proposal = makeProposal(2020);
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

  it("shares concurrent extractions for the same year only", async () => {
    const repository = new InMemoryBudgetProposalRepository();
    const proposal2020 = makeProposal(2020);
    const proposal2021 = makeProposal(2021);
    const extract = vi.fn((year: number) =>
      Promise.resolve(year === 2020 ? proposal2020 : proposal2021),
    );
    const service = new BudgetProposalService(repository, { extract });

    const [first, second, otherYear] = await Promise.all([
      service.getIcBudgetProposal(2020),
      service.getIcBudgetProposal(2020),
      service.getIcBudgetProposal(2021),
    ]);

    expect(first).toBe(proposal2020);
    expect(second).toBe(proposal2020);
    expect(otherYear).toBe(proposal2021);
    expect(extract).toHaveBeenCalledTimes(2);
    expect(extract).toHaveBeenCalledWith(2020);
    expect(extract).toHaveBeenCalledWith(2021);
  });

  it("allows a new extraction after the shared attempt fails", async () => {
    const repository = new InMemoryBudgetProposalRepository();
    const error = new Error("PDF indisponível");
    const proposal = makeProposal(2020);
    const extract = vi
      .fn<(year: number) => Promise<BudgetProposal>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(proposal);
    const service = new BudgetProposalService(repository, { extract });

    const results = await Promise.allSettled([
      service.getIcBudgetProposal(2020),
      service.getIcBudgetProposal(2020),
    ]);

    expect(results).toEqual([
      { status: "rejected", reason: error },
      { status: "rejected", reason: error },
    ]);
    expect(extract).toHaveBeenCalledTimes(1);
    await expect(service.getIcBudgetProposal(2020)).resolves.toBe(proposal);
    expect(extract).toHaveBeenCalledTimes(2);
  });
});
