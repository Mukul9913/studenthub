import type { Request, Response, NextFunction } from "express";
import { MonetizationService } from "../services/monetization.service.js";

const monetizationService = new MonetizationService();

export async function subscriptionGuard(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    return next();
  }

  try {
    const { subscription, usage } = await monetizationService.getOrCreateOwnerSubscription(
      req.user.id,
    );
    req.subscription = subscription;
    req.usage = usage;
    next();
  } catch (err) {
    next(err);
  }
}
