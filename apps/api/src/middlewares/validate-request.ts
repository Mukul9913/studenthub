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
export function validateRequest(schemas: RequestValidationSchema | ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if ("parse" in schemas && typeof (schemas as { parse?: unknown }).parse === "function") {
        req.body = (schemas as ZodTypeAny).parse(req.body);
      } else {
        const s = schemas as RequestValidationSchema;
        if (s.params) {
          req.params = s.params.parse(req.params);
        }
        if (s.query) {
          req.query = s.query.parse(req.query);
        }
        if (s.body) {
          req.body = s.body.parse(req.body);
        }
        if (s.headers) {
          req.headers = s.headers.parse(req.headers);
        }
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
