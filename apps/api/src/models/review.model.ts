import mongoose, { Schema, type Document } from "mongoose";

export interface IReview extends Document {
  targetType: "ACCOMMODATION" | "LIBRARY" | string;
  targetId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  isVerifiedPurchase: boolean;
  rating: number; // 1-5
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  isAnonymous: boolean;
  images: string[];
  videoUrl?: string;
  status: "APPROVED" | "PENDING" | "HIDDEN" | "FLAGGED";
  helpfulCount: number;
  reportCount: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  aiSummaryTag?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    targetType: { type: String, required: true, enum: ["ACCOMMODATION", "LIBRARY"], index: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    studentId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    isVerifiedPurchase: { type: Boolean, default: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],
    wouldRecommend: { type: Boolean, default: true },
    isAnonymous: { type: Boolean, default: false },
    images: [{ type: String }],
    videoUrl: { type: String },
    status: {
      type: String,
      enum: ["APPROVED", "PENDING", "HIDDEN", "FLAGGED"],
      default: "APPROVED",
      index: true,
    },
    helpfulCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    sentiment: {
      type: String,
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      default: "POSITIVE",
    },
    aiSummaryTag: { type: String },
  },
  { timestamps: true },
);

ReviewSchema.index({ targetType: 1, targetId: 1, status: 1 });
ReviewSchema.index({ studentId: 1, targetId: 1 }, { unique: true }); // Prevent duplicate reviews by same student for same listing

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
