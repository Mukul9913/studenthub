import crypto from "node:crypto";
import { UserModel } from "../models/user.model.js";
import { sendEmail } from "./email/email.service.js";
import {
  renderOtpEmailTemplate,
  renderVerificationSuccessEmailTemplate,
} from "./email/email.templates.js";
import { AppError } from "../errors/app-error.js";
import { pinoLogger } from "../utils/logger.js";
import { env } from "../config/env.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 Minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 Seconds
const MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically random 6-digit numeric OTP.
 */
export function generateOtp(): string {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

/**
 * Hash raw OTP code using SHA-256 for secure storage.
 */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Generate and send 6-digit OTP to user via SMTP email.
 */
export async function sendOtp(
  email: string,
  purpose: "VERIFY_EMAIL" | "FORGOT_PASSWORD" = "VERIFY_EMAIL",
): Promise<{ success: boolean; resendAfterSeconds: number }> {
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select(
    "+emailOtpHash +emailOtpExpiresAt +emailOtpResendAfter +emailOtpAttempts",
  );

  if (!user) {
    throw new AppError("User account not found", 404, "USER_NOT_FOUND");
  }

  // Check 60-second resend cooldown
  const now = new Date();
  if (user.emailOtpResendAfter && user.emailOtpResendAfter > now) {
    const remainingMs = user.emailOtpResendAfter.getTime() - now.getTime();
    const remainingSecs = Math.ceil(remainingMs / 1000);
    throw new AppError(
      `Please wait ${remainingSecs} seconds before requesting another OTP`,
      429,
      "OTP_COOLDOWN_ACTIVE",
    );
  }

  const rawOtp = generateOtp();
  const hashedOtp = hashOtp(rawOtp);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);
  const resendAfter = new Date(now.getTime() + OTP_RESEND_COOLDOWN_MS);

  user.emailOtpHash = hashedOtp;
  user.emailOtpExpiresAt = expiresAt;
  user.emailOtpResendAfter = resendAfter;
  user.emailOtpAttempts = 0;
  await user.save();

  // Development aid: always log OTP so local testing works even if Gmail blocks SMTP
  if (env.NODE_ENV !== "production") {
    pinoLogger.warn(
      { email: user.email, purpose, otp: rawOtp },
      `[DEV] OTP for ${user.email}: ${rawOtp} (also attempting SMTP email)`,
    );
  }

  try {
    const html = renderOtpEmailTemplate(user.firstName || "User", rawOtp, purpose);
    const subject =
      purpose === "VERIFY_EMAIL"
        ? "Verify Your Email - StudentHub OTP Code"
        : "Reset Your Password - StudentHub OTP Code";

    await sendEmail({
      to: user.email,
      subject,
      html,
    });

    pinoLogger.info({ email: user.email, purpose }, "OTP email dispatched successfully");
  } catch (err) {
    pinoLogger.error(
      { email: user.email, purpose, err },
      "OTP email SMTP send failed — use DEV OTP from logs if in development",
    );
    // In development, OTP is still valid (stored in DB) even if email fails
    if (env.NODE_ENV === "production") {
      throw err;
    }
  }

  return {
    success: true,
    resendAfterSeconds: 60,
  };
}

/**
 * Verify submitted OTP against stored hash.
 */
export async function verifyOtp(
  email: string,
  submittedOtp: string,
): Promise<{ success: boolean; user: InstanceType<typeof UserModel> }> {
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select(
    "+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts",
  );

  if (!user) {
    throw new AppError("User account not found", 404, "USER_NOT_FOUND");
  }

  if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
    throw new AppError(
      "No active OTP request found. Please request a new OTP",
      400,
      "NO_ACTIVE_OTP",
    );
  }

  const now = new Date();
  if (user.emailOtpExpiresAt < now) {
    throw new AppError("OTP code has expired. Please request a new one", 400, "OTP_EXPIRED");
  }

  if ((user.emailOtpAttempts || 0) >= MAX_ATTEMPTS) {
    throw new AppError(
      "Too many invalid attempts. Please request a new OTP",
      429,
      "MAX_OTP_ATTEMPTS_EXCEEDED",
    );
  }

  const hashedSubmitted = hashOtp(submittedOtp.trim());
  if (hashedSubmitted !== user.emailOtpHash) {
    user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
    await user.save();
    throw new AppError(
      "Invalid OTP verification code. Please check and try again",
      400,
      "INVALID_OTP",
    );
  }

  // OTP verified successfully
  user.isVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpiresAt = undefined;
  user.emailOtpResendAfter = undefined;
  user.emailOtpAttempts = 0;
  await user.save();

  // Send verification success email
  const successHtml = renderVerificationSuccessEmailTemplate(user.firstName);
  await sendEmail({
    to: user.email,
    subject: "Account Verified Successfully - StudentHub",
    html: successHtml,
  }).catch(() => {}); // Non-blocking

  return {
    success: true,
    user,
  };
}
