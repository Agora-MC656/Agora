import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { AuthProvider } from "./AuthContext";

vi.mock("./services/api", async () => {
  const actual =
    await vi.importActual<typeof import("./services/api")>("./services/api");
  return {
    ...actual,
    authApi: {
      register: vi.fn(),
      login: vi.fn(),
    },
  };
});

import { ApiError, authApi } from "./services/api";

function renderApp(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Navegação e layout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renderiza a barra e navega pelas rotas principais", async () => {
    const user = userEvent.setup();
    renderApp("/");

    expect(
      screen.getByRole("navigation", { name: "Navegacao principal" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Orçamento" }));
    expect(
      screen.getByRole("heading", { name: "Orçamento IC" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Votação" }));
    expect(
      screen.getByRole("heading", { name: "Pautas e Votação" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Debate" }));
    expect(
      screen.getByRole("heading", { name: "Opinião Pública" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Entrar" }));
    expect(
      screen.getByRole("heading", { name: "Entrar no Ágora" }),
    ).toBeInTheDocument();
  });
});

describe("Fluxo de autenticação", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(authApi.register).mockReset();
    vi.mocked(authApi.login).mockReset();
  });

  it("cadastra uma conta com sucesso", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockResolvedValue({
      success: true,
      message: "Cadastro realizado.",
    });
    renderApp("/login");

    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    await user.type(screen.getByLabelText("Nome"), "Maria");
    await user.type(screen.getByLabelText("E-mail"), "maria@unicamp.br");
    await user.type(screen.getByLabelText("Instituição"), "IC");
    await user.type(screen.getByLabelText("Idade"), "20");
    await user.selectOptions(screen.getByLabelText("Gênero"), "female");
    await user.type(screen.getByLabelText("Senha"), "segura123");
    await user.click(
      screen.getAllByRole("button", { name: "Cadastrar" }).at(-1)!,
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Cadastro realizado.",
    );
  });

  it("loga, atualiza o contexto e permite sair", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      message: "Login realizado.",
    });
    renderApp("/login");

    await user.type(
      screen.getByLabelText("Nome ou e-mail"),
      "maria@unicamp.br",
    );
    await user.type(screen.getByLabelText("Senha"), "segura123");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);

    expect(
      await screen.findByText("Olá, maria@unicamp.br"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    expect(localStorage.getItem("agora-auth-user")).toBeNull();
  });

  it("restaura o usuário salvo e permite sair pela página de conta", async () => {
    localStorage.setItem("agora-auth-user", "joao@unicamp.br");
    const user = userEvent.setup();
    renderApp("/login");

    expect(
      screen.getByRole("heading", { name: "Conta já conectada" }),
    ).toBeInTheDocument();
    expect(screen.getByText("joao@unicamp.br")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Sair da conta atual" }),
    );

    expect(
      screen.getByRole("heading", { name: "Entrar no Ágora" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("agora-auth-user")).toBeNull();
  });

  it("exibe erro quando o login falha", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError("Nome, e-mail ou senha incorretos.", 401),
    );
    renderApp("/login");

    await user.type(screen.getByLabelText("Nome ou e-mail"), "alguem");
    await user.type(screen.getByLabelText("Senha"), "incorreta");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nome, e-mail ou senha incorretos.",
    );
  });

  it("impede login com credenciais falsas retornadas pela API", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      success: false,
      message: "Credenciais rejeitadas.",
    });
    renderApp("/login");

    await user.type(screen.getByLabelText("Nome ou e-mail"), "alguem");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciais rejeitadas.",
    );
  });

  it("valida idade, e-mail e tamanho da senha no cadastro", async () => {
    const user = userEvent.setup();
    renderApp("/login");

    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    await user.type(screen.getByLabelText("Nome"), "Ana");
    await user.type(screen.getByLabelText("E-mail"), "email-invalido");
    await user.type(screen.getByLabelText("Instituição"), "IC");
    await user.type(screen.getByLabelText("Idade"), "0");
    await user.selectOptions(screen.getByLabelText("Gênero"), "female");
    await user.type(screen.getByLabelText("Senha"), "123");
    const submitButton = screen
      .getAllByRole("button", {
        name: "Cadastrar",
      })
      .at(-1)!;
    fireEvent.submit(submitButton.closest("form")!);

    expect(
      await screen.findByText("Informe uma idade válida maior que zero."),
    ).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it("exibe mensagens específicas para códigos de erro da API", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login)
      .mockRejectedValueOnce(new ApiError("Erro", 400))
      .mockRejectedValueOnce(new ApiError("Erro", 429))
      .mockRejectedValueOnce(new ApiError("Erro", 500));
    renderApp("/login");

    await user.type(screen.getByLabelText("Nome ou e-mail"), "alguem");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Informe o nome ou e-mail e a senha.",
    );

    await user.clear(screen.getByLabelText("Nome ou e-mail"));
    await user.type(screen.getByLabelText("Nome ou e-mail"), "alguem");
    await user.clear(screen.getByLabelText("Senha"));
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Muitas tentativas",
    );

    await user.clear(screen.getByLabelText("Nome ou e-mail"));
    await user.type(screen.getByLabelText("Nome ou e-mail"), "alguem");
    await user.clear(screen.getByLabelText("Senha"));
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível processar o login.",
    );
  });

  it("valida separadamente e-mail e senha no cadastro", async () => {
    const user = userEvent.setup();
    renderApp("/login");

    await user.click(screen.getByRole("button", { name: "Cadastrar" }));
    await user.type(screen.getByLabelText("Nome"), "Ana");
    await user.type(screen.getByLabelText("E-mail"), "email-invalido");
    await user.type(screen.getByLabelText("Instituição"), "IC");
    await user.type(screen.getByLabelText("Idade"), "20");
    await user.selectOptions(screen.getByLabelText("Gênero"), "female");
    await user.type(screen.getByLabelText("Senha"), "segura123");

    const submitButton = screen
      .getAllByRole("button", {
        name: "Cadastrar",
      })
      .at(-1)!;
    fireEvent.submit(submitButton.closest("form")!);
    expect(
      await screen.findByText("Informe um e-mail válido."),
    ).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", { name: /^E-mail/ });
    await user.clear(emailInput);
    await user.type(emailInput, "ana@unicamp.br");
    await user.clear(screen.getByLabelText("Senha"));
    await user.type(screen.getByLabelText("Senha"), "123");
    fireEvent.submit(submitButton.closest("form")!);
    expect(
      await screen.findByText("A senha deve ter pelo menos 6 caracteres."),
    ).toBeInTheDocument();
  });

  it("exibe erros de indisponibilidade e intermediário", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login)
      .mockRejectedValueOnce(new ApiError("Erro", 0))
      .mockRejectedValueOnce(new ApiError("Erro", 502));
    renderApp("/login");

    await user.type(screen.getByLabelText("Nome ou e-mail"), "alguem");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Servidor indisponível",
    );

    await user.clear(screen.getByLabelText("Nome ou e-mail"));
    await user.type(screen.getByLabelText("Nome ou e-mail"), "alguem");
    await user.clear(screen.getByLabelText("Senha"));
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(screen.getAllByRole("button", { name: "Entrar" }).at(-1)!);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível alcançar o backend",
    );
  });
});
