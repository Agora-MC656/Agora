import { Request, Response } from 'express';
import { registerUser, loginUser } from './service.js';

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const result = await registerUser(userData);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed to register user' });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const credentials = req.body;
    const result = await loginUser(credentials);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};