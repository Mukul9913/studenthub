import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { pinoLogger } from "../utils/logger.js";

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let errorCode = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred";
  let details: unknown = undefined;

  // 1. Operational AppError (Custom Application Error)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  }
  // 2. Direct Zod Validation Error
  else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Request validation failed";
    const fieldDetails: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join(".") || "general";
      if (!fieldDetails[field]) {
        fieldDetails[field] = [];
      }
      fieldDetails[field].push(issue.message);
    }
    details = fieldDetails;
  }
  // 3. Mongo Duplicate Key Error (Code 11000)
  else if (err && typeof err === "object" && (err as MongoError).code === 11000) {
    statusCode = 409;
    errorCode = "CONFLICT";
    const mongoErr = err as MongoError;
    const duplicateFields = mongoErr.keyValue
      ? Object.keys(mongoErr.keyValue).join(", ")
      : "resource";
    message = `A resource with the same ${duplicateFields} already exists.`;
    details = mongoErr.keyValue;
  }
  // 4. Mongoose Validation Error
  else if (err && typeof err === "object" && (err as Error).name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = (err as Error).message || "Mongoose validation failed";
    const errorsObj = (err as Record<string, unknown>).errors;
    if (errorsObj && typeof errorsObj === "object") {
      const fieldDetails: Record<string, string[]> = {};
      for (const field of Object.keys(errorsObj)) {
        fieldDetails[field] = [
          (errorsObj as Record<string, { message?: string }>)[field]?.message || "Validation error",
        ];
      }
      details = fieldDetails;
    }
  }
  // 5. Mongoose Cast Error (Invalid ObjectId, etc.)
  else if (err && typeof err === "object" && (err as Error).name === "CastError") {
    statusCode = 400;
    errorCode = "BAD_REQUEST";
    message = `Invalid format for field '${String((err as Record<string, unknown>).path || "")}'`;
  }
  // 6. JWT Authentication Errors
  else if (err && typeof err === "object" && (err as Error).name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    message = "Invalid access token provided";
  } else if (err && typeof err === "object" && (err as Error).name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    message = "Access token has expired. Please refresh your session.";
  }
  // 7. General Error / Unexpected Runtime Error
  else if (err instanceof Error) {
    message = "An unexpected error occurred";
  }

  // Structured Error Logging with Request ID & Error Stack Context
  const errorLogMeta = {
    requestId: req.requestId || req.id,
    route: req.originalUrl || req.url,
    method: req.method,
    statusCode,
    errorCode,
    userId: req.user?.id || undefined,
    err: err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : err,
  };

  if (statusCode >= 500) {
    pinoLogger.error(errorLogMeta, `Unhandled Error: ${message}`);
  } else {
    pinoLogger.warn(errorLogMeta, `Operational Exception: ${message}`);
  }

  // Format error list items for structured API failure response
  let errorsList: unknown[] = [];
  if (Array.isArray(details)) {
    errorsList = details;
  } else if (details && typeof details === "object") {
    errorsList = Object.entries(details as Record<string, unknown>).map(([field, msgs]) => ({
      field,
      message: Array.isArray(msgs) ? msgs.join(", ") : String(msgs),
    }));
  }

  const isDev = env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    errors: errorsList,
    error: {
      code: errorCode,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  });
}
