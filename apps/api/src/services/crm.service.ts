import mongoose from "mongoose";
import { LeadModel } from "../models/lead.model.js";
import { LeadPipelineModel } from "../models/lead-pipeline.model.js";
import { FollowUpModel } from "../models/followup.model.js";
import { CRMTaskModel } from "../models/crm-task.model.js";
import { ActivityLogModel } from "../models/activity-log.model.js";
import { UserModel } from "../models/user.model.js";
import { LibraryModel } from "../models/library.model.js";
import { PropertyModel } from "../models/property.model.js";
import { StudentPreferenceModel } from "../models/student-preference.model.js";
import type { PipelineStageConstant } from "@studenthub/constants";
import type {
  LeadPipelineDTO,
  FollowUpDTO,
  CRMTaskDTO,
  ActivityLogDTO,
  CRMAnalyticsDTO,
  AdminCRMAnalyticsDTO,
} from "@studenthub/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function logActivity(
  ownerId: mongoose.Types.ObjectId,
  leadId: mongoose.Types.ObjectId,
  type: string,
  description: string,
  createdBy: mongoose.Types.ObjectId,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await ActivityLogModel.create({
    ownerId,
    leadId,
    type,
    description,
    createdBy,
    metadata,
  });
}

async function enrichLead(leadId: mongoose.Types.ObjectId) {
  const lead = await LeadModel.findById(leadId).lean();
  if (!lead) return null;

  const student = await UserModel.findById(lead.studentId, "firstName lastName phone").lean();

  // Get the listing title
  let targetTitle = "";
  try {
    if (lead.targetType === "LIBRARY") {
      const lib = await LibraryModel.findById(lead.targetId, "name").lean();
      targetTitle = (lib as unknown as { name?: string })?.name ?? "";
    } else {
      const prop = await PropertyModel.findById(lead.targetId, "title name").lean();
      const p = prop as unknown as { title?: string; name?: string };
      targetTitle = p?.title ?? p?.name ?? "";
    }
  } catch {
    // ignore
  }

  return {
    id: String(lead._id),
    studentId: String(lead.studentId),
    studentName: student
      ? `${(student as unknown as { firstName: string; lastName: string }).firstName} ${(student as unknown as { firstName: string; lastName: string }).lastName}`
      : "Unknown Student",
    studentPhone: (student as unknown as { phone?: string })?.phone ?? lead.contactPhone,
    targetType: lead.targetType,
    targetTitle,
    message: lead.message,
    preferredDate: lead.preferredDate?.toISOString(),
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
  };
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function getOwnerPipeline(ownerId: string): Promise<LeadPipelineDTO[]> {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  const pipelines = await LeadPipelineModel.find({ ownerId: ownerObjectId })
    .sort({ updatedAt: -1 })
    .lean();

  // Ensure all leads have a pipeline entry
  const ownerLeads = await LeadModel.find({ ownerId: ownerObjectId }, { _id: 1 }).lean();
  const existingLeadIds = new Set(pipelines.map((p) => String(p.leadId)));
  const missingLeads = ownerLeads.filter((l) => !existingLeadIds.has(String(l._id)));

  if (missingLeads.length > 0) {
    await LeadPipelineModel.insertMany(
      missingLeads.map((l) => ({
        leadId: l._id,
        ownerId: ownerObjectId,
        stage: "NEW_LEAD",
        priority: "MEDIUM",
        notes: [],
        stageHistory: [],
      })),
      { ordered: false },
    ).catch(() => {}); // ignore duplicate key errors
  }

  const allPipelines = await LeadPipelineModel.find({ ownerId: ownerObjectId })
    .sort({ updatedAt: -1 })
    .lean();

  const results: LeadPipelineDTO[] = [];
  for (const p of allPipelines) {
    const lead = await enrichLead(p.leadId as mongoose.Types.ObjectId);
    if (!lead) continue;

    results.push({
      id: String(p._id),
      leadId: String(p.leadId),
      ownerId: String(p.ownerId),
      stage: p.stage,
      priority: p.priority,
      notes: p.notes.map((n) => ({
        text: n.text,
        createdAt: n.createdAt.toISOString(),
        createdBy: String(n.createdBy),
        createdByName: "Owner",
      })),
      stageHistory: p.stageHistory.map((h) => ({
        from: h.from,
        to: h.to,
        changedAt: h.changedAt.toISOString(),
        changedBy: String(h.changedBy),
      })),
      expectedConversionDate: p.expectedConversionDate?.toISOString(),
      dealValue: p.dealValue,
      lostReason: p.lostReason,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      lead,
    });
  }

  return results;
}

export async function updatePipelineStage(
  ownerId: string,
  leadId: string,
  stage: PipelineStageConstant,
  changedBy: string,
  note?: string,
  lostReason?: string,
  expectedConversionDate?: string,
  dealValue?: number,
): Promise<LeadPipelineDTO> {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  const leadObjectId = new mongoose.Types.ObjectId(leadId);
  const changedByObjectId = new mongoose.Types.ObjectId(changedBy);

  const existing = await LeadPipelineModel.findOne({
    leadId: leadObjectId,
    ownerId: ownerObjectId,
  });
  if (!existing) {
    throw new Error("Pipeline entry not found for this lead");
  }

  const previousStage = existing.stage;

  const updatePayload: Record<string, unknown> = { stage };
  if (lostReason) updatePayload.lostReason = lostReason;
  if (expectedConversionDate)
    updatePayload.expectedConversionDate = new Date(expectedConversionDate);
  if (dealValue !== undefined) updatePayload.dealValue = dealValue;

  const pipeline = await LeadPipelineModel.findOneAndUpdate(
    { leadId: leadObjectId, ownerId: ownerObjectId },
    {
      $set: updatePayload,
      $push: {
        stageHistory: {
          from: previousStage,
          to: stage,
          changedAt: new Date(),
          changedBy: changedByObjectId,
          note,
        },
        ...(note
          ? {
              notes: {
                text: note,
                createdAt: new Date(),
                createdBy: changedByObjectId,
              },
            }
          : {}),
      },
    },
    { new: true },
  ).lean();

  if (!pipeline) throw new Error("Failed to update pipeline stage");

  await logActivity(
    ownerObjectId,
    leadObjectId,
    "PIPELINE_STAGE_CHANGED",
    `Lead moved from ${previousStage} to ${stage}`,
    changedByObjectId,
    { previousStage, newStage: stage, note },
  );

  const lead = await enrichLead(leadObjectId);
  if (!lead) throw new Error("Lead not found");

  return {
    id: String(pipeline._id),
    leadId: String(pipeline.leadId),
    ownerId: String(pipeline.ownerId),
    stage: pipeline.stage,
    priority: pipeline.priority,
    notes: pipeline.notes.map((n) => ({
      text: n.text,
      createdAt: n.createdAt.toISOString(),
      createdBy: String(n.createdBy),
      createdByName: "Owner",
    })),
    stageHistory: pipeline.stageHistory.map((h) => ({
      from: h.from,
      to: h.to,
      changedAt: h.changedAt.toISOString(),
      changedBy: String(h.changedBy),
    })),
    expectedConversionDate: pipeline.expectedConversionDate?.toISOString(),
    dealValue: pipeline.dealValue,
    lostReason: pipeline.lostReason,
    createdAt: pipeline.createdAt.toISOString(),
    updatedAt: pipeline.updatedAt.toISOString(),
    lead,
  };
}

export async function addPipelineNote(
  ownerId: string,
  leadId: string,
  text: string,
  addedBy: string,
): Promise<void> {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  const leadObjectId = new mongoose.Types.ObjectId(leadId);
  const addedByObjectId = new mongoose.Types.ObjectId(addedBy);

  await LeadPipelineModel.findOneAndUpdate(
    { leadId: leadObjectId, ownerId: ownerObjectId },
    {
      $push: {
        notes: { text, createdAt: new Date(), createdBy: addedByObjectId },
      },
    },
    { upsert: true },
  );

  await logActivity(
    ownerObjectId,
    leadObjectId,
    "NOTE_ADDED",
    `Note added: "${text.slice(0, 80)}..."`,
    addedByObjectId,
    { text },
  );
}

// ─── Follow-ups ───────────────────────────────────────────────────────────────

export async function createFollowUp(
  ownerId: string,
  data: {
    leadId: string;
    scheduledAt: string;
    type: string;
    notes?: string;
    reminderAt?: string;
  },
): Promise<FollowUpDTO> {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  const leadObjectId = new mongoose.Types.ObjectId(data.leadId);

  const followUp = await FollowUpModel.create({
    ownerId: ownerObjectId,
    leadId: leadObjectId,
    scheduledAt: new Date(data.scheduledAt),
    type: data.type,
    notes: data.notes,
    status: "PENDING",
    reminder: data.reminderAt
      ? { reminderAt: new Date(data.reminderAt), status: "PENDING" }
      : undefined,
  });

  await logActivity(
    ownerObjectId,
    leadObjectId,
    "FOLLOW_UP_SCHEDULED",
    `Follow-up scheduled via ${data.type} for ${new Date(data.scheduledAt).toLocaleDateString()}`,
    ownerObjectId,
    { type: data.type, scheduledAt: data.scheduledAt },
  );

  return {
    id: String(followUp._id),
    leadId: String(followUp.leadId),
    ownerId: String(followUp.ownerId),
    scheduledAt: followUp.scheduledAt.toISOString(),
    type: followUp.type,
    notes: followUp.notes,
    status: followUp.status,
    completedAt: followUp.completedAt?.toISOString(),
    reminder: followUp.reminder
      ? { reminderAt: followUp.reminder.reminderAt.toISOString(), status: followUp.reminder.status }
      : undefined,
    createdAt: followUp.createdAt.toISOString(),
  };
}

export async function getOwnerFollowUps(ownerId: string): Promise<{
  today: FollowUpDTO[];
  tomorrow: FollowUpDTO[];
  overdue: FollowUpDTO[];
  upcoming: FollowUpDTO[];
}> {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowEnd = new Date(todayEnd.getTime() + 24 * 60 * 60 * 1000);

  const all = await FollowUpModel.find({
    ownerId: ownerObjectId,
    status: { $in: ["PENDING", "RESCHEDULED"] },
  })
    .sort({ scheduledAt: 1 })
    .lean();

  const toDTO = (f: (typeof all)[0]): FollowUpDTO => ({
    id: String(f._id),
    leadId: String(f.leadId),
    ownerId: String(f.ownerId),
    scheduledAt: f.scheduledAt.toISOString(),
    type: f.type,
    notes: f.notes,
    status: f.status,
    completedAt: f.completedAt?.toISOString(),
    reminder: f.reminder
      ? { reminderAt: f.reminder.reminderAt.toISOString(), status: f.reminder.status }
      : undefined,
    createdAt: f.createdAt.toISOString(),
  });

  return {
    overdue: all.filter((f) => f.scheduledAt < todayStart).map(toDTO),
    today: all.filter((f) => f.scheduledAt >= todayStart && f.scheduledAt < todayEnd).map(toDTO),
    tomorrow: all
      .filter((f) => f.scheduledAt >= todayEnd && f.scheduledAt < tomorrowEnd)
      .map(toDTO),
    upcoming: all.filter((f) => f.scheduledAt >= tomorrowEnd).map(toDTO),
  };
}

export async function completeFollowUp(ownerId: string, followUpId: string): Promise<void> {
  const followUp = await FollowUpModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(followUpId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
    },
    { $set: { status: "COMPLETED", completedAt: new Date() } },
    { new: true },
  );

  if (followUp) {
    await logActivity(
      new mongoose.Types.ObjectId(ownerId),
      followUp.leadId as mongoose.Types.ObjectId,
      "FOLLOW_UP_COMPLETED",
      `Follow-up (${followUp.type}) marked as completed`,
      new mongoose.Types.ObjectId(ownerId),
    );
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function createTask(
  ownerId: string,
  data: {
    leadId?: string;
    type: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority: string;
    tags?: string[];
  },
): Promise<CRMTaskDTO> {
  const task = await CRMTaskModel.create({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    leadId: data.leadId ? new mongoose.Types.ObjectId(data.leadId) : undefined,
    type: data.type,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    priority: data.priority,
    tags: data.tags ?? [],
    status: "PENDING",
  });

  if (data.leadId) {
    await logActivity(
      new mongoose.Types.ObjectId(ownerId),
      new mongoose.Types.ObjectId(data.leadId),
      "TASK_CREATED",
      `Task created: "${data.title}"`,
      new mongoose.Types.ObjectId(ownerId),
      { type: data.type, dueDate: data.dueDate },
    );
  }

  return {
    id: String(task._id),
    ownerId: String(task.ownerId),
    leadId: task.leadId ? String(task.leadId) : undefined,
    type: task.type,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate?.toISOString(),
    priority: task.priority,
    status: task.status,
    completedAt: task.completedAt?.toISOString(),
    tags: task.tags,
    createdAt: task.createdAt.toISOString(),
  };
}

export async function getOwnerTasks(ownerId: string): Promise<CRMTaskDTO[]> {
  const tasks = await CRMTaskModel.find({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    status: { $in: ["PENDING", "IN_PROGRESS"] },
  })
    .sort({ dueDate: 1, priority: -1 })
    .lean();

  return tasks.map((t) => ({
    id: String(t._id),
    ownerId: String(t.ownerId),
    leadId: t.leadId ? String(t.leadId) : undefined,
    type: t.type,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate?.toISOString(),
    priority: t.priority,
    status: t.status,
    completedAt: t.completedAt?.toISOString(),
    tags: t.tags,
    createdAt: t.createdAt.toISOString(),
  }));
}

export async function updateTaskStatus(
  ownerId: string,
  taskId: string,
  status: string,
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === "COMPLETED") update.completedAt = new Date();

  const task = await CRMTaskModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(taskId), ownerId: new mongoose.Types.ObjectId(ownerId) },
    { $set: update },
    { new: true },
  );

  if (task?.leadId && status === "COMPLETED") {
    await logActivity(
      new mongoose.Types.ObjectId(ownerId),
      task.leadId as mongoose.Types.ObjectId,
      "TASK_COMPLETED",
      `Task completed: "${task.title}"`,
      new mongoose.Types.ObjectId(ownerId),
    );
  }
}

