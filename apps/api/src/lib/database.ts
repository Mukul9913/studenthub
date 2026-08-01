import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    logger.info("MongoDB already connected; reusing connection");
    return mongoose;
  }

  if (mongoose.connection.readyState === 2) {
    logger.info("MongoDB currently connecting; reusing connection attempt");
    return mongoose;
  }

  try {
    logger.info("Connecting to MongoDB...");
    const connection = await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected successfully");
    return connection;
  } catch (error: unknown) {
    logger.error("MongoDB connection failed", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    logger.info("MongoDB connection already closed");
    return;
  }

  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected successfully");
  } catch (error: unknown) {
    logger.error("MongoDB disconnect failed", error);
    throw error;
  }
}
