import mongoose from "mongoose";
import { ReviewModel, type IReview } from "../models/review.model.js";
import { ReviewReplyModel } from "../models/review-reply.model.js";
import { ReviewReactionModel } from "../models/review-reaction.model.js";
import { ReviewReportModel } from "../models/review-report.model.js";
import { OwnerScoreModel } from "../models/owner-score.model.js";
import { BadgeModel } from "../models/badge.model.js";
import { VerificationModel } from "../models/verification.model.js";
import { LeadModel } from "../models/lead.model.js";
import { PropertyModel } from "../models/property.model.js";
import { LibraryModel } from "../models/library.model.js";
import { UserModel } from "../models/user.model.js";
import { ForbiddenError, NotFoundError, ConflictError } from "../errors/app-error.js";
import type {
  ReviewDTO,
  OwnerPublicProfileDTO,
  OwnerScoreDTO,
  ReviewAnalyticsDTO,
  AdminReviewAnalyticsDTO,
  BadgeDTO,
} from "@studenthub/types";

export class ReputationService {
  /**
   * Ensure standard Trust Badges exist in database
   */
  async ensureDefaultBadges(): Promise<void> {
    const badges = [
      {
        code: "VERIFIED_OWNER",
        name: "Verified Owner",
        description: "Owner identity & business registration audited by StudentHub.",
        icon: "shield-check",
      },
      {
        code: "TOP_RATED",
        name: "Top Rated",
        description: "Maintains an average student rating of 4.5+ with 5+ reviews.",
        icon: "star",
      },
      {
        code: "FAST_RESPONSE",
        name: "Fast Response",
        description: "Responds to student inquiries in under 30 minutes.",
        icon: "zap",
      },
      {
        code: "STUDENT_CHOICE",
        name: "Student Choice",
        description: "High recommendation rate (90%+) from indore aspirants.",
        icon: "heart",
      },
      {
        code: "MOST_VISITED",
        name: "Most Visited",
        description: "High student visit request rate and direct bookings.",
        icon: "trending-up",
      },
      {
        code: "PREMIUM_OWNER",
        name: "Premium Partner",
        description: "Verified enterprise accommodation or library partner.",
        icon: "crown",
      },
    ];

    for (const b of badges) {
      await BadgeModel.findOneAndUpdate({ code: b.code }, { $set: b }, { upsert: true, new: true });
    }
  }

