import { Router } from "express";

import { AccommodationController } from "../controllers/accommodation.controller.js";
import { authenticate, requireRoles, validateRequest } from "../middlewares/index.js";
import { uploadAccommodationImages } from "../middlewares/upload.middleware.js";
import { PropertyRepository } from "../repositories/property.repository.js";
import { RoomRepository } from "../repositories/room.repository.js";
import { AccommodationService } from "../services/accommodation.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createAccommodationSchema,
  updateAccommodationSchema,
  listAccommodationsSchema,
} from "../validators/accommodation.validator.js";

const propertyRepository = new PropertyRepository();
const roomRepository = new RoomRepository();
const accommodationService = new AccommodationService(propertyRepository, roomRepository);
const accommodationController = new AccommodationController(accommodationService);

export const accommodationRouter: Router = Router();

accommodationRouter.post(
  "/upload-images",
  authenticate,
  requireRoles("owner", "admin"),
  uploadAccommodationImages,
  asyncHandler(accommodationController.uploadImages),
);

accommodationRouter.get("/nearby", asyncHandler(accommodationController.getNearby));
accommodationRouter.get("/search", asyncHandler(accommodationController.search));

accommodationRouter.get(
  "/owner/my-listings",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(accommodationController.getMyListings),
);

accommodationRouter.post(
  "/",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(createAccommodationSchema),
  asyncHandler(accommodationController.create),
);

accommodationRouter.patch(
  "/:id",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(updateAccommodationSchema),
  asyncHandler(accommodationController.update),
);

accommodationRouter.post(
  "/:id/submit-review",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(accommodationController.submitForReview),
);

accommodationRouter.delete(
  "/:id",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(accommodationController.delete),
);

accommodationRouter.get("/:id", asyncHandler(accommodationController.getById));

accommodationRouter.get(
  "/",
  validateRequest(listAccommodationsSchema),
  asyncHandler(accommodationController.list),
);
