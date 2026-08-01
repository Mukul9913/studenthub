import mongoose from "mongoose";
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from "../errors/index.js";
import type { IEnquiry } from "../models/enquiry.model.js";
import type { EnquiryRepository } from "../repositories/enquiry.repository.js";
import type { PropertyRepository } from "../repositories/property.repository.js";
import type { LibraryRepository } from "../repositories/library.repository.js";

export interface CreateEnquiryPayload {
  targetType: "ACCOMMODATION" | "LIBRARY";
  targetId: string;
  message: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ["CONTACTED", "CLOSED"],
  CONTACTED: ["VISIT_SCHEDULED", "CLOSED"],
  VISIT_SCHEDULED: ["CONVERTED", "CLOSED"],
  CONVERTED: ["CLOSED"],
  CLOSED: [],
};

export class EnquiryService {
  constructor(
    private enquiryRepository: EnquiryRepository,
    private propertyRepository: PropertyRepository,
    private libraryRepository: LibraryRepository,
  ) {}

  async createEnquiry(userId: string, payload: CreateEnquiryPayload): Promise<IEnquiry> {
    const { targetType, targetId, message } = payload;

    let ownerIdStr = "";
    let targetExists = false;

    if (targetType === "ACCOMMODATION") {
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
      throw new BadRequestError("Unsupported target type", "INVALID_TARGET_TYPE");
    }

    if (!targetExists || !ownerIdStr) {
      throw new NotFoundError("Listing target not found or inactive", "TARGET_NOT_FOUND");
    }

    // Prevent owner from inquiring on their own listing
    if (ownerIdStr === userId) {
      throw new BadRequestError(
        "You cannot submit an enquiry on your own listing",
        "SELF_ENQUIRY_FORBIDDEN",
      );
    }

    // Check for existing active duplicate enquiry
    const existingActive = await this.enquiryRepository.findActiveUserEnquiryForTarget(
      userId,
      targetType,
      targetId,
    );

    if (existingActive) {
      throw new ConflictError(
        "You already have an active enquiry for this listing. Please wait for the owner to respond.",
        "DUPLICATE_ACTIVE_ENQUIRY",
      );
    }

    return await this.enquiryRepository.create({
      userId: new mongoose.Types.ObjectId(userId) as unknown as mongoose.Types.ObjectId,
      ownerId: new mongoose.Types.ObjectId(ownerIdStr) as unknown as mongoose.Types.ObjectId,
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId) as unknown as mongoose.Types.ObjectId,
      message,
      status: "NEW",
    });
  }

  async getMyEnquiries(userId: string): Promise<unknown[]> {
    const rawEnquiries = await this.enquiryRepository.findByUser(userId);

    // Populate target details (title, area, cover image) for each enquiry
    const enriched = await Promise.all(
      rawEnquiries.map(async (e) => {
        const item = e.toObject ? e.toObject() : e;
        let targetDetails = {
          id: item.targetId?.toString() || "",
          title: "Listing",
          area: "Indore",
          image: "",
          link: "/",
        };

        if (item.targetType === "ACCOMMODATION") {
          const prop = await this.propertyRepository.findById(item.targetId?.toString());
          if (prop) {
            targetDetails = {
              id: prop.id || prop._id.toString(),
              title: prop.title,
              area: prop.area,
              image: prop.images?.[0] || "",
              link: `/accommodations/${prop.id || prop._id}`,
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
            };
          }
        }

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

        return { ...item, id: item.id || item._id?.toString(), owner, targetDetails };
      }),
    );

    return enriched;
  }

  async getOwnerLeads(
    ownerId: string,
    filters?: { status?: string; targetType?: string },
  ): Promise<unknown[]> {
    const rawEnquiries = await this.enquiryRepository.findByOwner(ownerId, filters);

    const enriched = await Promise.all(
      rawEnquiries.map(async (e) => {
        const item = e.toObject ? e.toObject() : e;
        let targetDetails = {
          id: item.targetId?.toString() || "",
          title: "Listing Target",
          area: "Indore",
          image: "",
          link: "/",
        };

        if (item.targetType === "ACCOMMODATION") {
          const prop = await this.propertyRepository.findById(item.targetId?.toString());
          if (prop) {
            targetDetails = {
              id: prop.id || prop._id.toString(),
              title: prop.title,
              area: prop.area,
              image: prop.images?.[0] || "",
              link: `/accommodations/${prop.id || prop._id}`,
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
            };
          }
        }

        const userObj =
          typeof item.userId === "object" && item.userId !== null
            ? (item.userId as Record<string, unknown>)
            : null;

        const user = userObj
          ? {
              id: String(userObj._id || userObj.id || userObj),
              name:
                `${String(userObj.firstName || "")} ${String(userObj.lastName || "")}`.trim() ||
                "Student User",
              email: String(userObj.email || ""),
              phone: String(userObj.phone || ""),
            }
          : undefined;

        return { ...item, id: item.id || item._id?.toString(), user, targetDetails };
      }),
    );

    return enriched;
  }

  async getAllEnquiries(filters?: { status?: string; targetType?: string }): Promise<unknown[]> {
    const rawEnquiries = await this.enquiryRepository.findAll(filters);

    const enriched = await Promise.all(
      rawEnquiries.map(async (e) => {
        const item = e.toObject ? e.toObject() : e;
        let targetDetails = {
          id: item.targetId?.toString() || "",
          title: "Listing Target",
          area: "Indore",
          image: "",
          link: "/",
        };

        if (item.targetType === "ACCOMMODATION") {
          const prop = await this.propertyRepository.findById(item.targetId?.toString());
          if (prop) {
            targetDetails = {
              id: prop.id || prop._id.toString(),
              title: prop.title,
              area: prop.area,
              image: prop.images?.[0] || "",
              link: `/accommodations/${prop.id || prop._id}`,
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
            };
          }
        }

        const userObj =
          typeof item.userId === "object" && item.userId !== null
            ? (item.userId as Record<string, unknown>)
            : null;

        const user = userObj
          ? {
              id: String(userObj._id || userObj.id || userObj),
              name:
                `${String(userObj.firstName || "")} ${String(userObj.lastName || "")}`.trim() ||
                "Student User",
              email: String(userObj.email || ""),
              phone: String(userObj.phone || ""),
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

        return { ...item, id: item.id || item._id?.toString(), user, owner, targetDetails };
      }),
    );

    return enriched;
  }

  async updateLeadStatus(
    enquiryId: string,
    caller: { id: string; role: string },
    newStatus: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "CONVERTED" | "CLOSED",
  ): Promise<IEnquiry> {
    const enquiry = await this.enquiryRepository.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError("Enquiry record not found", "ENQUIRY_NOT_FOUND");
    }

    const ownerIdStr =
      typeof enquiry.ownerId === "object" && enquiry.ownerId !== null
        ? (enquiry.ownerId as unknown as { _id?: { toString(): string } })._id?.toString() ||
          (enquiry.ownerId as unknown as { id?: string }).id ||
          String(enquiry.ownerId)
        : String(enquiry.ownerId || "");

    if (caller.role !== "admin" && ownerIdStr !== caller.id) {
      throw new ForbiddenError(
        "You are not authorized to manage this lead",
        "LEAD_UPDATE_FORBIDDEN",
      );
    }

    const currentStatus = enquiry.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(newStatus) && newStatus !== "CLOSED") {
      throw new BadRequestError(
        `Cannot transition lead status from ${currentStatus} to ${newStatus}`,
        "INVALID_STATUS_TRANSITION",
      );
    }

    const updated = await this.enquiryRepository.updateStatus(enquiryId, newStatus);
    if (!updated) {
      throw new NotFoundError("Enquiry record not found", "ENQUIRY_NOT_FOUND");
    }

    return updated;
  }
}
