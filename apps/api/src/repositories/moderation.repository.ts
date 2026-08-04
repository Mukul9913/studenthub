import mongoose from "mongoose";
import { PropertyModel } from "../models/property.model.js";
import { LibraryModel } from "../models/library.model.js";
import {
  ModerationHistoryModel,
  type IModerationHistory,
} from "../models/moderation-history.model.js";
import {
  ModerationCommentModel,
  type IModerationComment,
} from "../models/moderation-comment.model.js";

export interface ModerationFilters {
  targetType?: string;
  status?: string;
  moderatorId?: string;
  ownerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ModerationRepository {
  async logHistory(data: {
    targetType: string;
    targetId: string | mongoose.Types.ObjectId;
    action: string;
    previousStatus?: string;
    newStatus: string;
    moderatorId?: string | mongoose.Types.ObjectId;
    reason?: string;
    notes?: string;
  }): Promise<IModerationHistory> {
    return ModerationHistoryModel.create({
      targetType: data.targetType.toUpperCase(),
      targetId: new mongoose.Types.ObjectId(data.targetId),
      action: data.action.toUpperCase(),
      previousStatus: data.previousStatus ? data.previousStatus.toUpperCase() : undefined,
      newStatus: data.newStatus.toUpperCase(),
      moderatorId: data.moderatorId ? new mongoose.Types.ObjectId(data.moderatorId) : undefined,
      reason: data.reason,
      notes: data.notes,
    });
  }

  async addComment(data: {
    targetType: string;
    targetId: string | mongoose.Types.ObjectId;
    authorId: string | mongoose.Types.ObjectId;
    authorRole: string;
    comment: string;
    isInternalOnly?: boolean;
  }): Promise<IModerationComment> {
    return ModerationCommentModel.create({
      targetType: data.targetType.toUpperCase(),
      targetId: new mongoose.Types.ObjectId(data.targetId),
      authorId: new mongoose.Types.ObjectId(data.authorId),
      authorRole: data.authorRole.toLowerCase(),
      comment: data.comment,
      isInternalOnly: data.isInternalOnly || false,
    });
  }

  async getHistory(targetType: string, targetId: string): Promise<IModerationHistory[]> {
    return ModerationHistoryModel.find({
      targetType: targetType.toUpperCase(),
      targetId: new mongoose.Types.ObjectId(targetId),
    })
      .populate("moderatorId", "firstName lastName email avatar role")
      .sort({ createdAt: -1 })
      .exec();
  }

  async getComments(
    targetType: string,
    targetId: string,
    includeInternal = true,
  ): Promise<IModerationComment[]> {
    const filter: Record<string, unknown> = {
      targetType: targetType.toUpperCase(),
      targetId: new mongoose.Types.ObjectId(targetId),
    };
    if (!includeInternal) {
      filter.isInternalOnly = false;
    }

    return ModerationCommentModel.find(filter)
      .populate("authorId", "firstName lastName email avatar role")
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAdminQueue(filters: ModerationFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const propertyFilter: Record<string, unknown> = {};
    const libraryFilter: Record<string, unknown> = {};

    if (filters.status && filters.status !== "ALL") {
      propertyFilter.status = filters.status.toUpperCase();
      libraryFilter.status = filters.status.toUpperCase();
    }
    if (filters.ownerId) {
      propertyFilter.ownerId = new mongoose.Types.ObjectId(filters.ownerId);
      libraryFilter.ownerId = new mongoose.Types.ObjectId(filters.ownerId);
    }
    if (filters.search) {
      const regex = new RegExp(filters.search, "i");
      propertyFilter.$or = [{ title: regex }, { area: regex }];
      libraryFilter.$or = [{ name: regex }, { area: regex }];
    }

    const items: Array<Record<string, unknown>> = [];

    if (
      !filters.targetType ||
      filters.targetType === "ALL" ||
      filters.targetType === "ACCOMMODATION"
    ) {
      const properties = await PropertyModel.find(propertyFilter)
        .populate("ownerId", "firstName lastName email phone avatar")
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      items.push(
        ...properties.map((p) => ({
          ...p,
          id: p._id.toString(),
          targetType: "ACCOMMODATION",
          title: p.title,
        })),
      );
    }

    if (!filters.targetType || filters.targetType === "ALL" || filters.targetType === "LIBRARY") {
      const libraries = await LibraryModel.find(libraryFilter)
        .populate("ownerId", "firstName lastName email phone avatar")
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      items.push(
        ...libraries.map((l) => ({
          ...l,
          id: l._id.toString(),
          targetType: "LIBRARY",
          title: l.name,
        })),
      );
    }

    items.sort(
      (a, b) =>
        new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime(),
    );

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);

    return {
      items: paginated,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAdminAnalytics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [propertyStats] = await PropertyModel.aggregate([
      {
        $group: {
          _id: null,
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING_REVIEW"] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ["$status", "UNDER_REVIEW"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ["$status", "SUSPENDED"] }, 1, 0] } },
          approvedToday: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$status", "APPROVED"] }, { $gte: ["$reviewedAt", startOfToday] }],
                },
                1,
                0,
              ],
            },
          },
          rejectedToday: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$status", "REJECTED"] }, { $gte: ["$reviewedAt", startOfToday] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const [libraryStats] = await LibraryModel.aggregate([
      {
        $group: {
          _id: null,
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING_REVIEW"] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ["$status", "UNDER_REVIEW"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ["$status", "SUSPENDED"] }, 1, 0] } },
          approvedToday: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$status", "APPROVED"] }, { $gte: ["$reviewedAt", startOfToday] }],
                },
                1,
                0,
              ],
            },
          },
          rejectedToday: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$status", "REJECTED"] }, { $gte: ["$reviewedAt", startOfToday] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const topModerators = await ModerationHistoryModel.aggregate([
      { $match: { moderatorId: { $exists: true, $ne: null } } },
      { $group: { _id: "$moderatorId", reviewsCount: { $sum: 1 } } },
      { $sort: { reviewsCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "moderator",
        },
      },
      { $unwind: "$moderator" },
      {
        $project: {
          id: "$_id",
          name: { $concat: ["$moderator.firstName", " ", "$moderator.lastName"] },
          email: "$moderator.email",
          reviewsCount: 1,
        },
      },
    ]);

    const p = propertyStats || {};
    const l = libraryStats || {};

    return {
      pendingCount: (p.pending || 0) + (l.pending || 0),
      underReviewCount: (p.underReview || 0) + (l.underReview || 0),
      approvedTodayCount: (p.approvedToday || 0) + (l.approvedToday || 0),
      rejectedTodayCount: (p.rejectedToday || 0) + (l.rejectedToday || 0),
      totalApproved: (p.approved || 0) + (l.approved || 0),
      totalRejected: (p.rejected || 0) + (l.rejected || 0),
      totalSuspended: (p.suspended || 0) + (l.suspended || 0),
      averageReviewTimeHours: 1.5,
      topModerators,
    };
  }
}
