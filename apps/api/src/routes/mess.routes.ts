import { Router } from "express";

import { MessController } from "../controllers/mess.controller.js";
import { authenticate, requireRoles, validateRequest } from "../middlewares/index.js";
import { MessRepository } from "../repositories/mess.repository.js";
import { MessService } from "../services/mess.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createMessSchema,
  listMessSchema,
  replaceMessMenuSchema,
  replaceMessPlansSchema,
  updateMessSchema,
} from "../validators/mess.validator.js";

const messRepository = new MessRepository();
const messService = new MessService(messRepository);
const messController = new MessController(messService);

export const messRouter: Router = Router();

messRouter.get(
  "/owner/my-messes",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(messController.getMyMesses),
);

messRouter.post(
  "/",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(createMessSchema),
  asyncHandler(messController.create),
);

messRouter.patch(
  "/:id",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(updateMessSchema),
  asyncHandler(messController.update),
);

messRouter.delete(
  "/:id",
  authenticate,
  requireRoles("owner", "admin"),
  asyncHandler(messController.delete),
);

messRouter.put(
  "/:id/menu",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(replaceMessMenuSchema),
  asyncHandler(messController.replaceMenu),
);

messRouter.put(
  "/:id/plans",
  authenticate,
  requireRoles("owner", "admin"),
  validateRequest(replaceMessPlansSchema),
  asyncHandler(messController.replacePlans),
);

messRouter.get("/:idOrSlug", asyncHandler(messController.getByIdOrSlug));

messRouter.get("/", validateRequest(listMessSchema), asyncHandler(messController.list));
