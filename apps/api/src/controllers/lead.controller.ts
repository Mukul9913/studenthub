import type { Request, Response } from "express";
import type { LeadService } from "../services/lead.service.js";
import { UnauthorizedError, ForbiddenError } from "../errors/index.js";

export class LeadController {
  constructor(private leadService: LeadService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const lead = await this.leadService.createLead(req.user, req.body);

    res.status(201).json({
      success: true,
      data: lead,
    });
  };

  getMyLeads = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const leads = await this.leadService.getMyLeads(req.user.id);

    res.status(200).json({
      success: true,
      data: leads,
    });
  };

  getOwnerLeads = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const { status, targetType, page, limit } = req.query;

    const result = await this.leadService.getOwnerLeads(req.user.id, {
      status: status ? String(status) : undefined,
      targetType: targetType ? String(targetType) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
    });
  };

  getOwnerAnalytics = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const analytics = await this.leadService.getOwnerAnalytics(req.user.id);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  };

  getAdminLeads = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new ForbiddenError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const { status, targetType, ownerId, page, limit } = req.query;

    const result = await this.leadService.getAdminLeads({
      status: status ? String(status) : undefined,
      targetType: targetType ? String(targetType) : undefined,
      ownerId: ownerId ? String(ownerId) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
    });
  };

  getAdminAnalytics = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || req.user.role !== "admin") {
      throw new ForbiddenError("Admin access required", "ADMIN_AUTH_REQUIRED");
    }

    const analytics = await this.leadService.getAdminAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const { id } = req.params;
    const updated = await this.leadService.updateLeadStatus(
      (id as string) || "",
      req.user,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  };

  addFollowUp = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const { id } = req.params;
    const followUp = await this.leadService.addFollowUp(
      (id as string) || "",
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: followUp,
    });
  };

  getTimeline = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication is required", "AUTH_REQUIRED");
    }

    const { id } = req.params;
    const timelineData = await this.leadService.getLeadTimeline((id as string) || "");

    res.status(200).json({
      success: true,
      data: timelineData,
    });
  };
}
