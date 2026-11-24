import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/api", async () => {
  const actual =
    await vi.importActual<typeof import("../services/api")>("../services/api");
  return {
    ...actual,
    gorillaApi: { getResults: vi.fn(), fetchAndSave: vi.fn() },
  };
});

import {
  ApiError,
  gorillaApi,
  type SocialPost,
  type SocialSearchResults,
} from "../services/api";
import DebatePage, { PAGE_SIZE } from "./DebatePage";

function post(index: number, overrides: Partial<SocialPost> = {}): SocialPost {
  return {
    id: `post-${index}`,
    source: index % 2 === 0 ? "bluesky" : "youtube",
    title: `Publicação ${index}`,
    url: `https://example.org/${index}`,
    author: `autor${index}`,
    body_snippet: `Texto da publicação número ${index}`,
    score: index,
    num_comments: 1,
    created_utc: Date.UTC(2026, 8, 20, 12) / 1000,
    ...overrides,
  };
}

function results(
  posts: SocialPost[],
  query = "orçamento",
): SocialSearchResults {
  return {
    search_id: "busca-1",
    status: "completed",
    query,
    total: posts.length,
    results: posts,
  };
}

const manyPosts = Array.from({ length: PAGE_SIZE + 3 }, (_, i) => post(i));

describe("DebatePage", () => {
  beforeEach(() => {
    vi.mocked(gorillaApi.getResults).mockReset();
    vi.mocked(gorillaApi.fetchAndSave).mockReset();
  });

  it("carrega os resultados salvos e mostra o resumo da busca", async () => {
    vi.mocked(gorillaApi.getResults).mockResolvedValue(
      results([
        post(1, { title: "Debate no IC", body_snippet: "Opinião sobre o IC" }),
        post(2),
      ]),
    );
    render(<DebatePage />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Carregando manifestações",
    );
    expect(await screen.findByText(/Última busca:/)).toHaveTextContent(
      "Última busca: “orçamento”, 2 publicações em Bluesky (1), YouTube (1).",
    );
    expect(
      screen.getByRole("heading", { name: "Debate no IC" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Abrir publicação original" })[0],
    ).toHaveAttribute("href", "https://example.org/1");
    expect(screen.getAllByText("20 de set. de 2026")).toHaveLength(2);
    expect(screen.getByText("1 reações")).toBeInTheDocument();
  });

  it("omite o título quando ele repete o começo do texto", async () => {
    vi.mocked(gorillaApi.getResults).mockResolvedValue(
      results([
        post(1, {
          title: "Texto repetido",
          body_snippet: "Texto repetido e completo",
          created_utc: undefined,
          score: undefined,
          num_comments: undefined,
        }),
      ]),
    );
    render(<DebatePage />);

    expect(
      await screen.findByText("Texto repetido e completo"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Texto repetido" }),
    ).toBeNull();
    expect(screen.queryByText(/reações/)).toBeNull();
  });

  it("pagina e filtra por palavra-chave e fonte", async () => {
    const user = userEvent.setup();
    vi.mocked(gorillaApi.getResults).mockResolvedValue(results(manyPosts));
    render(<DebatePage />);

    expect(
      await screen.findByText(`Mostrando ${PAGE_SIZE} de 15 publicações.`),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(PAGE_SIZE);

    await user.click(screen.getByRole("button", { name: "Mostrar mais" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(15);
    expect(screen.queryByRole("button", { name: "Mostrar mais" })).toBeNull();

    await user.selectOptions(screen.getByLabelText("Fonte"), "youtube");
    expect(
      screen.getByText("7 publicações encontradas. Mostrando 7."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Palavra-chave"), "número 13");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    await user.clear(screen.getByLabelText("Palavra-chave"));
    await user.type(screen.getByLabelText("Palavra-chave"), "inexistente");
    expect(
      screen.getByText("Nenhuma publicação encontrada para esse filtro."),
    ).toBeInTheDocument();
  });

  it("faz uma nova busca e substitui os resultados", async () => {
    const user = userEvent.setup();
    vi.mocked(gorillaApi.getResults).mockResolvedValue(results([post(1)]));
    vi.mocked(gorillaApi.fetchAndSave).mockResolvedValue(
      results([post(7, { title: "Resultado novo" })], "Unicamp"),
    );
    render(<DebatePage />);

    await screen.findByText(/Última busca:/);
    await user.type(screen.getByLabelText("Tema da busca"), "  Unicamp ");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(gorillaApi.fetchAndSave).toHaveBeenCalledWith("Unicamp");
    expect(
      await screen.findByRole("heading", { name: "Resultado novo" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Última busca:/)).toHaveTextContent("“Unicamp”");
  });

  it("valida o tema e mostra erros da nova busca", async () => {
    const user = userEvent.setup();
    vi.mocked(gorillaApi.getResults).mockResolvedValue(results([], ""));
    vi.mocked(gorillaApi.fetchAndSave)
      .mockRejectedValueOnce(
        new ApiError("GORILLA_API_KEY não foi configurada no ambiente.", 500),
      )
      .mockRejectedValueOnce("falha");
    render(<DebatePage />);

    expect(await screen.findByText(/0 publicações em/)).toHaveTextContent(
      "0 publicações em nenhuma fonte.",
    );

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Informe um tema para a nova busca.",
    );
    expect(gorillaApi.fetchAndSave).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Tema da busca"), "Unicamp");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "GORILLA_API_KEY não foi configurada no ambiente.",
    );

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível fazer a busca.",
    );
  });

  it("mostra o erro de carregamento e tenta novamente", async () => {
    const user = userEvent.setup();
    vi.mocked(gorillaApi.getResults)
      .mockRejectedValueOnce(new ApiError("Falha ao ler os dados.", 500))
      .mockRejectedValueOnce("falha")
      .mockResolvedValueOnce(results([post(1)]));
    render(<DebatePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Falha ao ler os dados.",
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar as manifestações públicas.",
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText(/Última busca:/)).toBeInTheDocument();
  });
});
