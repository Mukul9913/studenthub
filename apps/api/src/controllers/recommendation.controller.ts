import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import {
  getStudentPreferences,
  upsertStudentPreferences,
  getRecommendedForUser,
  getTrendingListings,
  getPopularNearMe,
  getSimilarListings,
  getRecentlyViewed,
  trackView,
  saveSearch,
  getSavedSearches,
  getPersonalizedFeed,
} from "../services/recommendation.service.js";
import {
  updateStudentPreferencesSchema,
  createSavedSearchSchema,
  trackViewSchema,
} from "@studenthub/validation";

// ─── Personalized Home Feed ───────────────────────────────────────────────────

export async function getHomeFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id ?? null;
    const feed = await getPersonalizedFeed(userId);
    res.status(200).json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export async function getForYou(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const targetType = (req.query.type as "LIBRARY" | "ACCOMMODATION" | "ALL") ?? "ALL";
    const limit = Math.min(Number(req.query.limit ?? 10), 30);
    const data = await getRecommendedForUser(req.user.id, targetType, limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = (req.query.type as "LIBRARY" | "ACCOMMODATION") ?? "LIBRARY";
    const area = req.query.area as string | undefined;
    const limit = Math.min(Number(req.query.limit ?? 10), 30);
    const data = await getTrendingListings(type, area, limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getPopularNear(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const area = req.query.area as string;
    const type = (req.query.type as "LIBRARY" | "ACCOMMODATION") ?? "LIBRARY";
    const limit = Math.min(Number(req.query.limit ?? 8), 20);
    if (!area) throw new AppError("area query param is required", 400, "VALIDATION_ERROR");
    const data = await getPopularNearMe(area, type, limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSimilar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetType = String(req.params.targetType);
    const targetId = String(req.params.targetId);
    const limit = Math.min(Number(req.query.limit ?? 6), 20);
    if (!["LIBRARY", "ACCOMMODATION"].includes(targetType)) {
      throw new AppError("Invalid targetType", 400, "VALIDATION_ERROR");
    }
    const data = await getSimilarListings(
      targetId,
      targetType as "LIBRARY" | "ACCOMMODATION",
      limit,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getRecentlyViewedHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const limit = Math.min(Number(req.query.limit ?? 8), 20);
    const data = await getRecentlyViewed(req.user.id, limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function trackViewHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(200).json({ success: true }); // silently skip for unauthenticated
      return;
    }
    const parsed = trackViewSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Invalid payload", 400, "VALIDATION_ERROR");
    const { targetType, targetId, source, durationSeconds } = parsed.data;
    await trackView(req.user.id, targetType, targetId, source ?? "DIRECT", durationSeconds);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ─── Student Preferences ──────────────────────────────────────────────────────

export async function getPreferences(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const data = await getStudentPreferences(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const parsed = updateStudentPreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Validation failed", 400, "VALIDATION_ERROR");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await upsertStudentPreferences(req.user.id, parsed.data as any);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── Saved Searches ───────────────────────────────────────────────────────────

export async function getSavedSearchesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const data = await getSavedSearches(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function saveSearchHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const parsed = createSavedSearchSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Invalid payload", 400, "VALIDATION_ERROR");
    const data = await saveSearch(req.user.id, {
      query: parsed.data.query,
      filters: parsed.data.filters as Record<string, unknown> | undefined,
      targetType: parsed.data.targetType,
      label: parsed.data.label,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
