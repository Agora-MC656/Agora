import { load } from "cheerio";

export const IC_DOCUMENTS_PAGE_URL = new URL(
  "https://ic.unicamp.br/sobre/regimentos-normas-e-documentos/",
);

export type Fetcher = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export type BudgetProposalPdfDocument = {
  year: number;
  pageUrl: string;
  pdfUrl: string;
  data: Uint8Array;
};

export interface BudgetProposalSource {
  fetch(year: number): Promise<BudgetProposalPdfDocument>;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function validatePdfUrl(pdfUrl: URL, pageUrl: URL): void {
  if (pdfUrl.protocol !== "https:") {
    throw new Error(`Budget proposal PDF must use HTTPS: ${pdfUrl}`);
  }

  if (pdfUrl.hostname !== pageUrl.hostname) {
    throw new Error(`Budget proposal PDF has an unexpected host: ${pdfUrl}`);
  }

  if (!pdfUrl.pathname.toLocaleLowerCase().endsWith(".pdf")) {
    throw new Error(`Budget proposal link is not a PDF: ${pdfUrl}`);
  }
}

export function findBudgetProposalPdfUrl(
  html: string,
  year: number,
  pageUrl = IC_DOCUMENTS_PAGE_URL,
): URL {
  const $ = load(html);
  const expectedText = `proposta orcamentaria de ${year}`;

  let matchingHref: string | undefined;

  $("a[href]").each((_, element) => {
    if (matchingHref) {
      return;
    }

    const linkText = normalizeSearchText($(element).text());

    if (!linkText.includes(expectedText)) {
      return;
    }

    matchingHref = $(element).attr("href");
  });

  if (!matchingHref) {
    throw new Error(`Budget proposal link was not found for year ${year}.`);
  }

  const pdfUrl = new URL(matchingHref, pageUrl);
  validatePdfUrl(pdfUrl, pageUrl);

  return pdfUrl;
}

function isPdf(data: Uint8Array): boolean {
  if (data.byteLength < 4) {
    return false;
  }

  return new TextDecoder("ascii").decode(data.subarray(0, 4)) === "%PDF";
}

export class IcBudgetProposalWebsiteSource implements BudgetProposalSource {
  constructor(private readonly fetcher: Fetcher = fetch) {}

  async fetch(year: number): Promise<BudgetProposalPdfDocument> {
    const pageResponse = await this.fetcher(IC_DOCUMENTS_PAGE_URL, {
      headers: { accept: "text/html" },
    });

    if (!pageResponse.ok) {
      throw new Error(
        `Failed to fetch IC documents page: HTTP ${pageResponse.status}.`,
      );
    }

    const html = await pageResponse.text();
    const pdfUrl = findBudgetProposalPdfUrl(html, year);
    const pdfResponse = await this.fetcher(pdfUrl, {
      headers: { accept: "application/pdf" },
    });

    if (!pdfResponse.ok) {
      throw new Error(
        `Failed to fetch budget proposal PDF: HTTP ${pdfResponse.status}.`,
      );
    }

    const data = new Uint8Array(await pdfResponse.arrayBuffer());

    if (!isPdf(data)) {
      throw new Error("Budget proposal response is not a valid PDF.");
    }

    return {
      year,
      pageUrl: IC_DOCUMENTS_PAGE_URL.toString(),
      pdfUrl: pdfUrl.toString(),
      data,
    };
  }
}
