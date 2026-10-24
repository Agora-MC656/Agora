import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import authRouter from "./routes.js";

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

describe("POST /auth/register validation", () => {
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
});
