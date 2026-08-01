import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .optional()
    .default("info"),
  API_PREFIX: z.string().min(1, "API_PREFIX is required").default("/api"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .default("http://localhost:5173,http://localhost:5174,http://localhost:5175"),
  TRUST_PROXY: z.union([z.boolean(), z.number(), z.string()]).default(1),
  REQUEST_SIZE_LIMIT: z.string().default("1mb"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_AUTH: z.coerce.number().default(5),
  RATE_LIMIT_MAX_GENERAL: z.coerce.number().default(100),
  RATE_LIMIT_MAX_PUBLIC: z.coerce.number().default(200),
  RATE_LIMIT_MAX_ADMIN: z.coerce.number().default(60),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  ADMIN_EMAIL: z.string().email().optional().default("admin@studenthub.in"),
  ADMIN_PASSWORD: z.string().optional().default("Admin@StudentHub123"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(customEnv?: Record<string, unknown>): Env {
  const targetEnv = customEnv || process.env;
  const parsed = envSchema.safeParse(targetEnv);

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment variables: ${JSON.stringify(details)}`);
  }

  return parsed.data;
}

export const env = loadEnv();
