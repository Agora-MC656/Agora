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
    expect(response.body).toEqual({ error: "All fields are required" });
  });

  it("rejects a negative age", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, age: -1 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Age must be a positive number" });
  });

  it("rejects a password shorter than 6 characters", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, passwordPlain: "12345" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Password must be at least 6 characters long",
    });
  });

  it("rejects an invalid gender", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, gender: "unknown" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Gender must be male, female, or other",
    });
  });

  it("rejects an email without @", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ ...validRegistration, email: "pessoa.unicamp.br" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid email format" });
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
      message: "User registered successfully",
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

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Failed to register user" });
  });
});

describe("POST /auth/login controller flows", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 when login credentials are valid", async () => {
    const response = await request(app).post("/auth/login").send({
      name_email: "test@unicamp.br",
      passwordPlain: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "User logged in successfully",
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
      message: "User not found",
    });
  });

  it("returns 401 with Error message when loginUser throws an Error instance", async () => {
    vi.spyOn(authService, "loginUser").mockRejectedValue(
      new Error("Unexpected auth failure"),
    );

    const response = await request(app).post("/auth/login").send({
      name_email: "test@unicamp.br",
      passwordPlain: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unexpected auth failure" });
  });

  it("returns 401 with default fallback message when loginUser throws a non-Error value", async () => {
    vi.spyOn(authService, "loginUser").mockRejectedValue("string failure");

    const req = {
      body: { name_email: "test@unicamp.br", passwordPlain: "password123" },
    } as Parameters<typeof handleLogin>[0];

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Parameters<typeof handleLogin>[1];

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Login failed" });
  });
});
