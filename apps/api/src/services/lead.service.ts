import mongoose from "mongoose";
import { NotFoundError, ForbiddenError, BadRequestError } from "../errors/index.js";
import type { ILead } from "../models/lead.model.js";
import type { LeadRepository, LeadFilters } from "../repositories/lead.repository.js";
import type { PropertyRepository } from "../repositories/property.repository.js";
import type { LibraryRepository } from "../repositories/library.repository.js";
import { leadEventEmitter, LEAD_EVENTS } from "../events/lead.events.js";
import type {
  LeadStatusConstant,
  LeadTargetTypeConstant,
  LeadSourceConstant,
} from "@studenthub/constants";

export interface CreateLeadPayload {
  targetType: LeadTargetTypeConstant;
  targetId: string;
  preferredDate?: string;
  preferredTime?: string;
  message: string;
  contactPhone?: string;
  contactEmail?: string;
  source?: LeadSourceConstant;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatusConstant;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

export interface AddFollowUpPayload {
  note: string;
  scheduledFollowUpDate?: string;
  contactChannel?: "CALL" | "WHATSAPP" | "EMAIL" | "IN_PERSON";
}

const VALID_LEAD_TRANSITIONS: Record<string, string[]> = {
  NEW: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
  PENDING: ["ACCEPTED", "REJECTED", "RESCHEDULED", "CANCELLED"],
  ACCEPTED: ["RESCHEDULED", "VISITED", "CONVERTED", "CANCELLED"],
  RESCHEDULED: ["ACCEPTED", "REJECTED", "VISITED", "CONVERTED", "CANCELLED"],
  VISITED: ["CONVERTED", "CANCELLED"],
  CONVERTED: [],
  REJECTED: [],
  CANCELLED: [],
};

export class LeadService {
  constructor(
    private leadRepository: LeadRepository,
    private propertyRepository: PropertyRepository,
    private libraryRepository: LibraryRepository,
  ) {}

  async createLead(
    student: { id: string; email?: string; phone?: string },
    payload: CreateLeadPayload,
  ): Promise<ILead> {
    const {
      targetType,
      targetId,
      preferredDate,
      preferredTime,
      message,
      contactPhone,
      contactEmail,
      source,
    } = payload;

    let ownerIdStr = "";
    let targetExists = false;

    if (targetType === "ACCOMMODATION" || targetType === "PG" || targetType === "HOSTEL") {
      const property = await this.propertyRepository.findById(targetId);
      if (property) {
        targetExists = true;
        ownerIdStr =
          typeof property.ownerId === "object" && property.ownerId !== null
            ? (property.ownerId as unknown as { _id?: { toString(): string } })._id?.toString() ||
              (property.ownerId as unknown as { id?: string }).id ||
              String(property.ownerId)
            : String(property.ownerId || "");
      }
    } else if (targetType === "LIBRARY") {
      const library = await this.libraryRepository.findById(targetId);
      if (library) {
        targetExists = true;
        ownerIdStr =
          typeof library.ownerId === "object" && library.ownerId !== null
            ? (library.ownerId as unknown as { _id?: { toString(): string } })._id?.toString() ||
              (library.ownerId as unknown as { id?: string }).id ||
              String(library.ownerId)
            : String(library.ownerId || "");
      }
    } else {
      throw new BadRequestError(
        `Target type ${targetType} is currently not available`,
        "INVALID_TARGET_TYPE",
      );
    }

    if (!targetExists || !ownerIdStr) {
      throw new NotFoundError("Listing target not found or inactive", "TARGET_NOT_FOUND");
    }

    if (ownerIdStr === student.id) {
      throw new BadRequestError(
        "You cannot submit an enquiry on your own listing",
        "SELF_ENQUIRY_FORBIDDEN",
      );
    }

    const existingActive = await this.leadRepository.findActiveStudentLeadForTarget(
      student.id,
      targetType,
      targetId,
    );
    if (existingActive) {
      if (message || preferredDate || preferredTime) {
        if (message) existingActive.message = message;
        if (preferredDate) existingActive.preferredDate = new Date(preferredDate);
        if (preferredTime) existingActive.preferredTime = preferredTime;
        await existingActive.save();
      }
      return existingActive;
    }

    const lead = await this.leadRepository.create({
      studentId: new mongoose.Types.ObjectId(student.id) as unknown as mongoose.Types.ObjectId,
      ownerId: new mongoose.Types.ObjectId(ownerIdStr) as unknown as mongoose.Types.ObjectId,
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId) as unknown as mongoose.Types.ObjectId,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTime: preferredTime || undefined,
      message,
      contactPhone: contactPhone || student.phone || "9999999999",
      contactEmail: contactEmail || student.email,
      status: "NEW",
      source: source || "VISIT_REQUEST",
      revenueMetadata: {
        isSponsored: false,
        isVerifiedOwner: true,
        monetizationTier: "free",
        leadCreditsCharged: 0,
      },
    });

