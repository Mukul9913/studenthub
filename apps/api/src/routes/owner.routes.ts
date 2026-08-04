import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";

const router = Router();
const controller = new ReviewController();

// Public Owner Profile
router.get("/:id/profile", controller.getOwnerPublicProfile);

// Owner Score Breakdown
router.get("/:id/score", controller.getOwnerScore);

export const ownerRoutes = router;
