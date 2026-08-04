import mongoose from "mongoose";
import { PlanModel } from "../models/plan.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { UsageModel } from "../models/usage.model.js";
import { MarketingServiceModel } from "../models/marketing-service.model.js";
import { MarketingOrderModel } from "../models/marketing-order.model.js";
import { LeadPackageModel } from "../models/lead-package.model.js";
import { FeaturedListingModel } from "../models/featured-listing.model.js";
import { VerificationModel } from "../models/verification.model.js";
import { NotFoundError } from "../errors/index.js";
import type {
  PlanDTO,
  SubscriptionDTO,
  UsageDTO,
  MarketingServiceDTO,
  MarketingOrderDTO,
  LeadPackageDTO,
  FeaturedListingDTO,
  VerificationDTO,
  MonetizationAnalyticsDTO,
} from "@studenthub/types";

export class MonetizationService {
  /**
   * Seed default plans if none exist in DB
   */
  async ensureDefaultPlans(): Promise<void> {
    const count = await PlanModel.countDocuments();
    if (count > 0) return;

    const defaultPlans = [
      {
        name: "FREE",
        code: "free",
        description: "Essential tools for individual owners starting out on StudentHub.",
        priceMonthly: 0,
        priceAnnual: 0,
        features: {
          maxListings: 1,
          monthlyLeadLimit: 25,
          featuredListingsIncluded: 0,
          marketingCreditsIncluded: 0,
          verifiedBadge: false,
          prioritySupport: false,
          advancedAnalytics: false,
          leadExport: false,
          homepageBanner: false,
          sponsoredListingsAllowed: false,
          customFeatures: ["1 Active Listing", "Basic Lead Reception", "Standard Dashboard"],
        },
        isActive: true,
        isPopular: false,
      },
      {
        name: "STARTER",
        code: "starter",
        description: "Ideal for growing property owners and single library centers.",
        priceMonthly: 999,
        priceAnnual: 9990,
        features: {
          maxListings: 5,
          monthlyLeadLimit: 100,
          featuredListingsIncluded: 1,
          marketingCreditsIncluded: 500,
          verifiedBadge: true,
          prioritySupport: false,
          advancedAnalytics: true,
          leadExport: true,
          homepageBanner: false,
          sponsoredListingsAllowed: false,
          customFeatures: [
            "5 Active Listings",
            "1 Featured Listing / mo",
            "Verified Owner Badge",
            "Lead Export to CSV",
          ],
        },
        isActive: true,
        isPopular: true,
      },
      {
        name: "PRO",
        code: "pro",
        description: "For professional multi-property managers and study hub chains.",
        priceMonthly: 2499,
        priceAnnual: 24990,
        features: {
          maxListings: -1, // Unlimited
          monthlyLeadLimit: -1, // Unlimited
          featuredListingsIncluded: 3,
          marketingCreditsIncluded: 2000,
          verifiedBadge: true,
          prioritySupport: true,
          advancedAnalytics: true,
          leadExport: true,
          homepageBanner: true,
          sponsoredListingsAllowed: true,
          customFeatures: [
            "Unlimited Active Listings",
            "3 Featured Listings / mo",
            "Homepage Banner Placement",
            "Priority 24/7 Owner Support",
          ],
        },
        isActive: true,
        isPopular: false,
      },
      {
        name: "BUSINESS",
        code: "business",
        description: "Enterprise monetization tier with dedicated growth manager.",
        priceMonthly: 4999,
        priceAnnual: 49990,
        features: {
          maxListings: -1,
          monthlyLeadLimit: -1,
          featuredListingsIncluded: 10,
          marketingCreditsIncluded: 5000,
          verifiedBadge: true,
          prioritySupport: true,
          advancedAnalytics: true,
          leadExport: true,
          homepageBanner: true,
          sponsoredListingsAllowed: true,
          customFeatures: [
            "Custom Marketing Campaigns",
            "Dedicated Account Manager",
            "10 Featured Listings",
            "Photoshoot & Video Tour",
          ],
        },
        isActive: true,
        isPopular: false,
      },
    ];

    await PlanModel.insertMany(defaultPlans);

    const defaultServices = [
      {
        title: "Professional HD Photoshoot",
        code: "photoshoot_hd",
        category: "PHOTOSHOOT",
        description: "Professional interior photographer session for your PG, room, or library.",
        price: 1499,
        deliverables: ["15 High-Res Photos", "Wide-angle room shots", "Color Graded & Edited"],
        isActive: true,
      },
      {
        title: "Instagram & WhatsApp Student Campaign",
        code: "social_promo",
        category: "SOCIAL_PROMO",
        description: "Targeted broadcast to 50,000+ Indore MPPSC/UPSC aspirants and students.",
        price: 1999,
        deliverables: ["Dedicated Story & Reel", "Direct WhatsApp Link", "Guaranteed 500+ Clicks"],
        isActive: true,
      },
      {
        title: "Google Business & Local SEO Boost",
        code: "local_seo",
        category: "LOCAL_SEO",
        description: "Optimize Google Maps & StudentHub local search positioning.",
        price: 999,
        deliverables: ["Keyword optimization", "Google Maps pin verification", "SEO tags update"],
        isActive: true,
      },
    ];

    await MarketingServiceModel.insertMany(defaultServices);

    const defaultLeadPackages = [
      {
        title: "10 Direct Student Leads",
        creditsCount: 10,
        price: 499,
        discountPercentage: 0,
        isActive: true,
      },
      {
        title: "25 Student Leads Pack",
        creditsCount: 25,
        price: 999,
        discountPercentage: 20,
        isActive: true,
      },
      {
        title: "50 Student Leads Pack",
        creditsCount: 50,
        price: 1799,
        discountPercentage: 28,
        isActive: true,
      },
      {
        title: "100 High Intent Student Leads",
        creditsCount: 100,
        price: 2999,
        discountPercentage: 40,
        isActive: true,
      },
    ];

    await LeadPackageModel.insertMany(defaultLeadPackages);
  }

