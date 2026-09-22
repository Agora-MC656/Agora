import { describe, expect, it } from "vitest";

import {
  findBudgetProposalPdfUrl,
  IcBudgetProposalWebsiteSource,
  IC_DOCUMENTS_PAGE_URL,
  type Fetcher,
} from "./ic-budget-proposal.source.js";

describe("findBudgetProposalPdfUrl", () => {
  it("finds the proposal link by its year and resolves a relative URL", () => {
    const html = `
      <html>
        <body>
          <a href="/documents/proposta-2020.pdf">
            Proposta Orçamentária de 2020
          </a>
        </body>
      </html>
    `;

    const url = findBudgetProposalPdfUrl(html, 2020);

    expect(url.toString()).toBe(
      "https://ic.unicamp.br/documents/proposta-2020.pdf",
    );
  });

  it("rejects proposal links hosted outside the IC website", () => {
    const html = `
      <a href="https://example.com/proposta-2020.pdf">
        Proposta Orçamentária de 2020
      </a>
    `;

    expect(() => findBudgetProposalPdfUrl(html, 2020)).toThrow(
      "Budget proposal PDF has an unexpected host",
    );
  });

  it("fails when the requested year is not published", () => {
    const html = `
      <a href="/documents/proposta-2020.pdf">
        Proposta Orçamentária de 2020
      </a>
    `;

    expect(() => findBudgetProposalPdfUrl(html, 2021)).toThrow(
      "Budget proposal link was not found for year 2021",
    );
  });
});

describe("IcBudgetProposalWebsiteSource", () => {
  it("loads the documents page and then downloads the discovered PDF", async () => {
    const requestedUrls: string[] = [];
    const expectedPdfUrl = "https://ic.unicamp.br/documents/proposta-2020.pdf";

    const fetcher: Fetcher = (input) => {
      const url = input.toString();
      requestedUrls.push(url);

      if (url === IC_DOCUMENTS_PAGE_URL.toString()) {
        return Promise.resolve(
          new Response(
            `<a href="/documents/proposta-2020.pdf">Proposta Orçamentária de 2020</a>`,
            { status: 200 },
          ),
        );
      }

      if (url === expectedPdfUrl) {
        return Promise.resolve(
          new Response("%PDF-1.7 test document", {
            status: 200,
            headers: { "content-type": "application/pdf" },
          }),
        );
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    };

    const source = new IcBudgetProposalWebsiteSource(fetcher);
    const document = await source.fetch(2020);

    expect(requestedUrls).toEqual([
      IC_DOCUMENTS_PAGE_URL.toString(),
      expectedPdfUrl,
    ]);
    expect(document).toMatchObject({
      year: 2020,
      pageUrl: IC_DOCUMENTS_PAGE_URL.toString(),
      pdfUrl: expectedPdfUrl,
    });
    expect(new TextDecoder("ascii").decode(document.data.subarray(0, 4))).toBe(
      "%PDF",
    );
  });
});
