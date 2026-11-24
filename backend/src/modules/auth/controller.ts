import { Request, Response } from "express";
import {
  DuplicateEmailError,
  DuplicateNameError,
  registerUser,
  loginUser,
} from "./service.js";
import { LoginCredentials, UserRegistration } from "./types.js";

export const handleRegister = async (
  req: Request<Record<string, never>, unknown, UserRegistration>,
  res: Response,
) => {
  try {
    const userData = req.body;
    const result = await registerUser(userData);

    res.status(201).json(result);
  } catch (error: unknown) {
    if (
      error instanceof DuplicateNameError ||
      error instanceof DuplicateEmailError
    ) {
      res.status(409).json({
        error: error instanceof Error ? error.message : "Usuário já cadastrado",
      });
      return;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível cadastrar o usuário";
    res.status(400).json({ error: message });
  }
};

export const handleLogin = async (
  req: Request<Record<string, never>, unknown, LoginCredentials>,
  res: Response,
) => {
  const nameEmail =
    typeof req.body?.name_email === "string" ? req.body.name_email.trim() : "";
  const passwordPlain =
    typeof req.body?.passwordPlain === "string" ? req.body.passwordPlain : "";

  if (!nameEmail || !passwordPlain) {
    res.status(400).json({
      error: "Informe o nome ou e-mail e a senha.",
    });
    return;
  }

  try {
    const credentials = { name_email: nameEmail, passwordPlain };
    const result = await loginUser(credentials);

    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error: unknown) {
    console.error("Falha inesperada ao fazer login:", error);
    res.status(500).json({
      error: "Não foi possível processar o login. Tente novamente.",
    });
  }
};
