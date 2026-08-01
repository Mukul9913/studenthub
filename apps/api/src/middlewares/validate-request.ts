import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";

import { ValidationError } from "../errors/index.js";

export interface RequestValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
  headers?: ZodTypeAny;
}

/**
 * Middleware to validate request body, query params, route parameters, and headers against Zod schemas.
 * Replaces request fields with their parsed/coerced versions.
 */
export function validateRequest(schemas: RequestValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.headers) {
        req.headers = schemas.headers.parse(req.headers);
      }
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};

        for (const issue of error.issues) {
          const path = issue.path.join(".");
          const field = path || "general";
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(issue.message);
        }

        next(new ValidationError("Request validation failed", details));
        return;
      }

      next(error);
    }
  };
}
