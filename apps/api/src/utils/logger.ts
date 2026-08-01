import { pino, type Logger as PinoLogger } from "pino";
import { env } from "../config/env.js";

const isDev = env.NODE_ENV === "development";
const isTest = env.NODE_ENV === "test";

// Production structured Pino instance
export const pinoLogger: PinoLogger = pino({
  level: isTest ? "silent" : env.LOG_LEVEL || (isDev ? "debug" : "info"),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "password",
      "refreshToken",
      "accessToken",
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
    censor: "[REDACTED]",
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

/**
 * Universal application logger wrapper offering Pino structured logging with backwards compatibility.
 */
export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    pinoLogger.info(meta || {}, message);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    pinoLogger.warn(meta || {}, message);
  },

  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const errObj =
      error instanceof Error
        ? { err: { message: error.message, stack: error.stack, name: error.name } }
        : error
          ? { err: error }
          : {};

    pinoLogger.error({ ...errObj, ...(meta || {}) }, message);
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    pinoLogger.debug(meta || {}, message);
  },

  trace(message: string, meta?: Record<string, unknown>): void {
    pinoLogger.trace(meta || {}, message);
  },

  fatal(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const errObj =
      error instanceof Error
        ? { err: { message: error.message, stack: error.stack, name: error.name } }
        : error
          ? { err: error }
          : {};

    pinoLogger.fatal({ ...errObj, ...(meta || {}) }, message);
  },

  child(bindings: Record<string, unknown>) {
    return pinoLogger.child(bindings);
  },
};
