import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { IcBudgetProposalExtractor } from "./ic-budget-proposal.extractor.js";
import type { BudgetProposalSource } from "./ic-budget-proposal.source.js";

const fixtureUrl = new URL(
  "./fixtures/ic-budget-proposal-2020.txt",
  import.meta.url,
);

describe("IcBudgetProposalExtractor", () => {
  it("builds a proposal from a dynamically discovered PDF", async () => {
    const fixtureText = readFileSync(fixtureUrl, "utf8");
    const extractedAt = new Date("2026-09-21T12:00:00.000Z");
    const pdfUrl =
      "https://ic.unicamp.br/wp-content/uploads/2020/04/proposta-2020.pdf";

    const source: BudgetProposalSource = {
      fetch: (year) =>
        Promise.resolve({
          year,
          pageUrl:
            "https://ic.unicamp.br/sobre/regimentos-normas-e-documentos/",
          pdfUrl,
          data: Uint8Array.from([37, 80, 68, 70]),
        }),
    };

    const extractor = new IcBudgetProposalExtractor(
      source,
      () => Promise.resolve(fixtureText),
      () => extractedAt,
    );

    const proposal = await extractor.extract(2020);

    expect(proposal).toMatchObject({
      institution: "Instituto de Computação da Unicamp",
      year: 2020,
      documentType: "budget_proposal",
      sourceUrl: pdfUrl,
      extractedAt,
    });
    expect(proposal.items).toHaveLength(103);
  });

  it("rejects unsupported years before accessing the website", async () => {
    const source: BudgetProposalSource = {
      fetch: () => Promise.reject(new Error("The source must not be called.")),
    };
    const extractor = new IcBudgetProposalExtractor(source);

    await expect(extractor.extract(2021)).rejects.toThrow(
      "Unsupported IC budget proposal year: 2021",
    );
  });
});
