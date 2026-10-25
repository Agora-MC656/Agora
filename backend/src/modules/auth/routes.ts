import { Router, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { handleRegister, handleLogin } from "./controller.js";
import { UserRegistration } from "./types.js";
import { validateRegistration } from "./validation.js";

const router = Router();

// Limits the number of requests to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const validateRegistrationData = (
  req: Request<Record<string, never>, unknown, UserRegistration>,
  res: Response,
  next: NextFunction,
) => {
  const error = validateRegistration(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  next();
};

router.post("/register", validateRegistrationData, handleRegister);

router.post("/login", limiter, handleLogin);

export default router;