// ─── Activity Timeline ────────────────────────────────────────────────────────

export async function getActivityTimeline(
  ownerId: string,
  leadId: string,
): Promise<ActivityLogDTO[]> {
  const logs = await ActivityLogModel.find({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    leadId: new mongoose.Types.ObjectId(leadId),
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const userIds = [...new Set(logs.map((l) => String(l.createdBy)))];
  const users = await UserModel.find(
    { _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    "firstName lastName",
  ).lean();
  const userMap = new Map(
    users.map((u) => [
      String(u._id),
      `${(u as unknown as { firstName: string }).firstName} ${(u as unknown as { lastName: string }).lastName}`,
    ]),
  );

  return logs.map((l) => ({
    id: String(l._id),
    ownerId: String(l.ownerId),
    leadId: String(l.leadId),
    type: l.type,
    description: l.description,
    metadata: l.metadata as Record<string, unknown> | undefined,
    createdAt: l.createdAt.toISOString(),
    createdBy: String(l.createdBy),
    createdByName: userMap.get(String(l.createdBy)) ?? "Unknown",
  }));
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getOwnerCRMAnalytics(ownerId: string): Promise<CRMAnalyticsDTO> {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowEnd = new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    newLeads,
    convertedLeads,
    lostLeads,
    pendingFollowUps,
    overdueFollowUps,
    pipelineByStage,
    todayReminders,
    tomorrowReminders,
    overdueReminders,
  ] = await Promise.all([
    LeadModel.countDocuments({ ownerId: ownerObjectId }),
    LeadModel.countDocuments({ ownerId: ownerObjectId, status: "NEW" }),
    LeadPipelineModel.countDocuments({ ownerId: ownerObjectId, stage: "CONVERTED" }),
    LeadPipelineModel.countDocuments({ ownerId: ownerObjectId, stage: "LOST" }),
    FollowUpModel.countDocuments({
      ownerId: ownerObjectId,
      status: "PENDING",
      scheduledAt: { $gte: todayStart },
    }),
    FollowUpModel.countDocuments({
      ownerId: ownerObjectId,
      status: "PENDING",
      scheduledAt: { $lt: todayStart },
    }),
    LeadPipelineModel.aggregate([
      { $match: { ownerId: ownerObjectId } },
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]),
    FollowUpModel.countDocuments({
      ownerId: ownerObjectId,
      scheduledAt: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) },
      status: "PENDING",
    }),
    FollowUpModel.countDocuments({
      ownerId: ownerObjectId,
      scheduledAt: { $gte: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000), $lt: tomorrowEnd },
      status: "PENDING",
    }),
    FollowUpModel.countDocuments({
      ownerId: ownerObjectId,
      scheduledAt: { $lt: todayStart },
      status: "PENDING",
    }),
  ]);

  const leadsByStage: Record<string, number> = {};
  for (const item of pipelineByStage) {
    leadsByStage[item._id as string] = item.count as number;
  }

  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Monthly leads (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyAgg = await LeadModel.aggregate([
    { $match: { ownerId: ownerObjectId, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const convertedByMonth = await LeadPipelineModel.aggregate([
    { $match: { ownerId: ownerObjectId, stage: "CONVERTED", updatedAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" } },
        count: { $sum: 1 },
      },
    },
  ]);
  const convertedMap = new Map(
    convertedByMonth.map((c) => [`${c._id.year}-${c._id.month}`, c.count as number]),
  );

  const monthlyLeads = monthlyAgg.map((m) => {
    const id = m._id as { year: number; month: number };
    const monthStr = `${id.year}-${String(id.month).padStart(2, "0")}`;
    return {
      month: monthStr,
      count: m.count as number,
      converted: convertedMap.get(`${id.year}-${id.month}`) ?? 0,
    };
  });

  return {
    totalLeads,
    newLeads,
    convertedLeads,
    lostLeads,
    conversionRate,
    avgResponseTimeMinutes: 0, // future: calculate from activity logs
    pendingFollowUps,
    overdueFollowUps,
    leadsByStage,
    monthlyLeads,
    todayReminders,
    tomorrowReminders,
    overdueReminders,
  };
}

export async function getAdminCRMAnalytics(): Promise<AdminCRMAnalyticsDTO> {
  const [totalLeads, totalConversions] = await Promise.all([
    LeadModel.countDocuments({}),
    LeadPipelineModel.countDocuments({ stage: "CONVERTED" }),
  ]);

  const platformConversionRate =
    totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100) : 0;

  // Top owners by conversion
  const ownerConversionAgg = await LeadPipelineModel.aggregate([
    {
      $group: {
        _id: "$ownerId",
        converted: {
          $sum: { $cond: [{ $eq: ["$stage", "CONVERTED"] }, 1, 0] },
        },
        totalEntries: { $sum: 1 },
      },
    },
    { $sort: { converted: -1 } },
    { $limit: 10 },
  ]);

  const topOwnersByConversion = await Promise.all(
    ownerConversionAgg.map(async (o) => {
      const owner = await UserModel.findById(o._id, "firstName lastName").lean();
      const ownerObj = owner as unknown as { firstName?: string; lastName?: string } | null;
      const totalLeadsForOwner = await LeadModel.countDocuments({ ownerId: o._id });
      return {
        ownerId: String(o._id),
        ownerName: ownerObj ? `${ownerObj.firstName} ${ownerObj.lastName}` : "Unknown",
        totalLeads: totalLeadsForOwner,
        converted: o.converted as number,
        conversionRate:
          totalLeadsForOwner > 0
            ? Math.round(((o.converted as number) / totalLeadsForOwner) * 100)
            : 0,
        avgResponseTimeMinutes: 0,
      };
    }),
  );

  // Popular colleges from student preferences
  const collegeAgg = await StudentPreferenceModel.aggregate([
    { $match: { college: { $exists: true, $ne: null } } },
    { $group: { _id: "$college", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return {
    totalPlatformLeads: totalLeads,
    totalConversions,
    platformConversionRate,
    topOwnersByConversion,
    popularCities: [{ city: "Indore", count: totalLeads }],
    popularColleges: collegeAgg.map((c) => ({
      college: c._id as string,
      count: c.count as number,
    })),
    mostViewedListings: [],
    mostSavedListings: [],
    highestConversionAreas: [],
  };
}