  /**
   * Submit a student review (with fake review prevention via lead verification check)
   */
  async createReview(
    studentId: string,
    data: {
      targetType: "ACCOMMODATION" | "LIBRARY" | string;
      targetId: string;
      rating: number;
      title: string;
      comment: string;
      pros?: string[];
      cons?: string[];
      wouldRecommend?: boolean;
      isAnonymous?: boolean;
      images?: string[];
      videoUrl?: string;
    },
  ): Promise<ReviewDTO> {
    // 1. Verify Target Listing exists and get Owner ID
    let ownerId: mongoose.Types.ObjectId | null = null;

    if (data.targetType === "ACCOMMODATION") {
      const prop = await PropertyModel.findById(data.targetId);
      if (!prop) throw new NotFoundError("Accommodation listing not found", "LISTING_NOT_FOUND");
      ownerId = prop.ownerId;
    } else {
      const lib = await LibraryModel.findById(data.targetId);
      if (!lib) throw new NotFoundError("Library listing not found", "LISTING_NOT_FOUND");
      ownerId = lib.ownerId;
    }

    // 2. Fake Review Prevention: Check if student created a Lead for this target listing
    const existingLead = await LeadModel.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      targetType: data.targetType,
      targetId: new mongoose.Types.ObjectId(data.targetId),
    });

    if (!existingLead) {
      throw new ForbiddenError(
        "You can only review listings you have inquired about or visited.",
        "REVIEW_VERIFICATION_REQUIRED",
      );
    }

    // 3. Prevent Duplicate Review by same student for same listing
    const existingReview = await ReviewModel.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      targetId: new mongoose.Types.ObjectId(data.targetId),
    });

    if (existingReview) {
      throw new ConflictError(
        "You have already submitted a review for this listing.",
        "DUPLICATE_REVIEW",
      );
    }

    // 4. Infer Sentiment
    let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "POSITIVE";
    if (data.rating === 3) sentiment = "NEUTRAL";
    if (data.rating <= 2) sentiment = "NEGATIVE";

    // 5. Create Review Document
    const review = await ReviewModel.create({
      targetType: data.targetType,
      targetId: new mongoose.Types.ObjectId(data.targetId),
      ownerId,
      studentId: new mongoose.Types.ObjectId(studentId),
      leadId: existingLead._id,
      isVerifiedPurchase: true,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      pros: data.pros || [],
      cons: data.cons || [],
      wouldRecommend: data.wouldRecommend ?? true,
      isAnonymous: data.isAnonymous ?? false,
      images: data.images || [],
      videoUrl: data.videoUrl,
      status: "APPROVED",
      sentiment,
    });

    // 6. Recalculate Target Listing Rating
    await this.updateListingRating(data.targetType, data.targetId);

    // 7. Recalculate Owner Performance Score
    if (ownerId) {
      await this.calculateOwnerScore(ownerId.toString());
    }

    return this.mapToReviewDTO(review, studentId);
  }

  /**
   * Recalculate listing average rating and review counts
   */
  private async updateListingRating(targetType: string, targetId: string): Promise<void> {
    const stats = await ReviewModel.aggregate([
      {
        $match: {
          targetType,
          targetId: new mongoose.Types.ObjectId(targetId),
          status: "APPROVED",
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const reviewsCount = stats.length > 0 ? stats[0].count : 0;

    if (targetType === "ACCOMMODATION") {
      await PropertyModel.findByIdAndUpdate(targetId, {
        $set: { avgRating, reviewsCount },
      });
    } else {
      await LibraryModel.findByIdAndUpdate(targetId, {
        $set: { avgRating, reviewsCount },
      });
    }
  }

  /**
   * Get Reviews for a Listing or Owner
   */
  async getReviews(
    params: {
      targetType?: string;
      targetId?: string;
      ownerId?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    currentUserId?: string,
  ): Promise<{ items: ReviewDTO[]; total: number; page: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      status: params.status || "APPROVED",
    };

    if (params.targetType) query.targetType = params.targetType;
    if (params.targetId) query.targetId = new mongoose.Types.ObjectId(params.targetId);
    if (params.ownerId) query.ownerId = new mongoose.Types.ObjectId(params.ownerId);

    const total = await ReviewModel.countDocuments(query);
    const reviews = await ReviewModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("studentId", "firstName lastName avatar")
      .exec();

    const dtos = await Promise.all(reviews.map((r) => this.mapToReviewDTO(r, currentUserId)));

    return {
      items: dtos,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Owner Reply to Review
   */
  async replyReview(ownerId: string, reviewId: string, comment: string): Promise<ReviewDTO> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) throw new NotFoundError("Review not found", "REVIEW_NOT_FOUND");

    if (review.ownerId.toString() !== ownerId) {
      throw new ForbiddenError(
        "You can only reply to reviews on your own listings",
        "UNAUTHORIZED_REPLY",
      );
    }

    await ReviewReplyModel.findOneAndUpdate(
      { reviewId: review._id },
      {
        $set: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          comment,
        },
      },
      { upsert: true, new: true },
    );

    return this.mapToReviewDTO(review, ownerId);
  }

  /**
   * React to Review (Helpful / Like)
   */
  async reactReview(
    userId: string,
    reviewId: string,
    type: "HELPFUL" | "LIKE",
  ): Promise<ReviewDTO> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) throw new NotFoundError("Review not found", "REVIEW_NOT_FOUND");

    const existing = await ReviewReactionModel.findOne({
      reviewId: review._id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (existing) {
      if (existing.type === type) {
        // Toggle off
        await ReviewReactionModel.deleteOne({ _id: existing._id });
        if (type === "HELPFUL" && review.helpfulCount > 0) {
          review.helpfulCount -= 1;
        }
      } else {
        // Switch type
        existing.type = type;
        await existing.save();
      }
    } else {
      await ReviewReactionModel.create({
        reviewId: review._id,
        userId: new mongoose.Types.ObjectId(userId),
        type,
      });
      if (type === "HELPFUL") {
        review.helpfulCount += 1;
      }
    }

    await review.save();
    return this.mapToReviewDTO(review, userId);
  }

  /**
   * Report Abuse / Fake Review
   */
  async reportReview(
    reporterId: string,
    reviewId: string,
    reason: "FAKE_REVIEW" | "SPAM" | "ABUSIVE_LANGUAGE" | "IRRELEVANT" | "OTHER",
    details?: string,
  ): Promise<{ success: boolean; message: string }> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) throw new NotFoundError("Review not found", "REVIEW_NOT_FOUND");

    await ReviewReportModel.create({
      reviewId: review._id,
      reporterId: new mongoose.Types.ObjectId(reporterId),
      reason,
      details,
    });

    review.reportCount += 1;
    if (review.reportCount >= 3) {
      review.status = "FLAGGED";
    }
    await review.save();

    return { success: true, message: "Review report submitted for admin audit." };
  }

  /**
   * Calculate & Cache Owner Performance Score (0-100)
   */
  async calculateOwnerScore(ownerId: string): Promise<OwnerScoreDTO> {
    const ownerObjId = new mongoose.Types.ObjectId(ownerId);
    const owner = await UserModel.findById(ownerId);
    if (!owner) throw new NotFoundError("Owner not found", "OWNER_NOT_FOUND");

    // 1. Profile Completion (15 pts max)
    let profileScore = 40;
    if (owner.avatar) profileScore += 20;
    if (owner.phone) profileScore += 20;
    if (owner.isVerified) profileScore += 20;

    // 2. Verification Status (15 pts max)
    const verification = await VerificationModel.findOne({
      ownerId: ownerObjId,
      status: "VERIFIED",
    });
    const verifiedStatusScore = verification ? 100 : owner.isVerified ? 80 : 0;

    // 3. Reviews Metrics (25 pts max)
    const reviewStats = await ReviewModel.aggregate([
      { $match: { ownerId: ownerObjId, status: "APPROVED" } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 },
        },
      },
    ]);

    const avgRating = reviewStats.length > 0 ? Math.round(reviewStats[0].avgRating * 10) / 10 : 4.0;
    const totalReviewsCount = reviewStats.length > 0 ? reviewStats[0].total : 0;
    const reviewRatingScore = Math.round((avgRating / 5) * 100);

    // 4. Lead Responsiveness & Acceptance (20 pts max)
    const totalLeads = await LeadModel.countDocuments({ ownerId: ownerObjId });
    const acceptedLeads = await LeadModel.countDocuments({
      ownerId: ownerObjId,
      status: { $in: ["ACCEPTED", "VISITED", "CONVERTED"] },
    });

    const leadAcceptanceRate = totalLeads > 0 ? Math.round((acceptedLeads / totalLeads) * 100) : 90;
    const leadConversionScore = leadAcceptanceRate;

    // 5. Spam Penalty Score
    const flaggedReviewsCount = await ReviewModel.countDocuments({
      ownerId: ownerObjId,
      status: "FLAGGED",
    });
    const spamPenaltyScore = Math.min(100, flaggedReviewsCount * 25);

    // 6. Overall Weighted Performance Score (0-100)
    const weightedScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          profileScore * 0.15 +
            verifiedStatusScore * 0.15 +
            80 * 0.15 + // Response Time
            reviewRatingScore * 0.25 +
            leadConversionScore * 0.2 +
            85 * 0.1 - // Listing Quality
            spamPenaltyScore * 0.1,
        ),
      ),
    );

    const scoreDoc = await OwnerScoreModel.findOneAndUpdate(
      { ownerId: ownerObjId },
      {
        $set: {
          score: weightedScore,
          profileCompletionScore: Math.min(100, profileScore),
          verifiedStatusScore,
          responseTimeScore: 80,
          reviewRatingScore,
          leadConversionScore,
          listingQualityScore: 85,
          spamPenaltyScore,
          totalReviewsCount,
          averageRating: avgRating,
          leadAcceptanceRate,
          avgResponseTimeMinutes: 25,
          yearsOnPlatform: 1,
        },
      },
      { upsert: true, new: true },
    );

    return {
      id: scoreDoc._id.toString(),
      ownerId: scoreDoc.ownerId.toString(),
      score: scoreDoc.score,
      profileCompletionScore: scoreDoc.profileCompletionScore,
      verifiedStatusScore: scoreDoc.verifiedStatusScore,
      responseTimeScore: scoreDoc.responseTimeScore,
      reviewRatingScore: scoreDoc.reviewRatingScore,
      leadConversionScore: scoreDoc.leadConversionScore,
      listingQualityScore: scoreDoc.listingQualityScore,
      spamPenaltyScore: scoreDoc.spamPenaltyScore,
      totalReviewsCount: scoreDoc.totalReviewsCount,
      averageRating: scoreDoc.averageRating,
      leadAcceptanceRate: scoreDoc.leadAcceptanceRate,
      avgResponseTimeMinutes: scoreDoc.avgResponseTimeMinutes,
      yearsOnPlatform: scoreDoc.yearsOnPlatform,
      updatedAt: scoreDoc.updatedAt.toISOString(),
    };
  }

  /**
   * Get Public Owner Profile with Badges & Score
   */
  async getOwnerPublicProfile(ownerId: string): Promise<OwnerPublicProfileDTO> {
    const owner = await UserModel.findById(ownerId);
    if (!owner) throw new NotFoundError("Owner not found", "OWNER_NOT_FOUND");

    const scoreDTO = await this.calculateOwnerScore(ownerId);
    const verification = await VerificationModel.findOne({
      ownerId: new mongoose.Types.ObjectId(ownerId),
    });

    // Fetch Active Badges
    const allBadges = await BadgeModel.find({ isActive: true });
    const badges: BadgeDTO[] = allBadges.map((b) => ({
      id: b._id.toString(),
      code: b.code,
      name: b.name,
      description: b.description,
      icon: b.icon,
      isActive: b.isActive,
    }));

    // Fetch Owner Listings
    const props = await PropertyModel.find({ ownerId: new mongoose.Types.ObjectId(ownerId) }).limit(
      10,
    );
    const libs = await LibraryModel.find({ ownerId: new mongoose.Types.ObjectId(ownerId) }).limit(
      10,
    );

    const listings = [
      ...props.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        targetType: "ACCOMMODATION",
        city: p.location?.city || "Indore",
        area: p.area,
        price: 0,
        images: p.images || [],
        averageRating: p.avgRating || 0,
        reviewsCount: p.reviewsCount || 0,
        status: p.status,
      })),
      ...libs.map((l) => ({
        id: l._id.toString(),
        title: l.name,
        targetType: "LIBRARY",
        city: l.location?.city || "Indore",
        area: l.area,
        price: l.pricing?.monthlyFee || 0,
        images: l.images || [],
        averageRating: l.avgRating || 0,
        reviewsCount: l.reviewsCount || 0,
        status: l.status,
      })),
    ];

    return {
      ownerId: owner._id.toString(),
      name: `${owner.firstName} ${owner.lastName}`,
      email: owner.email,
      phone: owner.phone,
      avatar: owner.avatar,
      ownerType: owner.ownerType || undefined,
      verificationStatus: verification
        ? (verification.status as "UNVERIFIED" | "PENDING_VERIFICATION" | "VERIFIED")
        : owner.isVerified
          ? "VERIFIED"
          : "UNVERIFIED",
      isVerified: owner.isVerified || verification?.status === "VERIFIED",
      performanceScore: scoreDTO.score,
      scoreBreakdown: scoreDTO,
      totalListings: listings.length,
      averageRating: scoreDTO.averageRating,
      totalReviewsCount: scoreDTO.totalReviewsCount,
      leadAcceptanceRate: scoreDTO.leadAcceptanceRate,
      avgResponseTimeMinutes: scoreDTO.avgResponseTimeMinutes,
      yearsOnPlatform: scoreDTO.yearsOnPlatform,
      badges,
      listings,
    };
  }

  /**
   * Get Owner Review Analytics (Sentiment & Pros/Cons)
   */
  async getOwnerReviewAnalytics(ownerId: string): Promise<ReviewAnalyticsDTO> {
    const ownerObjId = new mongoose.Types.ObjectId(ownerId);
    const reviews = await ReviewModel.find({ ownerId: ownerObjId, status: "APPROVED" });

    const totalReviews = reviews.length;
    let sumRating = 0;
    let recommendCount = 0;
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    const prosMap: Record<string, number> = {};
    const consMap: Record<string, number> = {};

    for (const r of reviews) {
      sumRating += r.rating;
      if (r.wouldRecommend) recommendCount++;
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;

      if (r.sentiment === "POSITIVE") sentiment.positive++;
      else if (r.sentiment === "NEUTRAL") sentiment.neutral++;
      else sentiment.negative++;

      (r.pros || []).forEach((p) => {
        prosMap[p] = (prosMap[p] || 0) + 1;
      });
      (r.cons || []).forEach((c) => {
        consMap[c] = (consMap[c] || 0) + 1;
      });
    }

    const averageRating = totalReviews > 0 ? Math.round((sumRating / totalReviews) * 10) / 10 : 0;
    const recommendationPercentage =
      totalReviews > 0 ? Math.round((recommendCount / totalReviews) * 100) : 0;

    const mostMentionedPros = Object.entries(prosMap)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const mostMentionedCons = Object.entries(consMap)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      averageRating,
      totalReviews,
      recommendationPercentage,
      ratingDistribution,
      sentiment,
      mostMentionedPros,
      mostMentionedCons,
    };
  }

  /**
   * Admin Review Queue & Reports
   */
  async getAdminReviewQueue(status?: string): Promise<{
    reviews: ReviewDTO[];
    reports: Record<string, unknown>[];
    analytics: AdminReviewAnalyticsDTO;
  }> {
    const reviewsQuery = status ? { status } : {};
    const reviews = await ReviewModel.find(reviewsQuery).sort({ createdAt: -1 }).limit(50);
    const reports = (await ReviewReportModel.find({ status: "PENDING" })
      .populate("reviewId")
      .limit(50)
      .lean()) as unknown as Record<string, unknown>[];

    const totalReviews = await ReviewModel.countDocuments();
    const pendingReportsCount = await ReviewReportModel.countDocuments({ status: "PENDING" });
    const hiddenReviewsCount = await ReviewModel.countDocuments({ status: "HIDDEN" });

    const reviewDTOs = await Promise.all(reviews.map((r) => this.mapToReviewDTO(r)));

    return {
      reviews: reviewDTOs,
      reports,
      analytics: {
        totalReviews,
        pendingReportsCount,
        hiddenReviewsCount,
        mostReviewedListings: [],
        lowRatedOwners: [],
      },
    };
  }

  /**
   * Admin Update Review Status (Approve / Hide / Delete)
   */
  async updateReviewStatus(
    reviewId: string,
    status: "APPROVED" | "PENDING" | "HIDDEN" | "FLAGGED",
  ): Promise<ReviewDTO> {
    const review = await ReviewModel.findByIdAndUpdate(
      reviewId,
      { $set: { status } },
      { new: true },
    );
    if (!review) throw new NotFoundError("Review not found", "REVIEW_NOT_FOUND");

    await this.updateListingRating(review.targetType, review.targetId.toString());
    await this.calculateOwnerScore(review.ownerId.toString());

    return this.mapToReviewDTO(review);
  }

  private async mapToReviewDTO(review: IReview, currentUserId?: string): Promise<ReviewDTO> {
    let replyDTO: ReviewDTO["reply"] = undefined;
    const reply = await ReviewReplyModel.findOne({ reviewId: review._id });
    if (reply) {
      const owner = await UserModel.findById(reply.ownerId);
      replyDTO = {
        id: reply._id.toString(),
        reviewId: reply.reviewId.toString(),
        ownerId: reply.ownerId.toString(),
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : "Business Owner",
        ownerAvatar: owner?.avatar,
        comment: reply.comment,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
      };
    }

    let userReaction: "HELPFUL" | "LIKE" | undefined = undefined;
    if (currentUserId) {
      const reaction = await ReviewReactionModel.findOne({
        reviewId: review._id,
        userId: new mongoose.Types.ObjectId(currentUserId),
      });
      if (reaction) {
        userReaction = reaction.type;
      }
    }

    const student = await UserModel.findById(review.studentId);
    const studentName = review.isAnonymous
      ? "Anonymous Student"
      : student
        ? `${student.firstName} ${student.lastName}`
        : "Student Aspirant";

    return {
      id: review._id.toString(),
      targetType: review.targetType,
      targetId: review.targetId.toString(),
      ownerId: review.ownerId.toString(),
      studentId: review.studentId.toString(),
      studentName,
      studentAvatar: review.isAnonymous ? undefined : student?.avatar,
      leadId: review.leadId ? review.leadId.toString() : undefined,
      isVerifiedPurchase: review.isVerifiedPurchase,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      pros: review.pros,
      cons: review.cons,
      wouldRecommend: review.wouldRecommend,
      isAnonymous: review.isAnonymous,
      images: review.images,
      videoUrl: review.videoUrl,
      status: review.status as ReviewDTO["status"],
      helpfulCount: review.helpfulCount,
      reportCount: review.reportCount,
      userReaction,
      reply: replyDTO,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}
