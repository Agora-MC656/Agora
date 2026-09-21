import { Request, Response } from 'express';
import { registerUser } from './service';

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const result = await registerUser(userData);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};