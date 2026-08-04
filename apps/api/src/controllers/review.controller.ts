import type { Request, Response } from "express";
import { ReputationService } from "../services/reputation.service.js";
import { UnauthorizedError, ForbiddenError } from "../errors/app-error.js";

export class ReviewController {
  private reputationService: ReputationService;

  constructor() {
    this.reputationService = new ReputationService();
  }

  createReview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");

    const review = await this.reputationService.createReview(req.user.id, req.body);
    res.status(201).json({ success: true, data: review });
  };

  getReviews = async (req: Request, res: Response): Promise<void> => {
    const targetType = req.query.targetType as string;
    const targetId = req.query.targetId as string;
    const ownerId = req.query.ownerId as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await this.reputationService.getReviews(
      { targetType, targetId, ownerId, page, limit },
      req.user?.id,
    );

    res.status(200).json({ success: true, data: result });
  };

  replyReview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      throw new ForbiddenError("Only property/library owners can reply to reviews", "OWNER_ONLY");
    }

    const reviewId = req.params.id;
    const { comment } = req.body;

    const result = await this.reputationService.replyReview(
      req.user.id,
      reviewId as string,
      comment,
    );
    res.status(200).json({ success: true, data: result });
  };

  reactReview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");

    const reviewId = req.params.id;
    const { type } = req.body;

    const result = await this.reputationService.reactReview(req.user.id, reviewId as string, type);
    res.status(200).json({ success: true, data: result });
  };

  reportReview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");

    const reviewId = req.params.id;
    const { reason, details } = req.body;

    const result = await this.reputationService.reportReview(
      req.user.id,
      reviewId as string,
      reason,
      details,
    );
    res.status(200).json({ success: true, data: result });
  };

  getOwnerPublicProfile = async (req: Request, res: Response): Promise<void> => {
    const ownerId = req.params.id;
    const profile = await this.reputationService.getOwnerPublicProfile(ownerId as string);
    res.status(200).json({ success: true, data: profile });
  };

  getOwnerScore = async (req: Request, res: Response): Promise<void> => {
    const ownerId = req.params.id;
    const score = await this.reputationService.calculateOwnerScore(ownerId as string);
    res.status(200).json({ success: true, data: score });
  };

  getOwnerReviewAnalytics = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");

    const analytics = await this.reputationService.getOwnerReviewAnalytics(req.user.id);
    res.status(200).json({ success: true, data: analytics });
  };

  getAdminReviewQueue = async (req: Request, res: Response): Promise<void> => {
    const status = req.query.status as string;
    const queue = await this.reputationService.getAdminReviewQueue(status);
    res.status(200).json({ success: true, data: queue });
  };

  updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
    const reviewId = req.params.id;
    const { status } = req.body;

    const updated = await this.reputationService.updateReviewStatus(reviewId as string, status);
    res.status(200).json({ success: true, data: updated });
  };
}
