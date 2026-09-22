import type {
  BudgetProposalItem,
  ParsedBudgetItemLine,
} from "./ic-budget-proposal.types.js";

const ITEM_LINE_PATTERN =
  /^(.+?)\s+(-?\s*R\$\s*[\d.]+,\d{2}\s*-?)\s+(-?\s*R\$\s*[\d.]+,\d{2}\s*-?)\s+(Funcamp\/Unicamp|Funcamp\/Shell|Unicamp|Funcamp|DEPI)\s+(P[1-4]|Edital|Evento|Especial|Bloqueio Judicial)$/;

const SECTION_HEADINGS = new Map<string, string>([
  ["INFORMÁTICA", "Informática"],
  ["APOIO OPERACIONAL", "Apoio Operacional"],
  [
    "OBRAS/Reformas/Serviços Especializados",
    "Obras/Reformas/Serviços Especializados",
  ],
  ["INSTITUCIONAL", "Institucional"],
  ["ATIVIDADES ACADÊMICAS", "Atividades Acadêmicas"],
  ["ADIANTAMENTO", "Adiantamento"],
  ["APORTES ESPECÍFICOS", "Aportes Específicos"],
]);

const SUBSECTION_HEADINGS = new Set([
  "Parque Computacional",
  "Infraestrutura",
  "Apoio ao Ensino",
  "Geral",
  "Contratos",
  "Projetos/Obras",
  "IC 01/02",
  "IC 03/3,5",
  "Manutenção IC-03/3,5",
  "Data Center",
  "Investimento em salas de aula",
  "Manutenção em salas de aula",
  "DESPESAS CENTRALIZADAS",
  "Pós-graduação",
  "Graduação",
  "Atividades Estudantis Extracurriculares",
]);

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function parseBrazilianCurrency(value: string): number {
  const numericValue = value
    .replace(/[^\d.,]/g, "")
    .replaceAll(".", "")
    .replace(",", ".");

  if (numericValue === "") {
    throw new Error(`Invalid Brazilian currency: ${value}`);
  }

  const amount = Number(numericValue);

  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid Brazilian currency: ${value}`);
  }

  return Math.round(amount * 100);
}

export function parseBudgetItemLine(line: string): ParsedBudgetItemLine | null {
  const normalizedLine = normalizeWhitespace(line);
  const match = ITEM_LINE_PATTERN.exec(normalizedLine);

  if (!match) {
    return null;
  }

  const [
    ,
    description = "",
    estimatedAmount = "",
    approvedAmount = "",
    fundingSource = "",
    priority = "",
  ] = match;

  return {
    description,
    estimatedAmountCents: parseBrazilianCurrency(estimatedAmount),
    approvedAmountCents: parseBrazilianCurrency(approvedAmount),
    fundingSource,
    priority,
  };
}

export function parseIcBudgetProposal2020(text: string): BudgetProposalItem[] {
  const items: BudgetProposalItem[] = [];

  let currentSection: string | null = null;
  let currentSubsection: string | null = null;

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = normalizeWhitespace(rawLine);

    if (line === "" || /^-- \d+ of \d+ --$/.test(line)) {
      continue;
    }

    const section = SECTION_HEADINGS.get(line);

    if (section) {
      currentSection = section;
      currentSubsection = null;
      continue;
    }

    // PDF text order places this subsection after "Aportes Específicos",
    // although its items belong to the works section.
    if (line === "IC 4") {
      currentSection = "Obras/Reformas/Serviços Especializados";
      currentSubsection = "IC 4";
      continue;
    }

    if (SUBSECTION_HEADINGS.has(line)) {
      currentSubsection = line;
      continue;
    }

    const parsedItem = parseBudgetItemLine(line);

    if (!parsedItem) {
      continue;
    }

    if (!currentSection) {
      throw new Error(`Budget item found before section: ${line}`);
    }

    items.push({
      section: currentSection,
      subsection: currentSubsection,
      ...parsedItem,
    });
  }

  return items;
}
