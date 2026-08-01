export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational: boolean;
  readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "APP_ERROR", details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST", details?: unknown) {
    super(message, 400, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", code = "UNAUTHORIZED", details?: unknown) {
    super(message, 401, code, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access", code = "FORBIDDEN", details?: unknown) {
    super(message, 403, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND", details?: unknown) {
    super(message, 404, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Request validation failed",
    details: Record<string, string[]> | unknown = {},
    code = "VALIDATION_ERROR",
  ) {
    super(message, 400, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", code = "CONFLICT", details?: unknown) {
    super(message, 409, code, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message = "Too many requests. Please try again later.",
    code = "TOO_MANY_REQUESTS",
    details?: unknown,
  ) {
    super(message, 429, code, details);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = "Internal server error",
    code = "INTERNAL_SERVER_ERROR",
    details?: unknown,
  ) {
    super(message, 500, code, details);
  }
}
