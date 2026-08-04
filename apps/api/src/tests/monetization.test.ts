import assert from "node:assert";
import { describe, it } from "node:test";
import mongoose from "mongoose";
import { PlanModel } from "../models/plan.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { UsageModel } from "../models/usage.model.js";
import { MarketingServiceModel } from "../models/marketing-service.model.js";
import { LeadPackageModel } from "../models/lead-package.model.js";
import { FeaturedListingModel } from "../models/featured-listing.model.js";
import { VerificationModel } from "../models/verification.model.js";
import { MonetizationService } from "../services/monetization.service.js";

describe("Revenue & Monetization Engine Unit Tests", () => {
  it("PlanModel should validate a correct subscription plan document", async () => {
    const plan = new PlanModel({
      name: "PRO TEST",
      code: "pro_test",
      description: "Test pro plan for multi-property owners",
      priceMonthly: 2499,
      priceAnnual: 24990,
      features: {
        maxListings: -1,
        monthlyLeadLimit: 500,
        featuredListingsIncluded: 3,
        marketingCreditsIncluded: 2000,
        verifiedBadge: true,
        prioritySupport: true,
        advancedAnalytics: true,
        leadExport: true,
        homepageBanner: true,
        sponsoredListingsAllowed: true,
      },
      isActive: true,
      isPopular: true,
    });

    const err = await plan.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("SubscriptionModel should validate active owner subscription document", async () => {
    const sub = new SubscriptionModel({
      ownerId: new mongoose.Types.ObjectId(),
      planId: new mongoose.Types.ObjectId(),
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      pricePaid: 2499,
    });

    const err = await sub.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("UsageModel should validate quota tracking document", async () => {
    const usage = new UsageModel({
      ownerId: new mongoose.Types.ObjectId(),
      activeListingsCount: 3,
      totalLeadsReceived: 45,
      monthlyLeadsReceived: 12,
      featuredListingsUsed: 1,
      marketingCreditsUsed: 500,
      leadCreditsBalance: 25,
    });

    const err = await usage.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("MarketingServiceModel should validate marketing service offering", async () => {
    const service = new MarketingServiceModel({
      title: "HD Photoshoot",
      code: "photoshoot_hd",
      category: "PHOTOSHOOT",
      description: "Professional interior photographer session",
      price: 1499,
      deliverables: ["15 High-Res Photos"],
      isActive: true,
    });

    const err = await service.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("LeadPackageModel should validate pay-per-lead credit bundle", async () => {
    const pkg = new LeadPackageModel({
      title: "50 Student Leads Pack",
      creditsCount: 50,
      price: 1799,
      discountPercentage: 28,
      isActive: true,
    });

    const err = await pkg.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("FeaturedListingModel should validate promoted listing record", async () => {
    const featured = new FeaturedListingModel({
      listingId: new mongoose.Types.ObjectId(),
      targetType: "ACCOMMODATION",
      ownerId: new mongoose.Types.ObjectId(),
      durationDays: 15,
      placementScope: "HOMEPAGE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
    });

    const err = await featured.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("VerificationModel should validate owner verification document", async () => {
    const v = new VerificationModel({
      ownerId: new mongoose.Types.ObjectId(),
      status: "PENDING_VERIFICATION",
      documentType: "Aadhaar Card",
      documentUrls: ["https://example.com/doc.pdf"],
      badgeType: "VERIFIED_OWNER",
    });

    const err = await v.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("MonetizationService should instantiate cleanly", () => {
    const service = new MonetizationService();
    assert.ok(service);
    assert.equal(typeof service.ensureDefaultPlans, "function");
  });
});
