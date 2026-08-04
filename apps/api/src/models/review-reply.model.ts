import mongoose, { Schema, type Document } from "mongoose";

export interface IReviewReply extends Document {
  reviewId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewReplySchema = new Schema<IReviewReply>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Review",
      unique: true,
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

export const ReviewReplyModel = mongoose.model<IReviewReply>("ReviewReply", ReviewReplySchema);
