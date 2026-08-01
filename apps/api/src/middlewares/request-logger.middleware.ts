import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { pinoLogger } from "../utils/logger.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
      requestId?: string;
    }
  }
}

/**
 * Middleware that assigns a unique requestId to every request, returns X-Request-ID in HTTP headers,
 * measures response latency, flags slow requests (>500ms), and logs structured request telemetry.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // 1. Assign or extract correlation Request ID
  const clientRequestId = req.headers["x-request-id"];
  const requestId =
    typeof clientRequestId === "string" && clientRequestId.trim()
      ? clientRequestId.trim()
      : randomUUID();

  req.id = requestId;
  req.requestId = requestId;

  // 2. Set X-Request-ID HTTP response header
  res.setHeader("X-Request-ID", requestId);

  const startTime = Date.now();

  // 3. Log completion on response finish event
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const isSlow = duration > 500;
    const statusCode = res.statusCode;

    const logPayload = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode,
      responseTimeMs: duration,
      slowRequest: isSlow,
      ip: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      userId: req.user?.id || undefined,
    };

    if (statusCode >= 500) {
      pinoLogger.error(
        logPayload,
        `HTTP ${req.method} ${req.originalUrl || req.url} ${statusCode} - ${duration}ms`,
      );
    } else if (statusCode >= 400 || isSlow) {
      pinoLogger.warn(
        logPayload,
        `HTTP ${req.method} ${req.originalUrl || req.url} ${statusCode} - ${duration}ms${isSlow ? " [SLOW REQUEST]" : ""}`,
      );
    } else {
      pinoLogger.info(
        logPayload,
        `HTTP ${req.method} ${req.originalUrl || req.url} ${statusCode} - ${duration}ms`,
      );
    }
  });

  next();
}
