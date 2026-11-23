import bcrypt from "bcrypt";
import { promises as fs } from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loginUser, registerUser } from "./service.js";

describe("registerUser and persistence structural tests", () => {
  const validUser = {
    name: "Novo Usuario",
    email: "novo@unicamp.br",
    institution: "UNICAMP",
    age: 21,
    gender: "male",
    passwordPlain: "senhaSegura123",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid data before hashing the password", async () => {
    const hash = vi.spyOn(bcrypt, "hash");

    await expect(
      registerUser({
        ...validUser,
        email: "sem-arroba",
      }),
    ).rejects.toThrow("Formato de e-mail inválido");

    expect(hash).not.toHaveBeenCalled();
  });

  it("registers a new user successfully when data is valid and user does not exist", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify([]));
    const writeSpy = vi.spyOn(fs, "writeFile").mockResolvedValue();

    const result = await registerUser(validUser);

    expect(result).toEqual({
      success: true,
      message: "Usuário cadastrado com sucesso",
    });
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  it("rejects registration when a user with the same name already exists", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue(
      JSON.stringify([
        {
          name: validUser.name,
          email: "outro@unicamp.br",
          institution: "UNICAMP",
          age: 25,
          gender: "male",
          passwordHash: "hash",
        },
      ]),
    );

    await expect(registerUser(validUser)).rejects.toThrow(
      "Já existe uma conta com este nome",
    );
  });

  it("rejects registration when a user with the same email already exists", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue(
      JSON.stringify([
        {
          name: "Outro Nome",
          email: validUser.email,
          institution: "UNICAMP",
          age: 25,
          gender: "female",
          passwordHash: "hash",
        },
      ]),
    );

    await expect(registerUser(validUser)).rejects.toThrow(
      "Já existe uma conta com este e-mail",
    );
  });

  it("falls back to an empty list when users.json contains non-object elements or invalid schema", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify([null]));
    vi.spyOn(fs, "writeFile").mockResolvedValue();

    const result = await registerUser(validUser);

    expect(result.success).toBe(true);
  });

  it("falls back to an empty list when users.json has an object with missing fields", async () => {
    vi.spyOn(fs, "readFile").mockResolvedValue(
      JSON.stringify([{ name: "Incompleto" }]),
    );
    vi.spyOn(fs, "writeFile").mockResolvedValue();

    const result = await registerUser(validUser);

    expect(result.success).toBe(true);
  });

  it("handles file read and write errors gracefully without crashing", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(fs, "readFile").mockRejectedValue(new Error("Disk read error"));
    vi.spyOn(fs, "writeFile").mockRejectedValue(new Error("Disk write error"));

    const result = await registerUser(validUser);

    expect(result).toEqual({
      success: true,
      message: "Usuário cadastrado com sucesso",
    });
    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });

  it("allows login using the user name instead of email", async () => {
    const hashedPassword = await bcrypt.hash("senhaSegura123", 10);
    vi.spyOn(fs, "readFile").mockResolvedValue(
      JSON.stringify([
        {
          name: "Usuario Por Nome",
          email: "nome@unicamp.br",
          institution: "UNICAMP",
          age: 22,
          gender: "other",
          passwordHash: hashedPassword,
        },
      ]),
    );

    const result = await loginUser({
      name_email: "Usuario Por Nome",
      passwordPlain: "senhaSegura123",
    });

    expect(result).toEqual({
      success: true,
      message: "Usuário autenticado com sucesso",
    });
  });
});