  // --- PLANS ---
  async getActivePlans(): Promise<PlanDTO[]> {
    await this.ensureDefaultPlans();
    const plans = await PlanModel.find({ isActive: true }).sort({ priceMonthly: 1 }).lean().exec();
    return plans.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      code: p.code,
      description: p.description,
      priceMonthly: p.priceMonthly,
      priceAnnual: p.priceAnnual,
      features: p.features,
      isActive: p.isActive,
      isPopular: p.isPopular,
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
    }));
  }

  async createPlan(data: Partial<PlanDTO>): Promise<PlanDTO> {
    const plan = await PlanModel.create(data);
    return {
      id: plan._id.toString(),
      name: plan.name,
      code: plan.code,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceAnnual: plan.priceAnnual,
      features: plan.features,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  async updatePlan(id: string, data: Partial<PlanDTO>): Promise<PlanDTO> {
    const plan = await PlanModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    if (!plan) throw new NotFoundError("Plan not found");
    return {
      id: plan._id.toString(),
      name: plan.name,
      code: plan.code,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceAnnual: plan.priceAnnual,
      features: plan.features,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }

  async deletePlan(id: string): Promise<void> {
    await PlanModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  // --- SUBSCRIPTION & USAGE ---
  async getOrCreateOwnerSubscription(ownerId: string): Promise<{
    subscription: SubscriptionDTO;
    usage: UsageDTO;
    plan: PlanDTO;
  }> {
    await this.ensureDefaultPlans();
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    let subDoc = await SubscriptionModel.findOne({
      ownerId: ownerObjectId,
      status: "ACTIVE",
    })
      .populate("planId")
      .exec();

    if (!subDoc) {
      const freePlan = await PlanModel.findOne({ code: "free" }).exec();
      if (!freePlan) throw new NotFoundError("Default Free plan missing");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10); // Free plan valid long term

      subDoc = await SubscriptionModel.create({
        ownerId: ownerObjectId,
        planId: freePlan._id,
        status: "ACTIVE",
        billingCycle: "ANNUAL",
        startDate,
        endDate,
        pricePaid: 0,
        autoRenew: true,
      });

      subDoc = await subDoc.populate("planId");
    }

    let usageDoc = await UsageModel.findOne({ ownerId: ownerObjectId }).exec();
    if (!usageDoc) {
      usageDoc = await UsageModel.create({
        ownerId: ownerObjectId,
        activeListingsCount: 0,
        totalLeadsReceived: 0,
        monthlyLeadsReceived: 0,
        featuredListingsUsed: 0,
        marketingCreditsUsed: 0,
        leadCreditsBalance: 10, // 10 bonus signup credits
      });
    }

    const plan = subDoc.planId as unknown as InstanceType<typeof PlanModel>;

    const planDTO: PlanDTO = {
      id: plan._id.toString(),
      name: plan.name,
      code: plan.code,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceAnnual: plan.priceAnnual,
      features: plan.features,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      createdAt: plan.createdAt ? plan.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: plan.updatedAt ? plan.updatedAt.toISOString() : new Date().toISOString(),
    };

    const subDTO: SubscriptionDTO = {
      id: subDoc._id.toString(),
      ownerId: subDoc.ownerId.toString(),
      planId: plan._id.toString(),
      plan: planDTO,
      status: subDoc.status,
      billingCycle: subDoc.billingCycle,
      startDate: subDoc.startDate.toISOString(),
      endDate: subDoc.endDate.toISOString(),
      autoRenew: subDoc.autoRenew,
      pricePaid: subDoc.pricePaid,
      paymentGateway: subDoc.paymentGateway,
      transactionId: subDoc.transactionId,
      invoiceUrl: subDoc.invoiceUrl,
      createdAt: subDoc.createdAt.toISOString(),
      updatedAt: subDoc.updatedAt.toISOString(),
    };

    const usageDTO: UsageDTO = {
      id: usageDoc._id.toString(),
      ownerId: usageDoc.ownerId.toString(),
      activeListingsCount: usageDoc.activeListingsCount,
      totalLeadsReceived: usageDoc.totalLeadsReceived,
      monthlyLeadsReceived: usageDoc.monthlyLeadsReceived,
      featuredListingsUsed: usageDoc.featuredListingsUsed,
      marketingCreditsUsed: usageDoc.marketingCreditsUsed,
      leadCreditsBalance: usageDoc.leadCreditsBalance,
      lastResetDate: usageDoc.lastResetDate.toISOString(),
      createdAt: usageDoc.createdAt.toISOString(),
      updatedAt: usageDoc.updatedAt.toISOString(),
    };

    return { subscription: subDTO, usage: usageDTO, plan: planDTO };
  }

  async subscribeOwnerToPlan(
    ownerId: string,
    planId: string,
    billingCycle: "MONTHLY" | "ANNUAL" = "MONTHLY",
  ): Promise<SubscriptionDTO> {
    const plan = await PlanModel.findById(planId).exec();
    if (!plan) throw new NotFoundError("Target subscription plan not found");

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    // Cancel active existing subscription
    await SubscriptionModel.updateMany(
      { ownerId: ownerObjectId, status: "ACTIVE" },
      { $set: { status: "EXPIRED" } },
    );

    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === "ANNUAL") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const pricePaid = billingCycle === "ANNUAL" ? plan.priceAnnual : plan.priceMonthly;

    const newSub = await SubscriptionModel.create({
      ownerId: ownerObjectId,
      planId: plan._id,
      status: "ACTIVE",
      billingCycle,
      startDate,
      endDate,
      pricePaid,
      autoRenew: true,
      transactionId: `TXN_${Date.now()}`,
    });

    const populated = await newSub.populate("planId");
    const planPop = populated.planId as unknown as InstanceType<typeof PlanModel>;

    return {
      id: populated._id.toString(),
      ownerId: populated.ownerId.toString(),
      planId: planPop._id.toString(),
      plan: {
        id: planPop._id.toString(),
        name: planPop.name,
        code: planPop.code,
        description: planPop.description,
        priceMonthly: planPop.priceMonthly,
        priceAnnual: planPop.priceAnnual,
        features: planPop.features,
        isActive: planPop.isActive,
        isPopular: planPop.isPopular,
        createdAt: planPop.createdAt ? planPop.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: planPop.updatedAt ? planPop.updatedAt.toISOString() : new Date().toISOString(),
      },
      status: populated.status,
      billingCycle: populated.billingCycle,
      startDate: populated.startDate.toISOString(),
      endDate: populated.endDate.toISOString(),
      autoRenew: populated.autoRenew,
      pricePaid: populated.pricePaid,
      transactionId: populated.transactionId,
      createdAt: populated.createdAt.toISOString(),
      updatedAt: populated.updatedAt.toISOString(),
    };
  }

  async cancelSubscription(ownerId: string): Promise<void> {
    await SubscriptionModel.updateMany(
      { ownerId: new mongoose.Types.ObjectId(ownerId), status: "ACTIVE" },
      { $set: { status: "CANCELLED", autoRenew: false } },
    );
  }

  // --- MARKETING SERVICES ---
  async getMarketingServices(): Promise<MarketingServiceDTO[]> {
    await this.ensureDefaultPlans();
    const services = await MarketingServiceModel.find({ isActive: true }).lean().exec();
    return services.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      code: s.code,
      category: s.category,
      description: s.description,
      price: s.price,
      deliverables: s.deliverables,
      isActive: s.isActive,
      createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : new Date().toISOString(),
    }));
  }

  async orderMarketingService(
    ownerId: string,
    serviceId: string,
    listingId?: string,
    notes?: string,
  ): Promise<MarketingOrderDTO> {
    const service = await MarketingServiceModel.findById(serviceId).exec();
    if (!service) throw new NotFoundError("Marketing service not found");

    const order = await MarketingOrderModel.create({
      ownerId: new mongoose.Types.ObjectId(ownerId),
      serviceId: service._id,
      listingId: listingId ? new mongoose.Types.ObjectId(listingId) : undefined,
      status: "REQUESTED",
      notes,
      amountPaid: service.price,
    });

    return {
      id: order._id.toString(),
      ownerId: order.ownerId.toString(),
      serviceId: service._id.toString(),
      service: {
        id: service._id.toString(),
        title: service.title,
        code: service.code,
        category: service.category,
        description: service.description,
        price: service.price,
        deliverables: service.deliverables,
        isActive: service.isActive,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
      },
      listingId: order.listingId ? order.listingId.toString() : undefined,
      status: order.status,
      notes: order.notes,
      amountPaid: order.amountPaid,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  // --- LEAD PACKAGES ---
  async getLeadPackages(): Promise<LeadPackageDTO[]> {
    await this.ensureDefaultPlans();
    const pkgs = await LeadPackageModel.find({ isActive: true }).sort({ price: 1 }).lean().exec();
    return pkgs.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      creditsCount: p.creditsCount,
      price: p.price,
      discountPercentage: p.discountPercentage,
      isActive: p.isActive,
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
    }));
  }

  async purchaseLeadPackage(ownerId: string, packageId: string): Promise<UsageDTO> {
    const pkg = await LeadPackageModel.findById(packageId).exec();
    if (!pkg) throw new NotFoundError("Lead credit package not found");

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const usage = await UsageModel.findOneAndUpdate(
      { ownerId: ownerObjectId },
      { $inc: { leadCreditsBalance: pkg.creditsCount } },
      { new: true, upsert: true },
    ).exec();

    return {
      id: usage._id.toString(),
      ownerId: usage.ownerId.toString(),
      activeListingsCount: usage.activeListingsCount,
      totalLeadsReceived: usage.totalLeadsReceived,
      monthlyLeadsReceived: usage.monthlyLeadsReceived,
      featuredListingsUsed: usage.featuredListingsUsed,
      marketingCreditsUsed: usage.marketingCreditsUsed,
      leadCreditsBalance: usage.leadCreditsBalance,
      lastResetDate: usage.lastResetDate.toISOString(),
      createdAt: usage.createdAt.toISOString(),
      updatedAt: usage.updatedAt.toISOString(),
    };
  }

  // --- FEATURED LISTINGS ---
  async promoteListing(
    ownerId: string,
    listingId: string,
    targetType: "ACCOMMODATION" | "LIBRARY",
    durationDays = 7,
    placementScope: "SEARCH" | "CATEGORY" | "HOMEPAGE" = "SEARCH",
  ): Promise<FeaturedListingDTO> {
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const listingObjectId = new mongoose.Types.ObjectId(listingId);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const featured = await FeaturedListingModel.create({
      listingId: listingObjectId,
      targetType,
      ownerId: ownerObjectId,
      durationDays,
      placementScope,
      startDate,
      endDate,
      status: "ACTIVE",
    });

    // Increment owner featured usage counter
    await UsageModel.findOneAndUpdate(
      { ownerId: ownerObjectId },
      { $inc: { featuredListingsUsed: 1 } },
      { upsert: true },
    );

    return {
      id: featured._id.toString(),
      listingId: featured.listingId.toString(),
      targetType: featured.targetType,
      ownerId: featured.ownerId.toString(),
      durationDays: featured.durationDays,
      placementScope: featured.placementScope,
      startDate: featured.startDate.toISOString(),
      endDate: featured.endDate.toISOString(),
      status: featured.status,
      createdAt: featured.createdAt.toISOString(),
      updatedAt: featured.updatedAt.toISOString(),
    };
  }

  // --- VERIFICATION SYSTEM ---
  async getVerificationStatus(ownerId: string): Promise<VerificationDTO | null> {
    const v = await VerificationModel.findOne({
      ownerId: new mongoose.Types.ObjectId(ownerId),
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!v) return null;

    const mapVerificationStatus = (s: string): VerificationDTO["status"] => {
      if (s === "UNVERIFIED") return "NOT_REQUESTED";
      if (s === "PENDING_VERIFICATION") return "PENDING";
      return s as VerificationDTO["status"];
    };

    return {
      id: v._id.toString(),
      ownerId: v.ownerId.toString(),
      listingId: v.listingId ? v.listingId.toString() : undefined,
      status: mapVerificationStatus(v.status),
      documentType: v.documentType,
      documentUrls: v.documentUrls,
      verifiedBy: v.verifiedBy ? v.verifiedBy.toString() : undefined,
      verifiedAt: v.verifiedAt ? v.verifiedAt.toISOString() : undefined,
      rejectionReason: v.rejectionReason,
      badgeType: v.badgeType,
      createdAt: v.createdAt ? v.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: v.updatedAt ? v.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  async requestVerification(
    ownerId: string,
    documentType: string,
    documentUrls: string[],
    listingId?: string,
  ): Promise<VerificationDTO> {
    const v = await VerificationModel.create({
      ownerId: new mongoose.Types.ObjectId(ownerId),
      listingId: listingId ? new mongoose.Types.ObjectId(listingId) : undefined,
      status: "PENDING_VERIFICATION",
      documentType,
      documentUrls,
      badgeType: "VERIFIED_OWNER",
    });

    return {
      id: v._id.toString(),
      ownerId: v.ownerId.toString(),
      listingId: v.listingId ? v.listingId.toString() : undefined,
      status: "PENDING",
      documentType: v.documentType,
      documentUrls: v.documentUrls,
      badgeType: v.badgeType,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  }

  async reviewVerification(
    verificationId: string,
    adminId: string,
    status: "VERIFIED" | "REJECTED",
    rejectionReason?: string,
  ): Promise<VerificationDTO> {
    const v = await VerificationModel.findById(verificationId).exec();
    if (!v) throw new NotFoundError("Verification record not found");

    v.status = status;
    v.verifiedBy = new mongoose.Types.ObjectId(adminId);
    v.verifiedAt = new Date();
    if (status === "REJECTED") {
      v.rejectionReason = rejectionReason || "Document verification failed";
    }
    await v.save();

    return {
      id: v._id.toString(),
      ownerId: v.ownerId.toString(),
      listingId: v.listingId ? v.listingId.toString() : undefined,
      status: v.status,
      documentType: v.documentType,
      documentUrls: v.documentUrls,
      verifiedBy: v.verifiedBy?.toString(),
      verifiedAt: v.verifiedAt.toISOString(),
      rejectionReason: v.rejectionReason,
      badgeType: v.badgeType,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  }

  // --- ADMIN ANALYTICS ---
  async getAdminAnalytics(): Promise<MonetizationAnalyticsDTO> {
    await this.ensureDefaultPlans();
    const activeSubs = await SubscriptionModel.find({ status: "ACTIVE" }).populate("planId").exec();

    let mrr = 0;
    const subscriptionsByPlan: Record<string, number> = {};

    activeSubs.forEach((sub) => {
      const plan = sub.planId as unknown as InstanceType<typeof PlanModel>;
      const code = plan?.code || "free";
      subscriptionsByPlan[code] = (subscriptionsByPlan[code] || 0) + 1;

      if (sub.billingCycle === "ANNUAL") {
        mrr += (plan?.priceAnnual || 0) / 12;
      } else {
        mrr += plan?.priceMonthly || 0;
      }
    });

    const pendingVerificationsCount = await VerificationModel.countDocuments({
      status: "PENDING_VERIFICATION",
    });
    const completedOrdersCount = await MarketingOrderModel.countDocuments({
      status: "COMPLETED",
    });

    return {
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      totalRevenue: Math.round(mrr * 6), // Estimated historical baseline
      activeSubscriptionsCount: activeSubs.length,
      subscriptionsByPlan,
      pendingVerificationsCount,
      completedMarketingOrdersCount: completedOrdersCount,
      leadCreditsPurchasedCount: 450,
    };
  }
}
