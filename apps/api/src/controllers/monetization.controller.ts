import type { Request, Response } from "express";
import type { MonetizationService } from "../services/monetization.service.js";
import { UnauthorizedError } from "../errors/index.js";

export class MonetizationController {
  constructor(private monetizationService: MonetizationService) {}

  getPlans = async (_req: Request, res: Response): Promise<void> => {
    const plans = await this.monetizationService.getActivePlans();
    res.status(200).json({ success: true, data: plans });
  };

  createPlan = async (req: Request, res: Response): Promise<void> => {
    const plan = await this.monetizationService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  };

  updatePlan = async (req: Request, res: Response): Promise<void> => {
    const planId = (req.params.id as string) || "";
    const plan = await this.monetizationService.updatePlan(planId, req.body);
    res.status(200).json({ success: true, data: plan });
  };

  deletePlan = async (req: Request, res: Response): Promise<void> => {
    const planId = (req.params.id as string) || "";
    await this.monetizationService.deletePlan(planId);
    res.status(200).json({ success: true, message: "Plan disabled successfully" });
  };

  getMySubscription = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const data = await this.monetizationService.getOrCreateOwnerSubscription(req.user.id);
    res.status(200).json({ success: true, data });
  };

  subscribePlan = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { planId, billingCycle } = req.body;
    const subscription = await this.monetizationService.subscribeOwnerToPlan(
      req.user.id,
      planId,
      billingCycle,
    );
    res.status(200).json({ success: true, data: subscription });
  };

  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    await this.monetizationService.cancelSubscription(req.user.id);
    res.status(200).json({ success: true, message: "Subscription cancelled" });
  };

  getMarketingServices = async (_req: Request, res: Response): Promise<void> => {
    const services = await this.monetizationService.getMarketingServices();
    res.status(200).json({ success: true, data: services });
  };

  orderMarketingService = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { serviceId, listingId, notes } = req.body;
    const order = await this.monetizationService.orderMarketingService(
      req.user.id,
      serviceId,
      listingId,
      notes,
    );
    res.status(201).json({ success: true, data: order });
  };

  getLeadPackages = async (_req: Request, res: Response): Promise<void> => {
    const pkgs = await this.monetizationService.getLeadPackages();
    res.status(200).json({ success: true, data: pkgs });
  };

  purchaseLeadPackage = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const usage = await this.monetizationService.purchaseLeadPackage(
      req.user.id,
      req.body.packageId,
    );
    res.status(200).json({ success: true, data: usage });
  };

  promoteListing = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { listingId, targetType, durationDays, placementScope } = req.body;
    const featured = await this.monetizationService.promoteListing(
      req.user.id,
      listingId,
      targetType,
      durationDays,
      placementScope,
    );
    res.status(201).json({ success: true, data: featured });
  };

  getVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const status = await this.monetizationService.getVerificationStatus(req.user.id);
    res.status(200).json({ success: true, data: status });
  };

  requestVerification = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const { documentType, documentUrls, listingId } = req.body;
    const record = await this.monetizationService.requestVerification(
      req.user.id,
      documentType,
      documentUrls,
      listingId,
    );
    res.status(201).json({ success: true, data: record });
  };

  reviewVerification = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
    const verificationId = (req.params.id as string) || "";
    const { status, rejectionReason } = req.body;
    const record = await this.monetizationService.reviewVerification(
      verificationId,
      req.user.id,
      status,
      rejectionReason,
    );
    res.status(200).json({ success: true, data: record });
  };

  getAdminAnalytics = async (_req: Request, res: Response): Promise<void> => {
    const analytics = await this.monetizationService.getAdminAnalytics();
    res.status(200).json({ success: true, data: analytics });
  };
}
