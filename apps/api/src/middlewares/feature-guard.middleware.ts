import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/index.js";
import type { PlanFeatureConfig } from "@studenthub/types";

export function featureGuard(featureKey: keyof PlanFeatureConfig) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const features = req.subscription?.plan?.features;
    if (!features) {
      throw new ForbiddenError("Active subscription plan required", "SUBSCRIPTION_REQUIRED");
    }

    const value = features[featureKey];
    if (typeof value === "boolean" && !value) {
      throw new ForbiddenError(
        `Feature '${String(featureKey)}' is not enabled in your current plan (${req.subscription?.plan?.name}). Please upgrade your plan.`,
        "FEATURE_DISABLED",
      );
    }

    next();
  };
}
