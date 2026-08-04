import type { SendMailOptions } from "nodemailer";
import { getMailTransporter, smtpConfig } from "../../config/mail.js";
import { pinoLogger } from "../../utils/logger.js";
import { env } from "../../config/env.js";
import type {
  SendEmailOptions,
  EmailSendResult,
  WelcomeEmailData,
  VerifyEmailData,
  ForgotPasswordEmailData,
  ResetPasswordSuccessEmailData,
  ContactFormEmailData,
  AdminNotificationEmailData,
} from "./email.types.js";
import {
  renderWelcomeEmailTemplate,
  renderVerifyEmailTemplate,
  renderForgotPasswordTemplate,
  renderResetPasswordSuccessTemplate,
  renderContactFormEmailTemplate,
  renderAdminNotificationEmailTemplate,
} from "./email.templates.js";

/**
 * Safely mask recipient email for production logging.
 * e.g. "student.indore@gmail.com" -> "s***e@gmail.com"
 */
export function maskEmail(email: string): string {
  if (env.NODE_ENV !== "production") return email;
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const name = parts[0]!;
  const domain = parts[1]!;
  if (name.length <= 2) return `${name[0]}*@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Reusable core sendEmail function with exponential backoff retries.
 */
export async function sendEmail(
  options: SendEmailOptions,
  maxRetries = 3,
): Promise<EmailSendResult> {
  const startTime = Date.now();
  const recipient = Array.isArray(options.to) ? options.to.join(", ") : options.to;
  const maskedRecipient = maskEmail(recipient);
  const fromAddress = options.from || env.SMTP_FROM || env.MAIL_FROM || smtpConfig.from;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      pinoLogger.info(
        { recipient: maskedRecipient, subject: options.subject, attempt },
        "Sending email via Nodemailer SMTP...",
      );

      const transporter = getMailTransporter();
      const mailOptions: SendMailOptions = {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>?/gm, ""),
        replyTo: options.replyTo,
        attachments: options.attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      const durationMs = Date.now() - startTime;

      pinoLogger.info(
        {
          recipient: maskedRecipient,
          messageId: info.messageId,
          durationMs,
        },
        "✓ Email sent successfully",
      );

      return {
        success: true,
        messageId: info.messageId,
        recipient,
        durationMs,
      };
    } catch (err) {
      lastError = err as Error;
      pinoLogger.warn(
        {
          recipient: maskedRecipient,
          attempt,
          maxRetries,
          error: lastError.message,
        },
        "SMTP email transmission failed. Retrying...",
      );

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  const durationMs = Date.now() - startTime;
  pinoLogger.error(
    { recipient: maskedRecipient, error: lastError?.message, durationMs },
    "❌ All SMTP retries exhausted. Email delivery failed.",
  );

  return {
    success: false,
    recipient,
    durationMs,
    error: lastError?.message || "Unknown SMTP error",
  };
}

// ─── Specific Email Dispatchers ───────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData,
): Promise<EmailSendResult> {
  const html = renderWelcomeEmailTemplate(data);
  return sendEmail({
    to,
    subject: `Welcome to StudentHub, ${data.userName}! 🎉`,
    html,
  });
}

export async function sendVerifyEmail(to: string, data: VerifyEmailData): Promise<EmailSendResult> {
  const html = renderVerifyEmailTemplate(data);
  return sendEmail({
    to,
    subject: "Verify Your Email Address - StudentHub",
    html,
  });
}

export async function sendForgotPasswordEmail(
  to: string,
  data: ForgotPasswordEmailData,
): Promise<EmailSendResult> {
  const html = renderForgotPasswordTemplate(data);
  return sendEmail({
    to,
    subject: "Reset Your StudentHub Password",
    html,
  });
}

export async function sendPasswordResetSuccessEmail(
  to: string,
  data: ResetPasswordSuccessEmailData,
): Promise<EmailSendResult> {
  const html = renderResetPasswordSuccessTemplate(data);
  return sendEmail({
    to,
    subject: "StudentHub Security Alert: Password Updated",
    html,
  });
}

export async function sendContactFormEmail(data: ContactFormEmailData): Promise<EmailSendResult> {
  const adminEmail = env.ADMIN_EMAIL || "admin@studenthub.in";
  const html = renderContactFormEmailTemplate(data);
  return sendEmail({
    to: adminEmail,
    replyTo: data.senderEmail,
    subject: `[Contact Form] ${data.subject}`,
    html,
  });
}

export async function sendAdminNotificationEmail(
  data: AdminNotificationEmailData,
): Promise<EmailSendResult> {
  const adminEmail = env.ADMIN_EMAIL || "admin@studenthub.in";
  const html = renderAdminNotificationEmailTemplate(data);
  return sendEmail({
    to: adminEmail,
    subject: `[Admin Alert] ${data.title}`,
    html,
  });
}

export const emailService = {
  sendEmail,
  sendWelcomeEmail: (to: string, data: { name: string; loginUrl?: string }) =>
    sendWelcomeEmail(to, { userName: data.name, dashboardLink: data.loginUrl }),
  sendVerifyEmail: (to: string, data: { name: string; verifyUrl: string }) =>
    sendVerifyEmail(to, { userName: data.name, verificationUrl: data.verifyUrl }),
  sendForgotPasswordEmail: (to: string, data: { name: string; resetUrl: string }) =>
    sendForgotPasswordEmail(to, { userName: data.name, resetUrl: data.resetUrl }),
  sendPasswordResetSuccessEmail,
  sendContactFormEmail,
  sendAdminNotificationEmail,
};
