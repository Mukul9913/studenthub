import { UserModel } from "../models/user.model.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Development / Initial Admin Seeder.
 * Idempotently checks if the platform admin user exists and creates one if missing.
 */
export async function ensureAdminSeed(): Promise<void> {
  try {
    const adminEmail = (env.ADMIN_EMAIL || "admin@studenthub.in").toLowerCase().trim();
    const existingAdmin = await UserModel.findOne({ email: adminEmail }).exec();

    if (!existingAdmin) {
      await UserModel.create({
        firstName: "Platform",
        lastName: "Admin",
        email: adminEmail,
        passwordHash: env.ADMIN_PASSWORD || "Admin@StudentHub123",
        role: "admin",
        isVerified: true,
        isActive: true,
      });
      logger.info(`[Seed] Platform Admin account initialized successfully (${adminEmail})`);
    }
  } catch (error) {
    logger.error("[Seed] Failed to ensure admin seed user:", error);
  }
}
