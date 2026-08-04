import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { emailService } from "../services/email.service.js";
import { AppError } from "../errors/app-error.js";

const testEmailSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  name: z.string().optional().default("Valued Aspirant"),
});

/**
 * Controller to send a test Welcome Email via POST /api/email/test
 */
export async function sendTestEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = testEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstErr = parsed.error.errors[0]?.message || "Invalid payload";
      throw new AppError(firstErr, 400, "VALIDATION_ERROR");
    }

    const { email, name } = parsed.data;

    const result = await emailService.sendWelcomeEmail(email, {
      name,
      loginUrl: "https://studenthub.in/login",
    });

    if (!result.success) {
      throw new AppError(
        result.error || "Failed to send email. Please check server logs.",
        500,
        "EMAIL_SEND_FAILED",
      );
    }

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    next(err);
  }
}
