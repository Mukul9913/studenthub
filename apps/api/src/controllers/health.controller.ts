import type { Request, Response } from "express";
import { env } from "../config/env.js";

export function getHealth(_req: Request, res: Response): void {
  const payload = {
    status: "ok",
    service: "studenthub-api",
    version: "0.0.1",
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: payload,
  });
}
