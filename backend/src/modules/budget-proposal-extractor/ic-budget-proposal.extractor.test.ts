import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { IcBudgetProposalExtractor } from "./ic-budget-proposal.extractor.js";
import type { BudgetProposalParser } from "./ic-budget-proposal.parsers.js";
import type { BudgetProposalSource } from "./ic-budget-proposal.source.js";

const pdfSource: BudgetProposalSource = {
  fetch: (year) =>
    Promise.resolve({
      year,
      pageUrl: "https://ic.unicamp.br/sobre/regimentos-normas-e-documentos/",
      pdfUrl: `https://ic.unicamp.br/proposta-${year}.pdf`,
      data: Uint8Array.from([37, 80, 68, 70]),
    }),
};

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

  it("uses the parser registered for the requested year", async () => {
    const parser2021: BudgetProposalParser = {
      year: 2021,
      parse: (text) => [
        {
          section: "Informática",
          subsection: null,
          description: text,
          estimatedAmountCents: 100,
          approvedAmountCents: 50,
          fundingSource: "Unicamp",
          priority: "P1",
        },
      ],
    };
    const extractor = new IcBudgetProposalExtractor(
      pdfSource,
      () => Promise.resolve("Item de 2021"),
      () => new Date("2026-10-24T12:00:00.000Z"),
      [parser2021],
    );

    const proposal = await extractor.extract(2021);

    expect(proposal.year).toBe(2021);
    expect(proposal.items).toEqual([
      expect.objectContaining({ description: "Item de 2021" }),
    ]);
  });

  it("rejects a year that has no registered parser", async () => {
    const extractor = new IcBudgetProposalExtractor(
      {
        fetch: () =>
          Promise.reject(new Error("The source must not be called.")),
      },
      () => Promise.resolve(""),
      () => new Date(),
      [],
    );

    await expect(extractor.extract(2020)).rejects.toThrow(
      "Unsupported IC budget proposal year: 2020",
    );
  });
});
