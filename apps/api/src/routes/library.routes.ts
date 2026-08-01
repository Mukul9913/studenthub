import { Router } from "express";

import { LibraryController } from "../controllers/library.controller.js";
import { authenticate, requireRoles, validateRequest } from "../middlewares/index.js";
import { LibraryRepository } from "../repositories/library.repository.js";
import { LibraryService } from "../services/library.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createLibrarySchema,
  updateLibrarySchema,
  listLibrariesSchema,
} from "../validators/library.validator.js";

const libraryRepository = new LibraryRepository();
const libraryService = new LibraryService(libraryRepository);
const libraryController = new LibraryController(libraryService);

export const libraryRouter: Router = Router();

libraryRouter.get(
  "/owner/my-libraries",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(libraryController.getMyLibraries),
);

libraryRouter.post(
  "/",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(createLibrarySchema),
  asyncHandler(libraryController.create),
);

libraryRouter.patch(
  "/:id",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(updateLibrarySchema),
  asyncHandler(libraryController.update),
);

libraryRouter.delete(
  "/:id",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(libraryController.delete),
);

libraryRouter.get("/:id", asyncHandler(libraryController.getById));

libraryRouter.get("/", validateRequest(listLibrariesSchema), asyncHandler(libraryController.list));
