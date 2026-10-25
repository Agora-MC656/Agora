import type { UserRegistration } from "./types.js";

const ALLOWED_GENDERS = ["male", "female", "other"];
const MIN_PASSWORD_LENGTH = 6;

/**
 * Regras do cadastro de usuários, usadas pela rota e pelo serviço.
 * Retorna a mensagem da primeira regra violada, ou null se os dados forem válidos.
 */
export function validateRegistration(data: UserRegistration): string | null {
  const { name, email, institution, age, gender, passwordPlain } = data;

  if (!name || !email || !institution || !age || !gender || !passwordPlain) {
    return "All fields are required";
  }

  if (age < 0) {
    return "Age must be a positive number";
  }

  if (passwordPlain.length < MIN_PASSWORD_LENGTH) {
    return "Password must be at least 6 characters long";
  }

  if (!ALLOWED_GENDERS.includes(gender.toLowerCase())) {
    return "Gender must be male, female, or other";
  }

  if (!email.includes("@")) {
    return "Invalid email format";
  }

  return null;
}
