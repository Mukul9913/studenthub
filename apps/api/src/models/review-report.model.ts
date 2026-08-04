import mongoose, { Schema, type Document } from "mongoose";

export interface IReviewReport extends Document {
  reviewId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: "FAKE_REVIEW" | "SPAM" | "ABUSIVE_LANGUAGE" | "IRRELEVANT" | "OTHER";
  details?: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewReportSchema = new Schema<IReviewReport>(
  {
    reviewId: { type: Schema.Types.ObjectId, required: true, ref: "Review", index: true },
    reporterId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    reason: {
      type: String,
      required: true,
      enum: ["FAKE_REVIEW", "SPAM", "ABUSIVE_LANGUAGE", "IRRELEVANT", "OTHER"],
    },
    details: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "DISMISSED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true },
);

export const ReviewReportModel = mongoose.model<IReviewReport>("ReviewReport", ReviewReportSchema);
