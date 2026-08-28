import mongoose from "mongoose";
import { NotFoundError, ForbiddenError, BadRequestError } from "../errors/index.js";
import { PropertyModel } from "../models/property.model.js";
import { LibraryModel } from "../models/library.model.js";
import { MessModel } from "../models/mess.model.js";
import type {
  ModerationRepository,
  ModerationFilters,
} from "../repositories/moderation.repository.js";
import { moderationEventEmitter, MODERATION_EVENTS } from "../events/moderation.events.js";

export class ModerationService {
  constructor(private moderationRepository: ModerationRepository) {}

  private async getTargetDoc(targetType: string, targetId: string) {
    const typeUpper = targetType.toUpperCase();
    const objId = new mongoose.Types.ObjectId(targetId);

    if (typeUpper === "ACCOMMODATION" || typeUpper === "PG" || typeUpper === "HOSTEL") {
      const property = await PropertyModel.findById(objId);
      if (!property)
        throw new NotFoundError("Accommodation property not found", "PROPERTY_NOT_FOUND");
      return { doc: property, targetType: "ACCOMMODATION" };
    } else if (typeUpper === "LIBRARY") {
      const library = await LibraryModel.findById(objId);
      if (!library) throw new NotFoundError("Library study space not found", "LIBRARY_NOT_FOUND");
      return { doc: library, targetType: "LIBRARY" };
    } else if (typeUpper === "MESS" || typeUpper === "TIFFIN") {
      const mess = await MessModel.findById(objId);
      if (!mess) throw new NotFoundError("Mess / tiffin listing not found", "MESS_NOT_FOUND");
      return { doc: mess, targetType: "MESS" };
    } else {
      throw new BadRequestError(
        `Target type ${targetType} is currently not supported`,
        "INVALID_TARGET_TYPE",
      );
    }
  }

