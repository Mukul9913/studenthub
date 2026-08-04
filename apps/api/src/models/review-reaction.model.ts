import mongoose, { Schema, type Document } from "mongoose";

export interface IReviewReaction extends Document {
  reviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "HELPFUL" | "LIKE";
  createdAt: Date;
}

const ReviewReactionSchema = new Schema<IReviewReaction>(
  {
    reviewId: { type: Schema.Types.ObjectId, required: true, ref: "Review", index: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    type: { type: String, required: true, enum: ["HELPFUL", "LIKE"] },
  },
  { timestamps: true },
);

ReviewReactionSchema.index({ reviewId: 1, userId: 1, type: 1 }, { unique: true });

export const ReviewReactionModel = mongoose.model<IReviewReaction>(
  "ReviewReaction",
  ReviewReactionSchema,
);
