import { Request, Response } from "express";
import { registerUser, loginUser } from "./service.js";
import { LoginCredentials, UserRegistration } from "./types.js";

export const handleRegister = async (
  req: Request<Record<string, never>, unknown, UserRegistration>,
  res: Response,
) => {
  try {
    const userData = req.body;
    const result = await registerUser(userData);

    res.status(201).json(result);
  } catch {
    res.status(400).json({ error: "Failed to register user" });
  }
};

export const handleLogin = async (
  req: Request<Record<string, never>, unknown, LoginCredentials>,
  res: Response,
) => {
  try {
    const credentials = req.body;
    const result = await loginUser(credentials);

    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(401).json({ error: message });
  }
};
