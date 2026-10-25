import bcrypt from "bcrypt";
import { afterEach, describe, expect, it, vi } from "vitest";

import { registerUser } from "./service.js";

describe("registerUser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid data before hashing the password", async () => {
    const hash = vi.spyOn(bcrypt, "hash");

    await expect(
      registerUser({
        name: "Pessoa Teste",
        email: "sem-arroba",
        institution: "IC",
        age: 22,
        gender: "other",
        passwordPlain: "segredo123",
      }),
    ).rejects.toThrow("Invalid email format");
    expect(hash).not.toHaveBeenCalled();
  });
});
