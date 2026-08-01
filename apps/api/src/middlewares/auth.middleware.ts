import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { UserRole, OwnerType } from "@studenthub/types";

import { env } from "../config/env.js";
import { ForbiddenError, UnauthorizedError } from "../errors/index.js";

interface JWTPayload {
  sub: string;
  role: UserRole;
  ownerType?: OwnerType;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is required", "AUTH_TOKEN_REQUIRED");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Authentication token is required", "AUTH_TOKEN_REQUIRED");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as JWTPayload;
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      ownerType: decoded.ownerType,
    };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired authentication token", "INVALID_AUTH_TOKEN");
  }
}

export const requireAuth = authenticate;

export function requireRoles(...allowedRoles: (UserRole | string)[]) {
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication token is required", "AUTH_TOKEN_REQUIRED");
    }

    const userRoleNormalized = (req.user.role || "").toLowerCase();
    if (!normalizedAllowed.includes(userRoleNormalized)) {
      throw new ForbiddenError(
        "Insufficient permissions to perform this action",
        "INSUFFICIENT_PERMISSIONS",
      );
    }

    next();
  };
}

export function requireAnyRole(allowedRoles: (UserRole | string)[]) {
  return requireRoles(...allowedRoles);
}
