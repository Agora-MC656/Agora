import type { BudgetProposalItem } from "../services/api";

export type BudgetTotals = {
  itemCount: number;
  estimatedCents: number;
  approvedCents: number;
};

export type SectionSummary = BudgetTotals & {
  section: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/** Fração aprovada do valor estimado; zero quando nada foi estimado. */
export function approvalRate(totals: BudgetTotals): number {
  return totals.estimatedCents === 0
    ? 0
    : totals.approvedCents / totals.estimatedCents;
}

export function formatPercent(rate: number): string {
  return percentFormatter.format(rate);
}

export function sumItems(items: readonly BudgetProposalItem[]): BudgetTotals {
  return items.reduce<BudgetTotals>(
    (totals, item) => ({
      itemCount: totals.itemCount + 1,
      estimatedCents: totals.estimatedCents + item.estimatedAmountCents,
      approvedCents: totals.approvedCents + item.approvedAmountCents,
    }),
    { itemCount: 0, estimatedCents: 0, approvedCents: 0 },
  );
}

/** Agrupa os itens por seção, na ordem em que as seções aparecem no documento. */
export function summarizeBySection(
  items: readonly BudgetProposalItem[],
): SectionSummary[] {
  const groups = new Map<string, BudgetProposalItem[]>();
  for (const item of items) {
    const group = groups.get(item.section);
    if (group) {
      group.push(item);
    } else {
      groups.set(item.section, [item]);
    }
  }

  return [...groups].map(([section, sectionItems]) => ({
    section,
    ...sumItems(sectionItems),
  }));
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/-/g, "")
    .toLocaleLowerCase("pt-BR");
}

export type ItemFilter = {
  section: string;
  query: string;
};

/**
 * Filtra por seção (vazio = todas) e por texto na descrição ou subseção.
 * Cada palavra da busca precisa aparecer, ignorando acentos e hífens.
 */
export function filterItems(
  items: readonly BudgetProposalItem[],
  { section, query }: ItemFilter,
): BudgetProposalItem[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (section && item.section !== section) {
      return false;
    }
    if (terms.length === 0) {
      return true;
    }
    const text = normalize(`${item.description} ${item.subsection ?? ""}`);
    return terms.every((term) => text.includes(term));
  });
}

/**
 * Explicações em linguagem simples das seções da proposta orçamentária do IC,
 * escritas a partir dos itens listados em cada seção do documento.
 */
export const SECTION_GUIDE: Readonly<Record<string, string>> = {
  Informática:
    "Equipamentos e serviços de tecnologia: servidores, discos, laboratórios de ensino, rede, Wi-Fi e recursos das salas de aula.",
  "Apoio Operacional":
    "Funcionamento do dia a dia dos prédios: materiais, manutenção predial, contratos como elevador, zeladoria e resíduos, e projetos de obras.",
  "Obras/Reformas/Serviços Especializados":
    "Reformas e serviços nos prédios do IC: instalações elétricas, pintura, climatização, Data Center e melhorias nas salas de aula.",
  Institucional:
    "Despesas administrativas do instituto, como bancas de concurso, estagiários, almoxarifado, correio, telefonia e transporte.",
  "Atividades Acadêmicas":
    "Apoio direto a estudantes e eventos: viagens e hospedagem da pós-graduação, eventos da graduação, olimpíadas, maratonas e atividades estudantis.",
  Adiantamento:
    "Valores reservados para despesas pequenas e imediatas, separados por fonte (Unicamp e Funcamp).",
  "Aportes Específicos":
    "Despesas de grande porte listadas à parte, como pessoal, limpeza, locação de impressoras e o prédio IC 04. Concentram a maior parte do valor total.",
};
