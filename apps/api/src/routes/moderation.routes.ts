import { Router } from "express";
import { ModerationController } from "../controllers/moderation.controller.js";
import { ModerationService } from "../services/moderation.service.js";
import { ModerationRepository } from "../repositories/moderation.repository.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.js";
import {
  submitForReviewSchema,
  approveListingSchema,
  rejectListingSchema,
  suspendListingSchema,
  archiveListingSchema,
  restoreListingSchema,
  assignModeratorSchema,
  addModerationCommentSchema,
  moderationQuerySchema,
} from "@studenthub/validation";

const moderationRepository = new ModerationRepository();
const moderationService = new ModerationService(moderationRepository);
const moderationController = new ModerationController(moderationService);

export const moderationRouter = Router();

// Owner / Admin Action Endpoints
moderationRouter.post(
  "/submit",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest(submitForReviewSchema),
  moderationController.submitForReview,
);

moderationRouter.post(
  "/start-review",
  authenticate,
  authorize(["admin"]),
  moderationController.startReview,
);

moderationRouter.post(
  "/approve",
  authenticate,
  authorize(["admin"]),
  validateRequest(approveListingSchema),
  moderationController.approveListing,
);

moderationRouter.post(
  "/reject",
  authenticate,
  authorize(["admin"]),
  validateRequest(rejectListingSchema),
  moderationController.rejectListing,
);

moderationRouter.post(
  "/suspend",
  authenticate,
  authorize(["admin"]),
  validateRequest(suspendListingSchema),
  moderationController.suspendListing,
);

moderationRouter.post(
  "/archive",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest(archiveListingSchema),
  moderationController.archiveListing,
);

moderationRouter.post(
  "/restore",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest(restoreListingSchema),
  moderationController.restoreListing,
);

moderationRouter.post(
  "/assign",
  authenticate,
  authorize(["admin"]),
  validateRequest(assignModeratorSchema),
  moderationController.assignModerator,
);

moderationRouter.post(
  "/comments",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest(addModerationCommentSchema),
  moderationController.addComment,
);

// History & Comments
moderationRouter.get(
  "/:id/history",
  authenticate,
  authorize(["owner", "admin"]),
  moderationController.getHistory,
);

moderationRouter.get(
  "/:id/comments",
  authenticate,
  authorize(["owner", "admin"]),
  moderationController.getComments,
);

// Admin Telemetry & Queue
moderationRouter.get(
  "/admin/queue",
  authenticate,
  authorize(["admin"]),
  validateRequest({ query: moderationQuerySchema }),
  moderationController.getAdminQueue,
);

moderationRouter.get(
  "/admin/analytics",
  authenticate,
  authorize(["admin"]),
  moderationController.getAdminAnalytics,
);
