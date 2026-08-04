import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { validateRequest, createRateLimiter, authenticate } from "../middlewares/index.js";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const authService = new AuthService(userRepository, refreshTokenRepository);
const authController = new AuthController(authService);

// 5 authentication attempts per 15 minutes limit per IP
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  code: "AUTH_RATE_LIMIT_EXCEEDED",
  message: "Too many login or registration attempts. Please try again in 15 minutes.",
});

export const authRouter: Router = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  asyncHandler(authController.register),
);

authRouter.post("/verify-otp", asyncHandler(authController.verifyOtpHandler));
authRouter.post("/resend-otp", asyncHandler(authController.resendOtpHandler));
authRouter.post("/forgot-password-otp", asyncHandler(authController.forgotPasswordOtpHandler));
authRouter.post("/verify-reset-otp", asyncHandler(authController.verifyResetOtpHandler));

authRouter.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  asyncHandler(authController.login),
);

authRouter.get("/me", authenticate, asyncHandler(authController.me));

authRouter.post("/refresh", asyncHandler(authController.refresh));

authRouter.post("/logout", asyncHandler(authController.logout));
