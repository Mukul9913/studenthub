import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import {
  getOwnerPipeline,
  updatePipelineStage,
  addPipelineNote,
  createFollowUp,
  getOwnerFollowUps,
  completeFollowUp,
  createTask,
  getOwnerTasks,
  updateTaskStatus,
  getActivityTimeline,
  getOwnerCRMAnalytics,
  getAdminCRMAnalytics,
} from "../services/crm.service.js";
import { getOwnerListingAnalytics } from "../services/recommendation.service.js";
import {
  updatePipelineStageSchema,
  addPipelineNoteSchema,
  createFollowUpSchema,
  createCRMTaskSchema,
  updateTaskStatusSchema,
} from "@studenthub/validation";
import type { PipelineStageConstant } from "@studenthub/constants";

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function getPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const data = await getOwnerPipeline(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const leadId = String(req.params.leadId);
    const parsed = updatePipelineStageSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Validation failed", 400, "VALIDATION_ERROR");

    const data = await updatePipelineStage(
      req.user.id,
      leadId,
      parsed.data.stage as PipelineStageConstant,
      req.user.id,
      parsed.data.note,
      parsed.data.lostReason,
      parsed.data.expectedConversionDate,
      parsed.data.dealValue,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const leadId = String(req.params.leadId);
    const parsed = addPipelineNoteSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Validation failed", 400, "VALIDATION_ERROR");
    await addPipelineNote(req.user.id, leadId, parsed.data.text, req.user.id);
    res.status(200).json({ success: true, message: "Note added successfully" });
  } catch (err) {
    next(err);
  }
}

// ─── Follow-ups ───────────────────────────────────────────────────────────────

export async function getFollowUps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const data = await getOwnerFollowUps(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createFollowUpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const parsed = createFollowUpSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Validation failed", 400, "VALIDATION_ERROR");
    const data = await createFollowUp(req.user.id, {
      leadId: parsed.data.leadId,
      scheduledAt: parsed.data.scheduledAt,
      type: parsed.data.type,
      notes: parsed.data.notes,
      reminderAt: parsed.data.reminderAt,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function completeFollowUpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const id = String(req.params.id);
    await completeFollowUp(req.user.id, id);
    res.status(200).json({ success: true, message: "Follow-up completed" });
  } catch (err) {
    next(err);
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const data = await getOwnerTasks(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const parsed = createCRMTaskSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Validation failed", 400, "VALIDATION_ERROR");
    const data = await createTask(req.user.id, {
      leadId: parsed.data.leadId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const id = String(req.params.id);
    const parsed = updateTaskStatusSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError("Validation failed", 400, "VALIDATION_ERROR");
    await updateTaskStatus(req.user.id, id, parsed.data.status);
    res.status(200).json({ success: true, message: "Task status updated" });
  } catch (err) {
    next(err);
  }
}

// ─── Activity Timeline ────────────────────────────────────────────────────────

export async function getActivityTimelineHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const leadId = String(req.params.leadId);
    const data = await getActivityTimeline(req.user.id, leadId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getCRMAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const data = await getOwnerCRMAnalytics(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAdminCRMAnalyticsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getAdminCRMAnalytics();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── Listing Analytics (Owner) ────────────────────────────────────────────────

export async function getListingAnalyticsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    const data = await getOwnerListingAnalytics(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
