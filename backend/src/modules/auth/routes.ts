import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { handleRegister, handleLogin } from './controller.js';

const router = Router();

// Limits the number of requests to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

//
const validateRegistrationData = (req: Request, res: Response, next: NextFunction ) => {
    const { name, email, institution, age, gender, passwordPlain } = req.body;

    if (!name || !email || !institution || !age || !gender || !passwordPlain) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (age < 0) {
        return res.status(400).json({ error: 'Age must be a positive number' });
    }

    if (!passwordPlain || passwordPlain.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    next();
};

router.post('/register', validateRegistrationData, handleRegister);

router.post('/login', limiter, handleLogin);

export default router;