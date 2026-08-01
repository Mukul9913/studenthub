import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { UserRepository } from "../repositories/user.repository.js";
import { UserService } from "../services/user.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createUserSchema, getUserSchema, updateUserSchema } from "../validators/user.validator.js";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRouter: Router = Router();

userRouter.post("/", validateRequest(createUserSchema), asyncHandler(userController.createUser));

userRouter.get("/:id", validateRequest(getUserSchema), asyncHandler(userController.getUser));

userRouter.patch(
  "/:id",
  validateRequest(updateUserSchema),
  asyncHandler(userController.updateUser),
);
