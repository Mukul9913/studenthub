import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import {
  getHomeFeed,
  getForYou,
  getTrending,
  getPopularNear,
  getSimilar,
  getRecentlyViewedHandler,
  trackViewHandler,
  getPreferences,
  updatePreferences,
  getSavedSearchesHandler,
  saveSearchHandler,
} from "../controllers/recommendation.controller.js";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
// Feed works for both authenticated (personalized) and anonymous (trending) users
router.get("/feed", optionalAuthenticate, getHomeFeed);
router.get("/trending", getTrending);
router.get("/popular-near-me", getPopularNear);
router.get("/similar/:targetType/:targetId", getSimilar);

// ─── Authenticated ────────────────────────────────────────────────────────────
router.get("/for-you", authenticate, getForYou);
router.get("/recently-viewed", authenticate, getRecentlyViewedHandler);
router.post("/track-view", authenticate, trackViewHandler);

// ─── Student Preferences ──────────────────────────────────────────────────────
router.get("/preferences", authenticate, getPreferences);
router.put("/preferences", authenticate, updatePreferences);

// ─── Saved Searches ───────────────────────────────────────────────────────────
router.get("/saved-searches", authenticate, getSavedSearchesHandler);
router.post("/saved-searches", authenticate, saveSearchHandler);

export { router as recommendationRouter };
