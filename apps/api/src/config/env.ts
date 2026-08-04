import "dotenv/config";
import { z } from "zod";
import { envSchema as baseEnvSchema } from "@studenthub/config";

/**
 * Extended Application Environment Schema with API-specific Configuration
 */
const apiEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .default("mongodb://127.0.0.1:27017/studenthub"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters")
    .default("change-me-access-secret-key-must-be-32-chars-long"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters")
    .default("change-me-refresh-secret-key-must-be-32-chars-long"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").default("http://localhost:5173"),
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .default("http://localhost:5173,http://localhost:5174,http://localhost:5175"),
  TRUST_PROXY: z.union([z.boolean(), z.number(), z.string()]).default(1),
  REQUEST_SIZE_LIMIT: z.string().default("1mb"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().default(5),
  RATE_LIMIT_MAX_GENERAL: z.coerce.number().default(100),
  RATE_LIMIT_MAX_PUBLIC: z.coerce.number().default(200),
  RATE_LIMIT_MAX_ADMIN: z.coerce.number().default(60),
  ADMIN_EMAIL: z.string().email().optional().default("admin@studenthub.in"),
  ADMIN_PASSWORD: z.string().optional().default("Admin@StudentHub123"),

  // SMTP Email Configuration
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required").default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.union([z.boolean(), z.string().transform((v) => v === "true")]).default(false),
  SMTP_USER: z.string().min(1, "SMTP_USER is required").default("mukuldixit931@gmail.com"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required").default("atjt tixp ubzo jlrp"),
  MAIL_FROM: z
    .string()
    .min(1, "MAIL_FROM is required")
    .default("StudentHub <mukuldixit931@gmail.com>"),
  SMTP_FROM: z.string().optional().default("StudentHub <mukuldixit931@gmail.com>"),

  // Google Maps Platform Configuration
  GOOGLE_MAPS_API_KEY: z.string().optional().default(""),
  GOOGLE_GEOCODING_API_KEY: z.string().optional().default(""),
  GOOGLE_PLACES_API_KEY: z.string().optional().default(""),
  GOOGLE_DISTANCE_MATRIX_API_KEY: z.string().optional().default(""),
});

export type Env = z.infer<typeof apiEnvSchema>;

export function loadEnv(customEnv?: Record<string, unknown>): Env {
  const targetEnv = customEnv || process.env;
  const parsed = apiEnvSchema.safeParse(targetEnv);

  if (!parsed.success) {
    const formattedErrors = parsed.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`[FATAL] Invalid environment configuration:\n${formattedErrors}`);
  }

  return parsed.data;
}

export const env = loadEnv();
