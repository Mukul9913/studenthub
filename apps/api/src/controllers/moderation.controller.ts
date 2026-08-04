import type { Request, Response } from "express";
import type { ModerationService } from "../services/moderation.service.js";
import { UnauthorizedError } from "../errors/index.js";

export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  submitForReview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId, notes } = req.body;
    const result = await this.moderationService.submitForReview(
      req.user,
      targetType,
      targetId,
      notes,
    );
    res.status(200).json({ success: true, data: result });
  };

  startReview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId } = req.body;
    const result = await this.moderationService.startReview(req.user, targetType, targetId);
    res.status(200).json({ success: true, data: result });
  };

  approveListing = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId, notes, verifyListing } = req.body;
    const result = await this.moderationService.approveListing(
      req.user,
      targetType,
      targetId,
      notes,
      verifyListing,
    );
    res.status(200).json({ success: true, data: result });
  };

  rejectListing = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId, reason, notes } = req.body;
    const result = await this.moderationService.rejectListing(
      req.user,
      targetType,
      targetId,
      reason,
      notes,
    );
    res.status(200).json({ success: true, data: result });
  };

  suspendListing = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId, reason, notes } = req.body;
    const result = await this.moderationService.suspendListing(
      req.user,
      targetType,
      targetId,
      reason,
      notes,
    );
    res.status(200).json({ success: true, data: result });
  };

  archiveListing = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId, reason } = req.body;
    const result = await this.moderationService.archiveListing(
      req.user,
      targetType,
      targetId,
      reason,
    );
    res.status(200).json({ success: true, data: result });
  };

  restoreListing = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId } = req.body;
    const result = await this.moderationService.restoreListing(req.user, targetType, targetId);
    res.status(200).json({ success: true, data: result });
  };

  assignModerator = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId, moderatorId } = req.body;
    const result = await this.moderationService.assignModerator(
      req.user,
      targetType,
      targetId,
      moderatorId,
    );
    res.status(200).json({ success: true, data: result });
  };

  addComment = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { targetType, targetId, comment, isInternalOnly } = req.body;
    const result = await this.moderationService.addComment(
      req.user,
      targetType,
      targetId,
      comment,
      isInternalOnly,
    );
    res.status(201).json({ success: true, data: result });
  };

  getHistory = async (req: Request, res: Response): Promise<void> => {
    const rawTargetType = req.query.targetType;
    const rawTargetId = req.query.targetId;
    const targetType =
      ((Array.isArray(rawTargetType) ? rawTargetType[0] : rawTargetType) as string) ||
      "ACCOMMODATION";
    const targetId =
      (req.params.id as string) ||
      ((Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId) as string) ||
      "";
    const history = await this.moderationService.getHistory(targetType, targetId);
    res.status(200).json({ success: true, data: history });
  };

  getComments = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const rawTargetType = req.query.targetType;
    const rawTargetId = req.query.targetId;
    const targetType =
      ((Array.isArray(rawTargetType) ? rawTargetType[0] : rawTargetType) as string) ||
      "ACCOMMODATION";
    const targetId =
      (req.params.id as string) ||
      ((Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId) as string) ||
      "";
    const comments = await this.moderationService.getComments(req.user, targetType, targetId);
    res.status(200).json({ success: true, data: comments });
  };

  getAdminQueue = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      targetType: req.query.targetType as string,
      status: req.query.status as string,
      moderatorId: req.query.moderatorId as string,
      ownerId: req.query.ownerId as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };
    const queue = await this.moderationService.getAdminQueue(filters);
    res.status(200).json({ success: true, ...queue });
  };

  getAdminAnalytics = async (_req: Request, res: Response): Promise<void> => {
    const analytics = await this.moderationService.getAdminAnalytics();
    res.status(200).json({ success: true, data: analytics });
  };
}
