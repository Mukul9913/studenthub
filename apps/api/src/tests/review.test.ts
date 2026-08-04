import assert from "node:assert";
import { describe, it } from "node:test";
import mongoose from "mongoose";
import { ReviewModel } from "../models/review.model.js";
import { ReviewReplyModel } from "../models/review-reply.model.js";
import { ReviewReactionModel } from "../models/review-reaction.model.js";
import { ReviewReportModel } from "../models/review-report.model.js";
import { OwnerScoreModel } from "../models/owner-score.model.js";
import { BadgeModel } from "../models/badge.model.js";
import { ReputationService } from "../services/reputation.service.js";

describe("Trust & Reputation Engine Unit Tests", () => {
  it("ReviewModel should validate a correct review document", async () => {
    const review = new ReviewModel({
      targetType: "ACCOMMODATION",
      targetId: new mongoose.Types.ObjectId(),
      ownerId: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(),
      leadId: new mongoose.Types.ObjectId(),
      isVerifiedPurchase: true,
      rating: 5,
      title: "Excellent PG near Vijay Nagar",
      comment: "Super clean rooms with high speed optical fiber WiFi and 24x7 power backup.",
      pros: ["High Speed WiFi", "Clean Rooms", "Power Backup"],
      cons: ["Parking limited"],
      wouldRecommend: true,
      isAnonymous: false,
      images: ["https://example.com/room1.jpg"],
      status: "APPROVED",
      sentiment: "POSITIVE",
    });

    const err = await review.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("ReviewReplyModel should validate official owner response", async () => {
    const reply = new ReviewReplyModel({
      reviewId: new mongoose.Types.ObjectId(),
      ownerId: new mongoose.Types.ObjectId(),
      comment: "Thank you for the review! We are expanding our parking lot next week.",
    });

    const err = await reply.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("ReviewReactionModel should validate student reaction", async () => {
    const reaction = new ReviewReactionModel({
      reviewId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      type: "HELPFUL",
    });

    const err = await reaction.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("ReviewReportModel should validate abuse report", async () => {
    const report = new ReviewReportModel({
      reviewId: new mongoose.Types.ObjectId(),
      reporterId: new mongoose.Types.ObjectId(),
      reason: "FAKE_REVIEW",
      details: "This reviewer never visited our study library.",
      status: "PENDING",
    });

    const err = await report.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("OwnerScoreModel should validate owner performance score (0-100)", async () => {
    const score = new OwnerScoreModel({
      ownerId: new mongoose.Types.ObjectId(),
      score: 92,
      profileCompletionScore: 100,
      verifiedStatusScore: 100,
      responseTimeScore: 85,
      reviewRatingScore: 90,
      leadConversionScore: 95,
      listingQualityScore: 90,
      spamPenaltyScore: 0,
      totalReviewsCount: 18,
      averageRating: 4.8,
      leadAcceptanceRate: 95,
      avgResponseTimeMinutes: 15,
      yearsOnPlatform: 2,
    });

    const err = await score.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("BadgeModel should validate trust badge configuration", async () => {
    const badge = new BadgeModel({
      code: "TOP_RATED",
      name: "Top Rated Owner",
      description: "Maintains an average student rating of 4.5+ with 5+ reviews.",
      icon: "star",
      isActive: true,
    });

    const err = await badge.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("ReputationService should instantiate cleanly", () => {
    const service = new ReputationService();
    assert.ok(service);
    assert.equal(typeof service.createReview, "function");
    assert.equal(typeof service.calculateOwnerScore, "function");
  });
});
