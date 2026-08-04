import { Router } from "express";
import { MonetizationService } from "../services/monetization.service.js";
import { MonetizationController } from "../controllers/monetization.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.js";
import {
  createPlanSchema,
  updatePlanSchema,
  subscribePlanSchema,
  orderMarketingServiceSchema,
  purchaseLeadPackageSchema,
  featureListingSchema,
  verifyOwnerSchema,
  reviewVerificationSchema,
} from "@studenthub/validation";

export const monetizationRouter = Router();

const monetizationService = new MonetizationService();
const monetizationController = new MonetizationController(monetizationService);

// Public Plans & Service Catalogs
monetizationRouter.get("/plans", monetizationController.getPlans);
monetizationRouter.get("/marketing-services", monetizationController.getMarketingServices);
monetizationRouter.get("/lead-packages", monetizationController.getLeadPackages);

// Owner Routes
monetizationRouter.get(
  "/subscription/me",
  authenticate,
  authorize(["owner", "admin"]),
  monetizationController.getMySubscription,
);
monetizationRouter.post(
  "/subscription/subscribe",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest({ body: subscribePlanSchema }),
  monetizationController.subscribePlan,
);
monetizationRouter.post(
  "/subscription/cancel",
  authenticate,
  authorize(["owner", "admin"]),
  monetizationController.cancelSubscription,
);

monetizationRouter.post(
  "/marketing-services/order",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest({ body: orderMarketingServiceSchema }),
  monetizationController.orderMarketingService,
);

monetizationRouter.post(
  "/lead-packages/purchase",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest({ body: purchaseLeadPackageSchema }),
  monetizationController.purchaseLeadPackage,
);

monetizationRouter.post(
  "/featured-listings",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest({ body: featureListingSchema }),
  monetizationController.promoteListing,
);

monetizationRouter.get(
  "/verification/status",
  authenticate,
  authorize(["owner", "admin"]),
  monetizationController.getVerificationStatus,
);
monetizationRouter.post(
  "/verification/request",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest({ body: verifyOwnerSchema }),
  monetizationController.requestVerification,
);

// Admin Routes
monetizationRouter.post(
  "/plans",
  authenticate,
  authorize(["admin"]),
  validateRequest({ body: createPlanSchema }),
  monetizationController.createPlan,
);
monetizationRouter.patch(
  "/plans/:id",
  authenticate,
  authorize(["admin"]),
  validateRequest({ body: updatePlanSchema }),
  monetizationController.updatePlan,
);
monetizationRouter.delete(
  "/plans/:id",
  authenticate,
  authorize(["admin"]),
  monetizationController.deletePlan,
);

monetizationRouter.patch(
  "/verification/:id/review",
  authenticate,
  authorize(["admin"]),
  validateRequest({ body: reviewVerificationSchema }),
  monetizationController.reviewVerification,
);

monetizationRouter.get(
  "/admin/analytics",
  authenticate,
  authorize(["admin"]),
  monetizationController.getAdminAnalytics,
);
