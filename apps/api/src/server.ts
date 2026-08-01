import type { Server } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./lib/database.js";
import { ensureAdminSeed } from "./seeds/seed-admin.js";
import { logger } from "./utils/logger.js";

let server: Server;

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await ensureAdminSeed();

  const app = createApp();

  server = app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async (err) => {
      if (err) {
        logger.error("Error closing HTTP server", err);
      } else {
        logger.info("HTTP server closed successfully");
      }
      try {
        await disconnectDatabase();
        process.exit(0);
      } catch (error) {
        logger.error("Error disconnecting database during shutdown", error);
        process.exit(1);
      }
    });
  } else {
    try {
      await disconnectDatabase();
      process.exit(0);
    } catch (error) {
      logger.error("Error disconnecting database during shutdown", error);
      process.exit(1);
    }
  }

  // Set timeout to force shutdown if hanging
  setTimeout(() => {
    logger.error("Graceful shutdown timed out; force exiting");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => {
  shutdown("SIGINT").catch(() => process.exit(1));
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch(() => process.exit(1));
});

bootstrap().catch((error: unknown) => {
  logger.error("Failed to start API", error);
  process.exit(1);
});
