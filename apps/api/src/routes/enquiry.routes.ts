import { Router } from "express";

import { EnquiryController } from "../controllers/enquiry.controller.js";
import { authenticate, requireRoles, validateRequest } from "../middlewares/index.js";
import { EnquiryRepository } from "../repositories/enquiry.repository.js";
import { PropertyRepository } from "../repositories/property.repository.js";
import { LibraryRepository } from "../repositories/library.repository.js";
import { EnquiryService } from "../services/enquiry.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createEnquirySchema, updateEnquiryStatusSchema } from "../validators/enquiry.validator.js";

const enquiryRepository = new EnquiryRepository();
const propertyRepository = new PropertyRepository();
const libraryRepository = new LibraryRepository();
const enquiryService = new EnquiryService(enquiryRepository, propertyRepository, libraryRepository);
const enquiryController = new EnquiryController(enquiryService);

export const enquiryRouter: Router = Router();

// Admin endpoints
enquiryRouter.get("/", authenticate, requireRoles("admin"), asyncHandler(enquiryController.getAll));

// User endpoints
enquiryRouter.post(
  "/",
  authenticate,
  validateRequest(createEnquirySchema),
  asyncHandler(enquiryController.create),
);

enquiryRouter.get("/me", authenticate, asyncHandler(enquiryController.getMine));

// Owner lead management endpoints
enquiryRouter.get(
  "/owner/leads",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(enquiryController.getOwnerLeads),
);

enquiryRouter.patch(
  "/owner/leads/:id/status",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(updateEnquiryStatusSchema),
  asyncHandler(enquiryController.updateStatus),
);
