import { z } from "zod";

/**
 * Zod Environment Schema & Parser for StudentHub Services
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default("/api"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/studenthub"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default("change-me-access-secret-key-must-be-32-chars-long"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default("change-me-refresh-secret-key-must-be-32-chars-long"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:5174,http://localhost:5175"),
  TRUST_PROXY: z.union([z.boolean(), z.number(), z.string()]).default(1),
  REQUEST_SIZE_LIMIT: z.string().default("1mb"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: Record<string, string | undefined>): AppEnv {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
  }
  return result.data;
}

/**
 * Cloudinary Helper Configuration
 */
export interface CloudinaryConfig {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
  isConfigured: boolean;
}

export function getCloudinaryConfig(env: Partial<AppEnv>): CloudinaryConfig {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  return {
    cloudName,
    apiKey,
    apiSecret,
    isConfigured: Boolean(cloudName && apiKey && apiSecret),
  };
}

/**
 * JWT Configuration Parameters
 */
export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresInDays: number;
}

export function getJwtConfig(env: Partial<AppEnv>): JwtConfig {
  return {
    accessSecret: env.JWT_ACCESS_SECRET || "change-me-access-secret-key-must-be-32-chars-long",
    refreshSecret: env.JWT_REFRESH_SECRET || "change-me-refresh-secret-key-must-be-32-chars-long",
    accessExpiresIn: "15m",
    refreshExpiresInDays: 7,
  };
}

/**
 * CORS Origins Configuration Helper
 */
export interface CorsConfig {
  allowedOrigins: string[];
  isOriginAllowed: (origin: string | undefined) => boolean;
}

export function getCorsConfig(env: Partial<AppEnv>): CorsConfig {
  const clientUrl = env.CLIENT_URL || "http://localhost:5173";
  const originsFromEnv = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = Array.from(new Set([clientUrl, ...originsFromEnv]));

  return {
    allowedOrigins,
    isOriginAllowed: (origin?: string): boolean => {
      if (!origin) return true;
      if (env.NODE_ENV === "development" || origin.startsWith("http://localhost:")) {
        return true;
      }
      return allowedOrigins.includes(origin);
    },
  };
}
