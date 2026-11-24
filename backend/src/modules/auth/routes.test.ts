import express from "express";
import { promises as fs } from "fs";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleLogin } from "./controller.js";
import authRouter from "./routes.js";
import * as authService from "./service.js";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

const validRegistration = {
  name: "Pessoa Teste",
  email: "pessoa@unicamp.br",
  institution: "IC",
  age: 22,
  gender: "other",
  passwordPlain: "segredo123",
};

describe("POST /auth/register validation and controller flows", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["name", { ...validRegistration, name: "" }],
    ["email", { ...validRegistration, email: "" }],
    ["institution", { ...validRegistration, institution: "" }],
    ["age", { ...validRegistration, age: 0 }],
    ["gender", { ...validRegistration, gender: "" }],
    ["passwordPlain", { ...validRegistration, passwordPlain: "" }],
  ])("rejects a registration without %s", async (_field, body) => {
    const response = await request(app).post("/auth/register").send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Todos os campos são obrigatórios",
    });
  });

  it("rejects a negative age", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, age: -1 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "A idade deve ser um número positivo",
    });
  });

  it("rejects a password shorter than 6 characters", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, passwordPlain: "12345" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "A senha deve ter pelo menos 6 caracteres",
    });
  });

  it("rejects an invalid gender", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, gender: "unknown" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "O gênero deve ser masculino, feminino ou outro",
    });
  });

  it("rejects an email without @", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, email: "pessoa.unicamp.br" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Formato de e-mail inválido" });
  });

  it("returns 201 when valid registration passes middleware and succeeds in service", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify([]));
    vi.spyOn(fs, "writeFile").mockResolvedValue();

    const response = await request(app)
      .post("/auth/register")
      .send(validRegistration);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Usuário cadastrado com sucesso",
    });
  });

  it("returns 400 when service throws an error during registration (e.g., duplicate user)", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue(
      JSON.stringify([
        {
          name: validRegistration.name,
          email: validRegistration.email,
          institution: "IC",
          age: 22,
          gender: "other",
          passwordHash: "hash",
        },
      ]),
    );

    const response = await request(app)
      .post("/auth/register")
      .send(validRegistration);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "Já existe uma conta com este nome",
    });
  });
});

describe("POST /auth/login controller flows", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when the login fields are missing", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Informe o nome ou e-mail e a senha.",
    });
  });

  it("returns 200 when login credentials are valid", async () => {
    const response = await request(app).post("/auth/login").send({
      name_email: "test@unicamp.br",
      passwordPlain: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Usuário autenticado com sucesso",
    });
  });

  it("returns 401 when loginUser returns success: false", async () => {
    const response = await request(app).post("/auth/login").send({
      name_email: "ghost@unicamp.br",
      passwordPlain: "wrong",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Nome, e-mail ou senha incorretos",
    });
  });

  it("returns 500 when loginUser throws an unexpected Error", async () => {
    vi.spyOn(authService, "loginUser").mockRejectedValue(
      new Error("Unexpected auth failure"),
    );

    const response = await request(app).post("/auth/login").send({
      name_email: "test@unicamp.br",
      passwordPlain: "password123",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Não foi possível processar o login. Tente novamente.",
    });
  });

  it("returns 500 with a safe message when loginUser throws a non-Error value", async () => {
    vi.spyOn(authService, "loginUser").mockRejectedValue("string failure");

    const req = {
      body: { name_email: "test@unicamp.br", passwordPlain: "password123" },
    } as Parameters<typeof handleLogin>[0];

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as unknown as Parameters<
      typeof handleLogin
    >[1];

    await handleLogin(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: "Não foi possível processar o login. Tente novamente.",
    });
  });

  it("returns 429 after repeated login attempts", async () => {
    let response = await request(app).post("/auth/login").send({
      name_email: "ghost@unicamp.br",
      passwordPlain: "wrong",
    });

    for (let attempt = 0; attempt < 10 && response.status !== 429; attempt++) {
      response = await request(app).post("/auth/login").send({
        name_email: "ghost@unicamp.br",
        passwordPlain: "wrong",
      });
    }

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      error:
        "Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.",
    });
  });
});
