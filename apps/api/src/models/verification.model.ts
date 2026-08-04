import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { VerificationStatus } from "@studenthub/types";

export interface IVerification extends Document {
  ownerId: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  status: VerificationStatus;
  documentType?: string;
  documentUrls: string[];
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  badgeType: "VERIFIED_OWNER" | "VERIFIED_LISTING";
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: Schema.Types.ObjectId },
    status: {
      type: String,
      enum: ["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "REJECTED"],
      default: "PENDING_VERIFICATION",
      index: true,
    },
    documentType: { type: String },
    documentUrls: { type: [String], default: [] },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    badgeType: {
      type: String,
      enum: ["VERIFIED_OWNER", "VERIFIED_LISTING"],
      default: "VERIFIED_OWNER",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown> & { _id?: unknown; __v?: unknown }) => {
        if (ret._id) ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const VerificationModel: Model<IVerification> =
  mongoose.models.Verification || mongoose.model<IVerification>("Verification", verificationSchema);
