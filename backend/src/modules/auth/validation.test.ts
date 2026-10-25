import { describe, expect, it } from "vitest";

import type { UserRegistration } from "./types.js";
import { validateRegistration } from "./validation.js";

const valid: UserRegistration = {
  name: "Pessoa Teste",
  email: "pessoa@unicamp.br",
  institution: "IC",
  age: 22,
  gender: "Female",
  passwordPlain: "segredo123",
};

describe("validateRegistration", () => {
  it("accepts a complete and valid registration", () => {
    expect(validateRegistration(valid)).toBeNull();
  });

  it.each([
    [{ ...valid, name: "" }, "All fields are required"],
    [{ ...valid, age: -3 }, "Age must be a positive number"],
    [
      { ...valid, passwordPlain: "12345" },
      "Password must be at least 6 characters long",
    ],
    [{ ...valid, gender: "x" }, "Gender must be male, female, or other"],
    [{ ...valid, email: "sem-arroba" }, "Invalid email format"],
  ])("rejects %o with %s", (data, message) => {
    expect(validateRegistration(data)).toBe(message);
  });

  it("reports the first violated rule", () => {
    expect(
      validateRegistration({ ...valid, age: -1, email: "sem-arroba" }),
    ).toBe("Age must be a positive number");
  });
});
