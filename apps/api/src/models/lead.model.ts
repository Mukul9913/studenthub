import mongoose, { Schema, type Document } from "mongoose";
import { LEAD_STATUS, LEAD_TARGET_TYPE, LEAD_SOURCE } from "@studenthub/constants";
import type {
  LeadStatusConstant,
  LeadTargetTypeConstant,
  LeadSourceConstant,
} from "@studenthub/constants";

export interface ILeadRevenueMetadata {
  isSponsored?: boolean;
  isVerifiedOwner?: boolean;
  monetizationTier?: "free" | "standard" | "premium";
  leadCreditsCharged?: number;
}

export interface ILead extends Document {
  studentId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  targetType: LeadTargetTypeConstant;
  targetId: mongoose.Types.ObjectId;
  preferredDate?: Date;
  preferredTime?: string;
  message: string;
  contactPhone: string;
  contactEmail?: string;
  status: LeadStatusConstant;
  source: LeadSourceConstant;
  revenueMetadata?: ILeadRevenueMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    targetType: {
      type: String,
      enum: LEAD_TARGET_TYPE,
      required: [true, "Target type is required"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
    },
    preferredDate: {
      type: Date,
    },
    preferredTime: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: LEAD_STATUS,
      default: "NEW",
    },
    source: {
      type: String,
      enum: LEAD_SOURCE,
      default: "VISIT_REQUEST",
    },
    revenueMetadata: {
      isSponsored: { type: Boolean, default: false },
      isVerifiedOwner: { type: Boolean, default: false },
      monetizationTier: { type: String, enum: ["free", "standard", "premium"], default: "free" },
      leadCreditsCharged: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

leadSchema.index({ studentId: 1 });
leadSchema.index({ ownerId: 1 });
leadSchema.index({ targetType: 1, targetId: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ ownerId: 1, status: 1, createdAt: -1 });

export const LeadModel = mongoose.model<ILead>("Lead", leadSchema);