    // Record initial timeline entry
    await this.leadRepository.createTimelineEntry({
      leadId: lead.id || lead._id.toString(),
      action: "LEAD_CREATED",
      actorId: student.id,
      actorRole: "student",
      notes: `Lead created via ${source || "VISIT_REQUEST"}`,
      metadata: { preferredDate, preferredTime },
    });

    // Emit asynchronous lead event
    leadEventEmitter.emit(LEAD_EVENTS.CREATED, {
      leadId: lead.id || lead._id.toString(),
      studentId: student.id,
      ownerId: ownerIdStr,
      targetType,
      targetId,
    });

    return lead;
  }

  async getMyLeads(studentId: string): Promise<unknown[]> {
    const rawLeads = await this.leadRepository.findByStudent(studentId);
    return await Promise.all(rawLeads.map((lead) => this.enrichLead(lead)));
  }

  async getOwnerLeads(
    ownerId: string,
    filters?: LeadFilters,
  ): Promise<{ items: unknown[]; total: number }> {
    const { leads, total } = await this.leadRepository.findByOwner(ownerId, filters);
    const enriched = await Promise.all(leads.map((lead) => this.enrichLead(lead)));
    return { items: enriched, total };
  }

  async getAdminLeads(filters?: LeadFilters): Promise<{ items: unknown[]; total: number }> {
    const { leads, total } = await this.leadRepository.findAll(filters);
    const enriched = await Promise.all(leads.map((lead) => this.enrichLead(lead)));
    return { items: enriched, total };
  }

