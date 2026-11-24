import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/api", async () => {
  const actual =
    await vi.importActual<typeof import("../services/api")>("../services/api");
  return { ...actual, getIcBudgetProposal: vi.fn() };
});

import {
  ApiError,
  getIcBudgetProposal,
  type BudgetProposal,
  type BudgetProposalItem,
} from "../services/api";
import OrcamentoPage, { BUDGET_YEAR } from "./OrcamentoPage";

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

const proposal: BudgetProposal = {
  institution: "Instituto de Computação da Unicamp",
  year: 2020,
  documentType: "budget_proposal",
  sourceUrl: "https://ic.unicamp.br/proposta-2020.pdf",
  extractedAt: "2026-11-23T12:00:00.000Z",
  items: [
    item({
      description: "Atualização de servidores",
      estimatedAmountCents: 19_500_000,
      approvedAmountCents: 6_000_000,
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
      section: "Aportes Específicos",
      subsection: null,
      description: "Pessoal e Reflexos",
      estimatedAmountCents: 2_044_131_600,
      approvedAmountCents: 2_044_131_600,
    }),
  ],
};

function chartSections() {
  return within(screen.getByRole("list", { name: "Valores por seção" }))
    .getAllByRole("listitem")
    .map((entry) => entry.textContent);
}

describe("OrcamentoPage", () => {
  beforeEach(() => {
    vi.mocked(getIcBudgetProposal).mockReset();
  });

  it("mostra o carregamento e depois o resumo da proposta", async () => {
    vi.mocked(getIcBudgetProposal).mockResolvedValue(proposal);
    render(<OrcamentoPage />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando a proposta orçamentária",
    );
    expect(getIcBudgetProposal).toHaveBeenCalledWith(BUDGET_YEAR);

    expect(await screen.findByText("Total estimado")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("R$ 20.640.316,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 20.505.316,00")).toBeInTheDocument();
    expect(screen.getByText("99,3%")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "documento original no site do IC" }),
    ).toHaveAttribute("href", proposal.sourceUrl);
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("explica cada seção com sua participação no total aprovado", async () => {
    vi.mocked(getIcBudgetProposal).mockResolvedValue(proposal);
    render(<OrcamentoPage />);

    expect(
      await screen.findByText(/Apoio direto a estudantes e eventos/),
    ).toBeInTheDocument();
    expect(screen.getByText("(1 item, 0% do total aprovado)")).toBeVisible();
  });

  it("permite tirar a maior seção do gráfico para comparar as demais", async () => {
    const user = userEvent.setup();
    vi.mocked(getIcBudgetProposal).mockResolvedValue(proposal);
    render(<OrcamentoPage />);

    await screen.findByText("Total estimado");
    expect(chartSections()).toHaveLength(3);

    await user.click(
      screen.getByRole("checkbox", {
        name: "Incluir Aportes Específicos no gráfico",
      }),
    );

    expect(chartSections()).toHaveLength(2);
    expect(chartSections().join(" ")).not.toContain("Aportes Específicos");
  });

  it("filtra a tabela por seção e por texto", async () => {
    const user = userEvent.setup();
    vi.mocked(getIcBudgetProposal).mockResolvedValue(proposal);
    render(<OrcamentoPage />);

    await screen.findByText("Total estimado");
    await user.selectOptions(
      screen.getByLabelText("Seção"),
      "Atividades Acadêmicas",
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(
      screen.getByRole("cell", { name: "Olimpíada e Maratonas" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 item, somando R\$ 4\.000,00/)).toBeVisible();

    await user.type(screen.getByLabelText("Buscar item"), "servidores");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByText("Nenhum item encontrado para esse filtro."),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Seção"), "");
    expect(
      screen.getByRole("cell", { name: "Atualização de servidores" }),
    ).toBeInTheDocument();
  });

  it("mostra o erro e tenta carregar novamente", async () => {
    const user = userEvent.setup();
    vi.mocked(getIcBudgetProposal)
      .mockRejectedValueOnce(new ApiError("Falha ao ler o PDF.", 500))
      .mockResolvedValueOnce(proposal);
    render(<OrcamentoPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Falha ao ler o PDF.",
    );

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Total estimado")).toBeInTheDocument();
    expect(getIcBudgetProposal).toHaveBeenCalledTimes(2);
  });

  it("usa uma mensagem padrão para erros desconhecidos", async () => {
    vi.mocked(getIcBudgetProposal).mockRejectedValue("falha");
    render(<OrcamentoPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar a proposta orçamentária.",
    );
  });
});
