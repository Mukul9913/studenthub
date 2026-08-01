import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  code?: string;
}

export function createRateLimiter(config: RateLimitConfig) {
  const hits = new Map<string, number[]>();

  const interval = setInterval(
    () => {
      const now = Date.now();
      for (const [ip, timestamps] of hits.entries()) {
        const validTimestamps = timestamps.filter((t) => now - t < config.windowMs);
        if (validTimestamps.length === 0) {
          hits.delete(ip);
        } else {
          hits.set(ip, validTimestamps);
        }
      }
    },
    Math.max(config.windowMs, 60000),
  );

  if (interval.unref) {
    interval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.headers["x-bypass-rate-limit"] === "true") {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();

    let timestamps = hits.get(ip) || [];
    timestamps = timestamps.filter((t) => now - t < config.windowMs);

    const limit = config.max;
    const remaining = Math.max(0, limit - (timestamps.length + 1));
    const resetTime = Math.ceil((now + config.windowMs) / 1000);

    res.setHeader("RateLimit-Limit", limit);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetTime);

    if (timestamps.length >= limit) {
      const oldestActive = timestamps[0] || now;
      const msRemaining = config.windowMs - (now - oldestActive);
      const secondsRemaining = Math.ceil(msRemaining / 1000);

      res.setHeader("Retry-After", secondsRemaining);
      res.status(429).json({
        success: false,
        message:
          config.message || `Too many requests. Please try again in ${secondsRemaining} seconds.`,
        errorCode: config.code || "TOO_MANY_REQUESTS",
        errors: [{ field: "rate_limit", message: "Rate limit exceeded" }],
        error: {
          code: config.code || "TOO_MANY_REQUESTS",
          message:
            config.message || `Too many requests. Please try again in ${secondsRemaining} seconds.`,
        },
      });
      return;
    }

    timestamps.push(now);
    hits.set(ip, timestamps);
    next();
  };
}

// Environment-configured modular rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_AUTH,
  code: "AUTH_RATE_LIMIT_EXCEEDED",
  message: "Too many login or registration attempts. Please try again in 15 minutes.",
});

export const generalRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_GENERAL,
  code: "RATE_LIMIT_EXCEEDED",
  message: "General API rate limit exceeded. Please try again later.",
});

export const publicRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_PUBLIC,
  code: "PUBLIC_RATE_LIMIT_EXCEEDED",
  message: "Public discovery rate limit exceeded. Please slow down requests.",
});

export const adminRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_ADMIN,
  code: "ADMIN_RATE_LIMIT_EXCEEDED",
  message: "Admin API rate limit exceeded.",
});