  async updateLeadStatus(
    leadId: string,
    caller: { id: string; role: string },
    payload: UpdateLeadStatusPayload,
  ): Promise<ILead> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError("Lead record not found", "LEAD_NOT_FOUND");
    }

    const ownerIdStr =
      typeof lead.ownerId === "object" && lead.ownerId !== null
        ? (lead.ownerId as unknown as { _id?: { toString(): string } })._id?.toString() ||
          (lead.ownerId as unknown as { id?: string }).id ||
          String(lead.ownerId)
        : String(lead.ownerId || "");

    const studentIdStr =
      typeof lead.studentId === "object" && lead.studentId !== null
        ? (lead.studentId as unknown as { _id?: { toString(): string } })._id?.toString() ||
          (lead.studentId as unknown as { id?: string }).id ||
          String(lead.studentId)
        : String(lead.studentId || "");

    // Allow student to CANCEL their own lead, allow owner/admin for full status updates
    const isOwner = ownerIdStr === caller.id;
    const isStudent = studentIdStr === caller.id;
    const isAdmin = caller.role === "admin";

    if (!isAdmin && !isOwner && !(isStudent && payload.status === "CANCELLED")) {
      throw new ForbiddenError(
        "You are not authorized to update this lead",
        "LEAD_UPDATE_FORBIDDEN",
      );
    }

    const currentStatus = lead.status;
    const allowedNext = VALID_LEAD_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(payload.status) && payload.status !== "CANCELLED") {
      throw new BadRequestError(
        `Cannot transition lead status from ${currentStatus} to ${payload.status}`,
        "INVALID_STATUS_TRANSITION",
      );
    }

    const updated = await this.leadRepository.updateStatus(leadId, payload.status, {
      preferredDate: payload.preferredDate ? new Date(payload.preferredDate) : undefined,
      preferredTime: payload.preferredTime,
    });

    if (!updated) {
      throw new NotFoundError("Lead record not found", "LEAD_NOT_FOUND");
    }

    // Audit timeline entry
    await this.leadRepository.createTimelineEntry({
      leadId,
      action: `STATUS_CHANGED_TO_${payload.status}`,
      actorId: caller.id,
      actorRole: caller.role,
      notes: payload.notes || `Lead status updated to ${payload.status}`,
    });

    // Emit event
    leadEventEmitter.emit(LEAD_EVENTS.STATUS_UPDATED, {
      leadId,
      status: payload.status,
      actorRole: caller.role,
    });

    if (payload.status === "CONVERTED") {
      leadEventEmitter.emit(LEAD_EVENTS.CONVERTED, { leadId });
    }

    return updated;
  }

  async addFollowUp(
    leadId: string,
    ownerId: string,
    payload: AddFollowUpPayload,
  ): Promise<unknown> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError("Lead record not found", "LEAD_NOT_FOUND");
    }

    const followUp = await this.leadRepository.createFollowUp({
      leadId,
      ownerId,
      note: payload.note,
      scheduledFollowUpDate: payload.scheduledFollowUpDate
        ? new Date(payload.scheduledFollowUpDate)
        : undefined,
      contactChannel: payload.contactChannel,
    });

    await this.leadRepository.createTimelineEntry({
      leadId,
      action: "FOLLOWUP_NOTE_ADDED",
      actorId: ownerId,
      actorRole: "owner",
      notes: payload.note,
      metadata: { channel: payload.contactChannel },
    });

    return followUp;
  }

  async getLeadTimeline(leadId: string): Promise<unknown> {
    const [timelines, followUps] = await Promise.all([
      this.leadRepository.getTimeline(leadId),
      this.leadRepository.getFollowUps(leadId),
    ]);
    return { timelines, followUps };
  }

  async getOwnerAnalytics(ownerId: string) {
    return await this.leadRepository.getOwnerAnalytics(ownerId);
  }

  async getAdminAnalytics() {
    return await this.leadRepository.getAdminAnalytics();
  }

  private async enrichLead(lead: ILead) {
    const item = lead.toObject ? lead.toObject() : lead;
    let targetDetails = {
      id: item.targetId?.toString() || "",
      title: "Listing Target",
      area: "Indore",
      image: "",
      link: "/",
      propertyType: item.targetType,
    };

    if (
      item.targetType === "ACCOMMODATION" ||
      item.targetType === "PG" ||
      item.targetType === "HOSTEL"
    ) {
      const prop = await this.propertyRepository.findById(item.targetId?.toString());
      if (prop) {
        targetDetails = {
          id: prop.id || prop._id.toString(),
          title: prop.title,
          area: prop.area,
          image: prop.images?.[0] || "",
          link: `/accommodations/${prop.id || prop._id}`,
          propertyType: prop.propertyType,
        };
      }
    } else if (item.targetType === "LIBRARY") {
      const lib = await this.libraryRepository.findById(item.targetId?.toString());
      if (lib) {
        targetDetails = {
          id: lib.id || lib._id.toString(),
          title: lib.name,
          area: lib.area,
          image: lib.images?.[0] || "",
          link: `/libraries/${lib.id || lib._id}`,
          propertyType: "LIBRARY",
        };
      }
    }

    const studentObj =
      typeof item.studentId === "object" && item.studentId !== null
        ? (item.studentId as Record<string, unknown>)
        : null;
    const student = studentObj
      ? {
          id: String(studentObj._id || studentObj.id || studentObj),
          name:
            `${String(studentObj.firstName || "")} ${String(studentObj.lastName || "")}`.trim() ||
            "Student User",
          email: String(studentObj.email || item.contactEmail || ""),
          phone: String(studentObj.phone || item.contactPhone || ""),
        }
      : undefined;

    const ownerObj =
      typeof item.ownerId === "object" && item.ownerId !== null
        ? (item.ownerId as Record<string, unknown>)
        : null;
    const owner = ownerObj
      ? {
          id: String(ownerObj._id || ownerObj.id || ownerObj),
          name:
            `${String(ownerObj.firstName || "")} ${String(ownerObj.lastName || "")}`.trim() ||
            "Property Owner",
          email: String(ownerObj.email || ""),
          phone: String(ownerObj.phone || ""),
        }
      : undefined;

    return {
      ...item,
      id: item.id || item._id?.toString(),
      student,
      owner,
      targetDetails,
    };
  }
}
