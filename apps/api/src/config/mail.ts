import nodemailer, { type Transporter } from "nodemailer";
import { z } from "zod";
import { env } from "./env.js";
import { pinoLogger } from "../utils/logger.js";

/**
 * Zod schema to validate SMTP configuration and fail fast if invalid.
 */
export const smtpConfigSchema = z.object({
  host: z.string().min(1, "SMTP_HOST is required"),
  port: z.number().int().positive("SMTP_PORT must be a positive integer"),
  secure: z.boolean(),
  user: z.string().min(1, "SMTP_USER is required"),
  pass: z.string().min(1, "SMTP_PASS is required"),
  from: z.string().min(1, "MAIL_FROM is required"),
});

export type SmtpConfig = z.infer<typeof smtpConfigSchema>;

/**
 * Validated SMTP Configuration extracted from environment.
 */
function parseSmtpConfig(): SmtpConfig {
  const rawPass = String(env.SMTP_PASS || "").replace(/\s+/g, ""); // Gmail app passwords: spaces optional
  const rawFrom = String(env.MAIL_FROM || env.SMTP_FROM || "")
    .trim()
    .replace(/^["']|["']$/g, ""); // strip accidental .env quotes

  const rawConfig = {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    // Never use Boolean("false") — that is true in JS
    secure: env.SMTP_SECURE === true || env.SMTP_SECURE === "true",
    user: env.SMTP_USER,
    pass: rawPass,
    from: rawFrom || `StudentHub <${env.SMTP_USER}>`,
  };

  const parsed = smtpConfigSchema.safeParse(rawConfig);
  if (!parsed.success) {
    const formattedErrors = parsed.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    pinoLogger.fatal(`[FATAL] Invalid SMTP configuration:\n${formattedErrors}`);
    throw new Error(`[FATAL] Invalid SMTP configuration:\n${formattedErrors}`);
  }

  return parsed.data;
}

export const smtpConfig: SmtpConfig = parseSmtpConfig();

/**
 * Singleton Transporter Instance
 */
let transporterInstance: Transporter | null = null;

/**
 * Returns the singleton Nodemailer SMTP transporter.
 */
export function getMailTransporter(): Transporter {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
      connectionTimeout: 10000, // 10s
      greetingTimeout: 5000, // 5s
      socketTimeout: 15000, // 15s
    });
  }
  return transporterInstance;
}

/**
 * Verifies connection to the SMTP server on startup or demand.
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transporter = getMailTransporter();
    await transporter.verify();
    pinoLogger.info(
      { host: smtpConfig.host, port: smtpConfig.port },
      "SMTP connection verified successfully",
    );
    return true;
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    pinoLogger.error(
      { host: smtpConfig.host, port: smtpConfig.port, error: err },
      "SMTP connection verification failed",
    );
    return false;
  }
}
