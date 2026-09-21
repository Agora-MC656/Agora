import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./app.js";

describe("auth routes", () => {
  it("rejects incomplete registration through the app", async () => {
    const response = await request(app).post("/auth/register").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "All fields are required" });
  });

  it("accepts valid login through the app", async () => {
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

  it("returns 401 for an invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      name_email: "test@unicamp.br",
      passwordPlain: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid password",
    });
  });

  it("returns 401 for an unknown user", async () => {
    const response = await request(app).post("/auth/login").send({
      name_email: "unknown@unicamp.br",
      passwordPlain: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "User not found",
    });
  });
});
