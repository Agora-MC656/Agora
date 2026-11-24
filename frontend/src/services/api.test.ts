import { afterEach, describe, expect, it, vi } from "vitest";

import {
  authApi,
  generateAgenda,
  getIcBudgetProposal,
  gorillaApi,
  votingApi,
} from "./api";

function mockResponse(
  status: number,
  body: unknown,
  ok = status >= 200 && status < 300,
) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("camada de API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("envia JSON e o token de autenticação", async () => {
    localStorage.setItem("agora-auth-token", "token-teste");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, { success: true, message: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await authApi.login({
      name_email: "maria",
      passwordPlain: "segura123",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe("/auth/login");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token-teste");
  });

  it("lança ApiError para respostas HTTP com falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          mockResponse(
            401,
            { error: "Nome, e-mail ou senha incorretos." },
            false,
          ),
        ),
    );

    await expect(
      authApi.login({
        name_email: "maria",
        passwordPlain: "incorreta",
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Nome, e-mail ou senha incorretos.",
        status: 401,
      }),
    );
  });

  it("não envia Authorization nem Content-Type sem token ou corpo", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(200, {
        institution: "IC",
        year: 2026,
        documentType: "budget_proposal",
        sourceUrl: "",
        extractedAt: "",
        items: [],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getIcBudgetProposal(2026);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.has("Authorization")).toBe(false);
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("mantém headers personalizados e envia o body do registro", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, { success: true, message: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await authApi.register({
      name: "Maria",
      email: "maria@unicamp.br",
      institution: "IC",
      age: 20,
      gender: "female",
      passwordPlain: "segura123",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/auth/register");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(
      JSON.stringify({
        name: "Maria",
        email: "maria@unicamp.br",
        institution: "IC",
        age: 20,
        gender: "female",
        passwordPlain: "segura123",
      }),
    );
  });

  it.each([
    [400, "Os dados informados para o login são inválidos."],
    [401, "Nome, e-mail ou senha incorretos."],
    [
      429,
      "Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.",
    ],
    [500, "Não foi possível processar o login. Tente novamente."],
    [
      502,
      "O servidor intermediário não conseguiu alcançar o backend. Inicie o backend e tente novamente.",
    ],
    [418, "Erro na requisicao (418)"],
  ])("usa mensagem padrão para resposta HTTP %i", async (status, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(status, null, false)),
    );

    await expect(
      authApi.login({
        name_email: "maria",
        passwordPlain: "senha",
      }),
    ).rejects.toMatchObject({ message, status });
  });

  it("usa message e error enviados pelo backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          mockResponse(401, { message: "Mensagem da API" }, false),
        )
        .mockResolvedValueOnce(
          mockResponse(401, { error: "Erro da API" }, false),
        ),
    );

    await expect(
      authApi.login({ name_email: "a", passwordPlain: "b" }),
    ).rejects.toMatchObject({ message: "Mensagem da API", status: 401 });
    await expect(
      authApi.login({ name_email: "a", passwordPlain: "b" }),
    ).rejects.toMatchObject({ message: "Erro da API", status: 401 });
  });

  it("converte falha de rede em ApiError com status zero", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(
      authApi.login({ name_email: "a", passwordPlain: "b" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      message:
        "Não foi possível contactar o servidor. Verifique se o backend está em execução na porta 3000.",
      status: 0,
    });
  });

  it("aceita resposta HTTP sem JSON válido", async () => {
    const response = {
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError("invalid json")),
    } as unknown as Response;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    await expect(getIcBudgetProposal(2026)).resolves.toBeNull();
  });

  it("cobre endpoints auxiliares e a codificação de parâmetros", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);

    await gorillaApi.getResults();
    await gorillaApi.fetchAndSave("orçamento");
    await generateAgenda("planejamento");
    await votingApi.castVote("proposta 1", "voter/1", "sim");
    await votingApi.getResult("proposta 1");

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock.mock.calls[3][0]).toContain("proposta%201");
    expect(fetchMock.mock.calls[4][0]).toContain("proposta%201");
  });

  it("lista as pautas com ou sem o participante", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, []));
    vi.stubGlobal("fetch", fetchMock);

    await votingApi.listProposals();
    await votingApi.listProposals("maria@unicamp.br");

    expect(fetchMock.mock.calls[0][0]).toBe("/voting/proposals");
    expect(fetchMock.mock.calls[1][0]).toBe(
      "/voting/proposals?voterId=maria%40unicamp.br",
    );
  });
});
