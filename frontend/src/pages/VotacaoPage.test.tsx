import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/api", async () => {
  const actual =
    await vi.importActual<typeof import("../services/api")>("../services/api");
  return {
    ...actual,
    votingApi: {
      listProposals: vi.fn(),
      castVote: vi.fn(),
      getResult: vi.fn(),
    },
  };
});

import { AuthProvider } from "../AuthContext";
import {
  ApiError,
  votingApi,
  type VoteOption,
  type VotingProposalSummary,
} from "../services/api";
import VotacaoPage from "./VotacaoPage";

function proposal(
  overrides: Partial<VotingProposalSummary> = {},
): VotingProposalSummary {
  const id = overrides.id ?? "wifi-ic1-ic2";
  return {
    id,
    title: "Ampliar a rede Wi-Fi dos prédios IC1 e IC2",
    description: "Você apoia ampliar esse investimento?",
    budgetReference: "Informática › Infraestrutura",
    result: { proposalId: id, totals: { sim: 3, nao: 1 }, totalVotes: 4 },
    myVote: null,
    ...overrides,
  };
}

function renderPage(loggedAs?: string) {
  if (loggedAs) {
    localStorage.setItem("agora-auth-user", loggedAs);
  }
  return render(
    <MemoryRouter>
      <AuthProvider>
        <VotacaoPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

function card(title: string) {
  return screen.getByRole("article", { name: title });
}

describe("VotacaoPage", () => {
  beforeEach(() => {
    vi.mocked(votingApi.listProposals).mockReset();
    vi.mocked(votingApi.castVote).mockReset();
  });

  it("mostra as regras, as pautas e a apuração sem exigir login", async () => {
    vi.mocked(votingApi.listProposals).mockResolvedValue([proposal()]);
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("Carregando pautas");
    expect(
      await screen.findByRole("heading", {
        name: "Ampliar a rede Wi-Fi dos prédios IC1 e IC2",
      }),
    ).toBeInTheDocument();
    expect(votingApi.listProposals).toHaveBeenCalledWith(undefined);
    expect(screen.getByText(/uma única vez por pauta/)).toBeInTheDocument();
    expect(screen.getByText("4 votos até agora")).toBeInTheDocument();
    expect(screen.getByText("3 (75%)")).toBeInTheDocument();
    expect(screen.getByText("1 (25%)")).toBeInTheDocument();
    expect(
      screen.getByRole("meter", {
        name: "Sim em Ampliar a rede Wi-Fi dos prédios IC1 e IC2",
      }),
    ).toHaveAttribute("aria-valuenow", "75");
    expect(
      screen.getByRole("link", { name: "Entre no Ágora" }),
    ).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: /Votar/ })).toBeNull();
  });

  it("mostra zero por cento quando a pauta ainda não tem votos", async () => {
    vi.mocked(votingApi.listProposals).mockResolvedValue([
      proposal({
        result: {
          proposalId: "wifi-ic1-ic2",
          totals: { sim: 0, nao: 0 },
          totalVotes: 0,
        },
      }),
    ]);
    renderPage();

    expect(await screen.findByText("0 votos até agora")).toBeInTheDocument();
    expect(screen.getAllByText("0 (0%)")).toHaveLength(2);
  });

  it("usa o singular quando há um único voto", async () => {
    vi.mocked(votingApi.listProposals).mockResolvedValue([
      proposal({
        result: {
          proposalId: "wifi-ic1-ic2",
          totals: { sim: 1, nao: 0 },
          totalVotes: 1,
        },
      }),
    ]);
    renderPage();

    expect(await screen.findByText("1 voto até agora")).toBeInTheDocument();
  });

  it("pede confirmação e registra o voto do usuário logado", async () => {
    const user = userEvent.setup();
    const voted = proposal({
      myVote: "sim",
      result: {
        proposalId: "wifi-ic1-ic2",
        totals: { sim: 4, nao: 1 },
        totalVotes: 5,
      },
    });
    vi.mocked(votingApi.listProposals)
      .mockResolvedValueOnce([proposal()])
      .mockResolvedValueOnce([voted]);
    vi.mocked(votingApi.castVote).mockResolvedValue({
      proposalId: "wifi-ic1-ic2",
      voterId: "maria@unicamp.br",
      option: "sim",
    });
    renderPage("maria@unicamp.br");

    await screen.findByRole("heading", {
      name: "Ampliar a rede Wi-Fi dos prédios IC1 e IC2",
    });
    expect(votingApi.listProposals).toHaveBeenCalledWith("maria@unicamp.br");

    await user.click(screen.getByRole("button", { name: "Votar Sim" }));
    expect(
      screen.getByRole("group", { name: "Confirmar voto" }),
    ).toHaveTextContent("Confirmar voto Sim?");
    expect(votingApi.castVote).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Confirmar voto" }));

    expect(votingApi.castVote).toHaveBeenCalledWith(
      "wifi-ic1-ic2",
      "maria@unicamp.br",
      "sim" satisfies VoteOption,
    );
    expect(await screen.findByText("5 votos até agora")).toBeInTheDocument();
    expect(
      within(card("Ampliar a rede Wi-Fi dos prédios IC1 e IC2")).getByRole(
        "status",
      ),
    ).toHaveTextContent("Participação confirmada: você votou Sim nesta pauta.");
    expect(screen.queryByRole("button", { name: /Votar/ })).toBeNull();
  });

  it("permite cancelar antes de confirmar", async () => {
    const user = userEvent.setup();
    vi.mocked(votingApi.listProposals).mockResolvedValue([proposal()]);
    renderPage("maria@unicamp.br");

    await user.click(await screen.findByRole("button", { name: "Votar Não" }));
    expect(
      screen.getByRole("group", { name: "Confirmar voto" }),
    ).toHaveTextContent("Confirmar voto Não?");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("group", { name: "Confirmar voto" })).toBeNull();
    expect(votingApi.castVote).not.toHaveBeenCalled();
  });

  it("mostra a participação já registrada ao abrir a página", async () => {
    vi.mocked(votingApi.listProposals).mockResolvedValue([
      proposal({ myVote: "nao" }),
    ]);
    renderPage("maria@unicamp.br");

    expect(await screen.findByText(/você votou/)).toHaveTextContent(
      "você votou Não nesta pauta",
    );
    expect(screen.queryByRole("button", { name: /Votar/ })).toBeNull();
  });

  it("mostra o erro do backend e atualiza a pauta", async () => {
    const user = userEvent.setup();
    vi.mocked(votingApi.listProposals)
      .mockResolvedValueOnce([proposal()])
      .mockResolvedValueOnce([proposal({ myVote: "nao" })]);
    vi.mocked(votingApi.castVote).mockRejectedValue(
      new ApiError("O participante ja votou na pauta.", 409),
    );
    renderPage("maria@unicamp.br");

    await user.click(await screen.findByRole("button", { name: "Votar Sim" }));
    await user.click(screen.getByRole("button", { name: "Confirmar voto" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "O participante ja votou na pauta.",
    );
    expect(
      await screen.findByText(/você votou/, { exact: false }),
    ).toHaveTextContent("Não");
  });

  it("usa mensagem padrão quando o voto falha sem detalhes", async () => {
    const user = userEvent.setup();
    vi.mocked(votingApi.listProposals).mockResolvedValue([proposal()]);
    vi.mocked(votingApi.castVote).mockRejectedValue("falha");
    renderPage("maria@unicamp.br");

    await user.click(await screen.findByRole("button", { name: "Votar Sim" }));
    await user.click(screen.getByRole("button", { name: "Confirmar voto" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível registrar o voto.",
    );
  });

  it("informa quando não há pautas abertas", async () => {
    vi.mocked(votingApi.listProposals).mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByText("Nenhuma pauta aberta no momento."),
    ).toBeInTheDocument();
  });

  it("mostra o erro de carregamento e tenta novamente", async () => {
    const user = userEvent.setup();
    vi.mocked(votingApi.listProposals)
      .mockRejectedValueOnce(new ApiError("Servidor indisponível.", 0))
      .mockRejectedValueOnce("falha")
      .mockResolvedValueOnce([proposal()]);
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Servidor indisponível.",
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar as pautas.",
    );

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(
      await screen.findByRole("heading", {
        name: "Ampliar a rede Wi-Fi dos prédios IC1 e IC2",
      }),
    ).toBeInTheDocument();
  });
});
