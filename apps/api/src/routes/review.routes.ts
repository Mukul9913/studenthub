import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import {
  authenticate,
  optionalAuthenticate,
  requireAnyRole,
} from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.js";
import {
  createReviewSchema,
  createReviewReplySchema,
  reportReviewSchema,
  reactReviewSchema,
  updateReviewStatusSchema,
} from "@studenthub/validation";

const router = Router();
const controller = new ReviewController();

// Public & Student Review Listing
router.get("/", optionalAuthenticate, controller.getReviews);

// Student Create Review (with lead verification)
router.post("/", authenticate, validateRequest(createReviewSchema), controller.createReview);

// Owner Review Analytics & Reply
router.get(
  "/owner/analytics",
  authenticate,
  requireAnyRole(["owner", "admin"]),
  controller.getOwnerReviewAnalytics,
);
router.post(
  "/:id/reply",
  authenticate,
  requireAnyRole(["owner", "admin"]),
  validateRequest(createReviewReplySchema),
  controller.replyReview,
);

// Reactions & Abuse Reports
router.post("/:id/react", authenticate, validateRequest(reactReviewSchema), controller.reactReview);
router.post(
  "/:id/report",
  authenticate,
  validateRequest(reportReviewSchema),
  controller.reportReview,
);

// Admin Moderation Queue
router.get("/admin/queue", authenticate, requireAnyRole(["admin"]), controller.getAdminReviewQueue);
router.patch(
  "/admin/:id/status",
  authenticate,
  requireAnyRole(["admin"]),
  validateRequest(updateReviewStatusSchema),
  controller.updateReviewStatus,
);

export const reviewRoutes = router;