  async submitForReview(
    actor: { id: string; role: string },
    targetType: string,
    targetId: string,
    notes?: string,
  ) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);

    if (actor.role !== "admin" && String(doc.ownerId) !== actor.id) {
      throw new ForbiddenError(
        "You can only submit your own listings for review",
        "NOT_LISTING_OWNER",
      );
    }

    const previousStatus = doc.status || "DRAFT";
    doc.status = "PENDING_REVIEW";
    doc.submittedAt = new Date();
    doc.moderationNotes = notes || doc.moderationNotes;

    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "SUBMIT",
      previousStatus,
      newStatus: "PENDING_REVIEW",
      reason: notes,
    });

    moderationEventEmitter.emit(MODERATION_EVENTS.SUBMITTED, {
      targetType: canonicalType,
      targetId,
      ownerId: doc.ownerId,
    });

    return doc;
  }

  async startReview(admin: { id: string; role: string }, targetType: string, targetId: string) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);
    const previousStatus = doc.status;

    doc.status = "UNDER_REVIEW";
    doc.assignedModeratorId = new mongoose.Types.ObjectId(admin.id);
    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "START_REVIEW",
      previousStatus,
      newStatus: "UNDER_REVIEW",
      moderatorId: admin.id,
    });

    return doc;
  }

  async approveListing(
    admin: { id: string; role: string },
    targetType: string,
    targetId: string,
    notes?: string,
    verifyListing = true,
  ) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);
    const previousStatus = doc.status;

    doc.status = "APPROVED";
    doc.reviewedAt = new Date();
    doc.reviewedBy = new mongoose.Types.ObjectId(admin.id);
    doc.rejectionReason = undefined;
    doc.moderationNotes = notes || doc.moderationNotes;

    if (verifyListing) {
      doc.isVerified = true;
      doc.verificationStatus = "VERIFIED";
      doc.verificationDate = new Date();
      doc.verifiedBy = new mongoose.Types.ObjectId(admin.id);
    }

    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "APPROVE",
      previousStatus,
      newStatus: "APPROVED",
      moderatorId: admin.id,
      notes,
    });

    moderationEventEmitter.emit(MODERATION_EVENTS.APPROVED, {
      targetType: canonicalType,
      targetId,
      ownerId: doc.ownerId,
      approvedBy: admin.id,
    });

    return doc;
  }

  async rejectListing(
    admin: { id: string; role: string },
    targetType: string,
    targetId: string,
    reason: string,
    notes?: string,
  ) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);
    const previousStatus = doc.status;

    doc.status = "REJECTED";
    doc.reviewedAt = new Date();
    doc.reviewedBy = new mongoose.Types.ObjectId(admin.id);
    doc.rejectionReason = reason;
    doc.moderationNotes = notes || doc.moderationNotes;

    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "REJECT",
      previousStatus,
      newStatus: "REJECTED",
      moderatorId: admin.id,
      reason,
      notes,
    });

    moderationEventEmitter.emit(MODERATION_EVENTS.REJECTED, {
      targetType: canonicalType,
      targetId,
      ownerId: doc.ownerId,
      reason,
    });

    return doc;
  }

  async suspendListing(
    admin: { id: string; role: string },
    targetType: string,
    targetId: string,
    reason: string,
    notes?: string,
  ) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);
    const previousStatus = doc.status;

    doc.status = "SUSPENDED";
    doc.moderationNotes = notes || doc.moderationNotes;

    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "SUSPEND",
      previousStatus,
      newStatus: "SUSPENDED",
      moderatorId: admin.id,
      reason,
      notes,
    });

    moderationEventEmitter.emit(MODERATION_EVENTS.SUSPENDED, {
      targetType: canonicalType,
      targetId,
      ownerId: doc.ownerId,
      reason,
    });

    return doc;
  }

  async archiveListing(
    actor: { id: string; role: string },
    targetType: string,
    targetId: string,
    reason?: string,
  ) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);

    if (actor.role !== "admin" && String(doc.ownerId) !== actor.id) {
      throw new ForbiddenError("You can only archive your own listings", "NOT_LISTING_OWNER");
    }

    const previousStatus = doc.status;
    doc.status = "ARCHIVED";
    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "ARCHIVE",
      previousStatus,
      newStatus: "ARCHIVED",
      moderatorId: actor.role === "admin" ? actor.id : undefined,
      reason,
    });

    return doc;
  }

  async restoreListing(actor: { id: string; role: string }, targetType: string, targetId: string) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);

    if (actor.role !== "admin" && String(doc.ownerId) !== actor.id) {
      throw new ForbiddenError("You can only restore your own listings", "NOT_LISTING_OWNER");
    }

    const previousStatus = doc.status;
    doc.status = actor.role === "admin" ? "APPROVED" : "DRAFT";
    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "RESTORE",
      previousStatus,
      newStatus: doc.status,
      moderatorId: actor.role === "admin" ? actor.id : undefined,
    });

    moderationEventEmitter.emit(MODERATION_EVENTS.RESTORED, {
      targetType: canonicalType,
      targetId,
      newStatus: doc.status,
    });

    return doc;
  }

  async assignModerator(
    admin: { id: string; role: string },
    targetType: string,
    targetId: string,
    moderatorId: string,
  ) {
    const { doc, targetType: canonicalType } = await this.getTargetDoc(targetType, targetId);
    doc.assignedModeratorId = new mongoose.Types.ObjectId(moderatorId);
    await doc.save();

    await this.moderationRepository.logHistory({
      targetType: canonicalType,
      targetId,
      action: "ASSIGN_MODERATOR",
      previousStatus: doc.status,
      newStatus: doc.status,
      moderatorId: admin.id,
      notes: `Assigned to moderator ${moderatorId}`,
    });

    return doc;
  }

  async addComment(
    actor: { id: string; role: string },
    targetType: string,
    targetId: string,
    comment: string,
    isInternalOnly = false,
  ) {
    return this.moderationRepository.addComment({
      targetType,
      targetId,
      authorId: actor.id,
      authorRole: actor.role,
      comment,
      isInternalOnly,
    });
  }

  async getHistory(targetType: string, targetId: string) {
    return this.moderationRepository.getHistory(targetType, targetId);
  }

  async getComments(actor: { id: string; role: string }, targetType: string, targetId: string) {
    const includeInternal = actor.role === "admin";
    return this.moderationRepository.getComments(targetType, targetId, includeInternal);
  }

  async getAdminQueue(filters: ModerationFilters) {
    return this.moderationRepository.getAdminQueue(filters);
  }

  async getAdminAnalytics() {
    return this.moderationRepository.getAdminAnalytics();
  }
}
