import { Router } from "express";
import { AdminService } from "../services/admin.service.js";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticate, requireRoles, adminRateLimiter } from "../middlewares/index.js";

const adminService = new AdminService();
const adminController = new AdminController(adminService);

export const adminRouter = Router();

adminRouter.use(authenticate, requireRoles("admin"), adminRateLimiter);

adminRouter.get("/overview", adminController.getOverview);
adminRouter.get("/listings", adminController.getListings);
adminRouter.get("/listings/:domain/:id", adminController.getListingDetails);
adminRouter.patch("/listings/:domain/:id/status", adminController.updateListingStatus);
adminRouter.get("/users", adminController.getUsers);
adminRouter.get("/owners", adminController.getOwners);
