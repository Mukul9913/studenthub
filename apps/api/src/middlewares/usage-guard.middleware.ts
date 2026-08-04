/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/index.js";

export function usageGuard(resource: "listings" | "leads" | "featured") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const features = (req.subscription as any)?.plan?.features;
    const usage = req.usage as any;

    if (!features || !usage) {
      return next(); // Pass through if usage/subscription unavailable
    }

    if (resource === "listings") {
      const maxListings = features.maxListings;
      if (maxListings !== -1 && usage.activeListingsCount >= maxListings) {
        throw new ForbiddenError(
          `Listing limit reached (${usage.activeListingsCount}/${maxListings}) under your current ${req.subscription?.plan?.name} plan. Please upgrade to add more listings.`,
          "LISTING_LIMIT_EXCEEDED",
        );
      }
    }

    if (resource === "leads") {
      const leadLimit = features.monthlyLeadLimit;
      if (
        leadLimit !== -1 &&
        usage.monthlyLeadsReceived >= leadLimit &&
        usage.leadCreditsBalance <= 0
      ) {
        throw new ForbiddenError(
          `Monthly lead limit reached (${usage.monthlyLeadsReceived}/${leadLimit}). Purchase lead credits or upgrade plan to receive more leads.`,
          "LEAD_LIMIT_EXCEEDED",
        );
      }
    }

    next();
  };
}
