import type { FilterQuery } from "mongoose";
import { EnquiryModel, type IEnquiry } from "../models/enquiry.model.js";

export class EnquiryRepository {
  async create(data: Partial<IEnquiry>): Promise<IEnquiry> {
    const enquiry = new EnquiryModel(data);
    return await enquiry.save();
  }

  async findById(id: string): Promise<IEnquiry | null> {
    return await EnquiryModel.findById(id)
      .populate("userId", "firstName lastName email phone")
      .populate("ownerId", "firstName lastName email phone")
      .exec();
  }

  async findActiveUserEnquiryForTarget(
    userId: string,
    targetType: "ACCOMMODATION" | "LIBRARY",
    targetId: string,
  ): Promise<IEnquiry | null> {
    return await EnquiryModel.findOne({
      userId,
      targetType,
      targetId,
      status: { $ne: "CLOSED" },
    }).exec();
  }

  async findByUser(userId: string): Promise<IEnquiry[]> {
    return await EnquiryModel.find({ userId })
      .populate("ownerId", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByOwner(
    ownerId: string,
    filters?: { status?: string; targetType?: string },
  ): Promise<IEnquiry[]> {
    const query: FilterQuery<IEnquiry> = { ownerId };
    if (filters?.status && filters.status !== "ALL") {
      query.status = filters.status;
    }
    if (filters?.targetType) {
      query.targetType = filters.targetType;
    }

    return await EnquiryModel.find(query)
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(filters?: { status?: string; targetType?: string }): Promise<IEnquiry[]> {
    const query: FilterQuery<IEnquiry> = {};
    if (filters?.status && filters.status !== "ALL") {
      query.status = filters.status;
    }
    if (filters?.targetType && filters.targetType !== "ALL") {
      query.targetType = filters.targetType;
    }

    return await EnquiryModel.find(query)
      .populate("userId", "firstName lastName email phone")
      .populate("ownerId", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(
    id: string,
    status: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "CONVERTED" | "CLOSED",
  ): Promise<IEnquiry | null> {
    return await EnquiryModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate("userId", "firstName lastName email phone")
      .exec();
  }
}
