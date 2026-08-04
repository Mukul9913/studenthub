import { Router } from "express";
import { LeadController } from "../controllers/lead.controller.js";
import { LeadService } from "../services/lead.service.js";
import { LeadRepository } from "../repositories/lead.repository.js";
import { PropertyRepository } from "../repositories/property.repository.js";
import { LibraryRepository } from "../repositories/library.repository.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.js";
import {
  createLeadSchema,
  updateLeadStatusSchema,
  addFollowUpSchema,
} from "@studenthub/validation";

const leadRepository = new LeadRepository();
const propertyRepository = new PropertyRepository();
const libraryRepository = new LibraryRepository();
const leadService = new LeadService(leadRepository, propertyRepository, libraryRepository);
const leadController = new LeadController(leadService);

export const leadRouter: Router = Router();

// Student / General Lead Endpoints
leadRouter.post("/", authenticate, validateRequest(createLeadSchema), leadController.create);
leadRouter.get("/my", authenticate, leadController.getMyLeads);

// Owner Lead Endpoints
leadRouter.get("/owner", authenticate, authorize(["owner", "admin"]), leadController.getOwnerLeads);
leadRouter.get(
  "/owner/analytics",
  authenticate,
  authorize(["owner", "admin"]),
  leadController.getOwnerAnalytics,
);

// Admin Lead Endpoints
leadRouter.get("/admin", authenticate, authorize(["admin"]), leadController.getAdminLeads);
leadRouter.get(
  "/admin/analytics",
  authenticate,
  authorize(["admin"]),
  leadController.getAdminAnalytics,
);

// Individual Lead Operations
leadRouter.patch(
  "/:id/status",
  authenticate,
  validateRequest(updateLeadStatusSchema),
  leadController.updateStatus,
);
leadRouter.post(
  "/:id/followups",
  authenticate,
  authorize(["owner", "admin"]),
  validateRequest(addFollowUpSchema),
  leadController.addFollowUp,
);
leadRouter.get("/:id/timeline", authenticate, leadController.getTimeline);
