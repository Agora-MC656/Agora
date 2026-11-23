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
    return "Todos os campos são obrigatórios";
  }

  if (age < 0) {
    return "A idade deve ser um número positivo";
  }

  if (passwordPlain.length < MIN_PASSWORD_LENGTH) {
    return "A senha deve ter pelo menos 6 caracteres";
  }

  if (!ALLOWED_GENDERS.includes(gender.toLowerCase())) {
    return "O gênero deve ser masculino, feminino ou outro";
  }

  if (!email.includes("@")) {
    return "Formato de e-mail inválido";
  }

  return null;
}
