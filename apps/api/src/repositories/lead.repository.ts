import mongoose from "mongoose";
import { LeadModel, type ILead } from "../models/lead.model.js";
import { LeadTimelineModel, type ILeadTimeline } from "../models/lead-timeline.model.js";
import { FollowUpModel, type IFollowUp } from "../models/followup.model.js";

export interface LeadFilters {
  status?: string;
  targetType?: string;
  targetId?: string;
  ownerId?: string;
  studentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class LeadRepository {
  async create(data: Partial<ILead>): Promise<ILead> {
    const lead = new LeadModel(data);
    return await lead.save();
  }

  async findById(id: string): Promise<ILead | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await LeadModel.findById(id).populate("studentId ownerId").exec();
  }

  async findActiveStudentLeadForTarget(
    studentId: string,
    targetType: string,
    targetId: string,
  ): Promise<ILead | null> {
    return await LeadModel.findOne({
      studentId,
      targetType,
      targetId,
      status: { $in: ["NEW", "PENDING", "ACCEPTED", "RESCHEDULED"] },
    }).exec();
  }

  async findByStudent(studentId: string): Promise<ILead[]> {
    return await LeadModel.find({ studentId }).populate("ownerId").sort({ createdAt: -1 }).exec();
  }

  async findByOwner(
    ownerId: string,
    filters?: LeadFilters,
  ): Promise<{ leads: ILead[]; total: number }> {
    const query: Record<string, unknown> = { ownerId };

    if (filters?.status) {
      query["status"] = filters.status;
    }
    if (filters?.targetType) {
      query["targetType"] = filters.targetType;
    }

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 20));
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      LeadModel.find(query)
        .populate("studentId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      LeadModel.countDocuments(query),
    ]);

    return { leads, total };
  }

  async findAll(filters?: LeadFilters): Promise<{ leads: ILead[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filters?.status) {
      query["status"] = filters.status;
    }
    if (filters?.targetType) {
      query["targetType"] = filters.targetType;
    }
    if (filters?.ownerId) {
      query["ownerId"] = filters.ownerId;
    }

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 20));
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      LeadModel.find(query)
        .populate("studentId ownerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      LeadModel.countDocuments(query),
    ]);

    return { leads, total };
  }

  async updateStatus(
    id: string,
    status: string,
    extraFields?: { preferredDate?: Date; preferredTime?: string },
  ): Promise<ILead | null> {
    const updateData: Record<string, unknown> = { status };
    if (extraFields?.preferredDate) updateData["preferredDate"] = extraFields.preferredDate;
    if (extraFields?.preferredTime) updateData["preferredTime"] = extraFields.preferredTime;

    return await LeadModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate("studentId ownerId")
      .exec();
  }

  // Timeline Operations
  async createTimelineEntry(data: {
    leadId: string;
    action: string;
    actorId?: string;
    actorRole?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ILeadTimeline> {
    const entry = new LeadTimelineModel({
      leadId: new mongoose.Types.ObjectId(data.leadId),
      action: data.action,
      actorId: data.actorId ? new mongoose.Types.ObjectId(data.actorId) : undefined,
      actorRole: data.actorRole,
      notes: data.notes,
      metadata: data.metadata,
    });
    return await entry.save();
  }

  async getTimeline(leadId: string): Promise<ILeadTimeline[]> {
    return await LeadTimelineModel.find({ leadId }).sort({ createdAt: 1 }).exec();
  }

  // Follow-up Operations
  async createFollowUp(data: {
    leadId: string;
    ownerId: string;
    note: string;
    scheduledFollowUpDate?: Date;
    contactChannel?: "CALL" | "WHATSAPP" | "EMAIL" | "IN_PERSON";
  }): Promise<IFollowUp> {
    const channelToType: Record<string, "CALL" | "WHATSAPP" | "EMAIL" | "VISIT" | "SMS"> = {
      CALL: "CALL",
      WHATSAPP: "WHATSAPP",
      EMAIL: "EMAIL",
      IN_PERSON: "VISIT",
    };
    const type = channelToType[data.contactChannel || "CALL"] || "CALL";
    const scheduledAt = data.scheduledFollowUpDate ?? new Date();
    const status = data.scheduledFollowUpDate ? "PENDING" : "COMPLETED";

    const followUp = new FollowUpModel({
      leadId: new mongoose.Types.ObjectId(data.leadId),
      ownerId: new mongoose.Types.ObjectId(data.ownerId),
      notes: data.note,
      scheduledAt,
      type,
      status,
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
    });
    return await followUp.save();
  }

  async getFollowUps(leadId: string): Promise<IFollowUp[]> {
    return await FollowUpModel.find({ leadId }).sort({ createdAt: -1 }).exec();
  }

  // Analytics Aggregation Queries
  async getOwnerAnalytics(ownerId: string) {
    const ownerObjId = new mongoose.Types.ObjectId(ownerId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [statusCounts, todayCount] = await Promise.all([
      LeadModel.aggregate([
        { $match: { ownerId: ownerObjId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      LeadModel.countDocuments({ ownerId: ownerObjId, createdAt: { $gte: startOfToday } }),
    ]);

    const counts: Record<string, number> = {
      NEW: 0,
      PENDING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      RESCHEDULED: 0,
      VISITED: 0,
      CONVERTED: 0,
      CANCELLED: 0,
    };

    let total = 0;
    for (const item of statusCounts) {
      counts[item._id] = item.count;
      total += item.count;
    }

    const converted = counts["CONVERTED"] || 0;
    const conversionRate = total > 0 ? Number(((converted / total) * 100).toFixed(1)) : 0;

    return {
      totalLeads: total,
      todayLeads: todayCount,
      pendingLeads: (counts["NEW"] || 0) + (counts["PENDING"] || 0),
      acceptedLeads: counts["ACCEPTED"] || 0,
      rejectedLeads: counts["REJECTED"] || 0,
      visitedLeads: counts["VISITED"] || 0,
      convertedLeads: converted,
      cancelledLeads: counts["CANCELLED"] || 0,
      conversionRate,
    };
  }

  async getAdminAnalytics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);

    const [
      totalLeads,
      todayLeads,
      weeklyLeads,
      monthlyLeads,
      statusCounts,
      sourceCounts,
      topListingsAgg,
      topOwnersAgg,
    ] = await Promise.all([
      LeadModel.countDocuments(),
      LeadModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      LeadModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
      LeadModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      LeadModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      LeadModel.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }]),
      LeadModel.aggregate([
        { $group: { _id: "$targetId", targetType: { $first: "$targetType" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      LeadModel.aggregate([
        { $group: { _id: "$ownerId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "owner" } },
        { $unwind: "$owner" },
      ]),
    ]);

    const leadsByStatus: Record<string, number> = {};
    for (const s of statusCounts) {
      leadsByStatus[s._id] = s.count;
    }

    const leadsBySource: Record<string, number> = {};
    for (const s of sourceCounts) {
      leadsBySource[s._id] = s.count;
    }

    const converted = leadsByStatus["CONVERTED"] || 0;
    const conversionRate = totalLeads > 0 ? Number(((converted / totalLeads) * 100).toFixed(1)) : 0;

    const topListings = topListingsAgg.map((item) => ({
      id: String(item._id),
      title: `${item.targetType} Listing (${String(item._id).slice(-4)})`,
      targetType: item.targetType,
      count: item.count,
    }));

    const topOwners = topOwnersAgg.map((item) => ({
      id: String(item._id),
      name: `${item.owner.firstName} ${item.owner.lastName}`.trim(),
      email: item.owner.email,
      count: item.count,
    }));

    return {
      totalLeads,
      todayLeads,
      weeklyLeads,
      monthlyLeads,
      conversionRate,
      topListings,
      topOwners,
      leadsBySource,
      leadsByStatus,
    };
  }
}
