import { describe, expect, it } from "vitest";

import type { BudgetProposalItem } from "../services/api";
import {
  SECTION_GUIDE,
  approvalRate,
  filterItems,
  formatCurrency,
  formatPercent,
  sumItems,
  summarizeBySection,
} from "./budgetSummary";

function item(overrides: Partial<BudgetProposalItem>): BudgetProposalItem {
  return {
    section: "Informática",
    subsection: "Parque Computacional",
    description: "Item",
    estimatedAmountCents: 0,
    approvedAmountCents: 0,
    fundingSource: "Unicamp",
    priority: "P1",
    ...overrides,
  };
}

const items: BudgetProposalItem[] = [
  item({
    description: "Atualização de servidores",
    estimatedAmountCents: 19_500_000,
    approvedAmountCents: 6_000_000,
  }),
  item({
    subsection: "Infraestrutura",
    description: "Wifi IC1 e IC2",
    estimatedAmountCents: 960_000,
    approvedAmountCents: 960_000,
  }),
  item({
    section: "Atividades Acadêmicas",
    subsection: "Graduação",
    description: "Olimpíada e Maratonas",
    estimatedAmountCents: 400_000,
    approvedAmountCents: 400_000,
    priority: "Evento",
  }),
  item({
    section: "Adiantamento",
    subsection: null,
    description: "FUNCAMP",
    estimatedAmountCents: 3_000_000,
    approvedAmountCents: 3_000_000,
    fundingSource: "Funcamp",
  }),
];

describe("formatação", () => {
  it("formata centavos como reais", () => {
    expect(formatCurrency(19_500_000)).toBe("R$ 195.000,00");
    expect(formatCurrency(4)).toBe("R$ 0,04");
  });

  it("formata frações como porcentagem com uma casa decimal", () => {
    expect(formatPercent(0.4567)).toBe("45,7%");
    expect(formatPercent(1)).toBe("100%");
  });
});

describe("sumItems", () => {
  it("soma quantidade, estimativa e aprovado", () => {
    expect(sumItems(items)).toEqual({
      itemCount: 4,
      estimatedCents: 23_860_000,
      approvedCents: 10_360_000,
    });
  });

  it("retorna zeros para uma lista vazia", () => {
    expect(sumItems([])).toEqual({
      itemCount: 0,
      estimatedCents: 0,
      approvedCents: 0,
    });
  });
});

describe("approvalRate", () => {
  it("divide o aprovado pelo estimado", () => {
    expect(
      approvalRate({ itemCount: 1, estimatedCents: 200, approvedCents: 50 }),
    ).toBe(0.25);
  });

  it("retorna zero quando nada foi estimado", () => {
    expect(
      approvalRate({ itemCount: 0, estimatedCents: 0, approvedCents: 0 }),
    ).toBe(0);
  });
});

describe("summarizeBySection", () => {
  it("agrupa por seção mantendo a ordem do documento", () => {
    expect(summarizeBySection(items)).toEqual([
      {
        section: "Informática",
        itemCount: 2,
        estimatedCents: 20_460_000,
        approvedCents: 6_960_000,
      },
      {
        section: "Atividades Acadêmicas",
        itemCount: 1,
        estimatedCents: 400_000,
        approvedCents: 400_000,
      },
      {
        section: "Adiantamento",
        itemCount: 1,
        estimatedCents: 3_000_000,
        approvedCents: 3_000_000,
      },
    ]);
  });
});

describe("filterItems", () => {
  it("retorna todos os itens sem filtro", () => {
    expect(filterItems(items, { section: "", query: "" })).toHaveLength(4);
  });

  it("filtra pela seção exata", () => {
    expect(
      filterItems(items, { section: "Informática", query: "" }).map(
        ({ description }) => description,
      ),
    ).toEqual(["Atualização de servidores", "Wifi IC1 e IC2"]);
  });

  it("busca sem diferenciar maiúsculas nem acentos", () => {
    expect(
      filterItems(items, { section: "", query: "  OLIMPIADA " }).map(
        ({ description }) => description,
      ),
    ).toEqual(["Olimpíada e Maratonas"]);
  });

  it("busca também na subseção", () => {
    expect(
      filterItems(items, { section: "", query: "infraestrutura" }).map(
        ({ description }) => description,
      ),
    ).toEqual(["Wifi IC1 e IC2"]);
  });

  it("combina seção e texto", () => {
    expect(
      filterItems(items, { section: "Adiantamento", query: "servidores" }),
    ).toEqual([]);
  });
});

describe("SECTION_GUIDE", () => {
  it("explica as sete seções da proposta de 2020", () => {
    expect(Object.keys(SECTION_GUIDE)).toEqual([
      "Informática",
      "Apoio Operacional",
      "Obras/Reformas/Serviços Especializados",
      "Institucional",
      "Atividades Acadêmicas",
      "Adiantamento",
      "Aportes Específicos",
    ]);
  });
});
