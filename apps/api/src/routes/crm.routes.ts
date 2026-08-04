import { Router } from "express";
import { authenticate, requireRoles } from "../middlewares/auth.middleware.js";
import {
  getPipeline,
  updateStage,
  addNote,
  getFollowUps,
  createFollowUpHandler,
  completeFollowUpHandler,
  getTasks,
  createTaskHandler,
  updateTaskStatusHandler,
  getActivityTimelineHandler,
  getCRMAnalytics,
  getAdminCRMAnalyticsHandler,
  getListingAnalyticsHandler,
} from "../controllers/crm.controller.js";

const router = Router();

// All CRM routes require authentication
router.use(authenticate);

// ─── Owner CRM Pipeline ───────────────────────────────────────────────────────
router.get("/pipeline", requireRoles("owner"), getPipeline);
router.patch("/pipeline/:leadId/stage", requireRoles("owner"), updateStage);
router.post("/pipeline/:leadId/note", requireRoles("owner"), addNote);

// ─── Follow-ups ───────────────────────────────────────────────────────────────
router.get("/followups", requireRoles("owner"), getFollowUps);
router.post("/followups", requireRoles("owner"), createFollowUpHandler);
router.patch("/followups/:id/complete", requireRoles("owner"), completeFollowUpHandler);

// ─── Tasks ────────────────────────────────────────────────────────────────────
router.get("/tasks", requireRoles("owner"), getTasks);
router.post("/tasks", requireRoles("owner"), createTaskHandler);
router.patch("/tasks/:id/status", requireRoles("owner"), updateTaskStatusHandler);

// ─── Activity Timeline ────────────────────────────────────────────────────────
router.get("/activity/:leadId", requireRoles("owner"), getActivityTimelineHandler);

// ─── Owner Analytics ──────────────────────────────────────────────────────────
router.get("/analytics", requireRoles("owner"), getCRMAnalytics);
router.get("/listing-analytics", requireRoles("owner"), getListingAnalyticsHandler);

// ─── Admin Analytics ──────────────────────────────────────────────────────────
router.get("/admin/analytics", requireRoles("admin"), getAdminCRMAnalyticsHandler);

export { router as crmRouter };
