import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";
import { SearchService } from "../services/search.service.js";
import { MongoSearchProvider } from "../search/mongo-search.provider.js";
import { authenticate, authorize, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { globalSearchSchema, saveSearchSchema } from "@studenthub/validation";

const mongoSearchProvider = new MongoSearchProvider();
const searchService = new SearchService(mongoSearchProvider);
const searchController = new SearchController(searchService);

export const searchRouter = Router();

// Public Global Search & Suggestions
searchRouter.get(
  "/",
  optionalAuthenticate,
  validateRequest({ query: globalSearchSchema }),
  searchController.search,
);

searchRouter.get("/suggestions", searchController.getSuggestions);

searchRouter.get("/recommendations", optionalAuthenticate, searchController.getRecommendations);

searchRouter.post("/track-view", optionalAuthenticate, searchController.trackView);

// Student History & Saved Searches
searchRouter.post(
  "/saved",
  authenticate,
  validateRequest(saveSearchSchema),
  searchController.saveSearch,
);

searchRouter.get("/history", authenticate, searchController.getUserSearchHistory);

// Admin Telemetry & Analytics
searchRouter.get(
  "/admin/analytics",
  authenticate,
  authorize(["admin"]),
  searchController.getAdminSearchAnalytics,
);
