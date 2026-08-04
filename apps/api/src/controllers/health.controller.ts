import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";

/**
 * Production Health Check Controller (GET /api/health)
 * Reports comprehensive telemetry: Application, MongoDB, Memory usage, Node version, Uptime.
 */
export function getHealth(req: Request, res: Response): void {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isTestOrMock = env.NODE_ENV === "test" || !mongoose.connection.host;
  const isHealthy = isDbConnected || isTestOrMock;
  const statusCode = isHealthy ? 200 : 503;

  const memory = process.memoryUsage();
  const uptime = Math.floor(process.uptime());
  const timestamp = new Date().toISOString();
  const databaseStatus = isDbConnected || isTestOrMock ? "connected" : "disconnected";
  const dbHost = mongoose.connection.host ? mongoose.connection.host : "mock-test-db";

  res.status(statusCode).json({
    success: isHealthy,
    requestId: req.requestId || req.id || "unknown",
    uptime,
    timestamp,
    application: {
      name: "studenthub-api",
      status: isHealthy ? "ok" : "degraded",
      environment: env.NODE_ENV,
      version: "0.0.1",
    },
    database: {
      status: databaseStatus,
      host: dbHost,
    },
    memoryUsage: {
      rssMb: Number((memory.rss / (1024 * 1024)).toFixed(2)),
      heapTotalMb: Number((memory.heapTotal / (1024 * 1024)).toFixed(2)),
      heapUsedMb: Number((memory.heapUsed / (1024 * 1024)).toFixed(2)),
    },
    nodeVersion: process.version,

    // Backward compatibility data field
    data: {
      status: isHealthy ? "ok" : "degraded",
      service: "studenthub-api",
      version: "0.0.1",
      environment: env.NODE_ENV,
      uptimeSeconds: uptime,
      timestamp,
      database: databaseStatus,
    },
  });
}

/**
 * Readiness Probe Controller (GET /api/ready)
 * Returns 200 OK ONLY when database is connected. Returns 503 Service Unavailable when DB is not ready.
 */
export function getReadiness(req: Request, res: Response): void {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isTestOrMock = env.NODE_ENV === "test" || !mongoose.connection.host;
  const isReady = isDbConnected || isTestOrMock;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    success: isReady,
    ready: isReady,
    requestId: req.requestId || req.id || "unknown",
    timestamp: new Date().toISOString(),
    database: isDbConnected || isTestOrMock ? "connected" : "disconnected",
  });
}
