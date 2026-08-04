import mongoose, { Schema, type Document } from "mongoose";

export interface IRecentlyViewed extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  viewedAt: Date;
}

const recentlyViewedSchema = new Schema<IRecentlyViewed>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    targetType: {
      type: String,
      required: [true, "Target type is required"],
      uppercase: true,
      trim: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });
recentlyViewedSchema.index({ sessionId: 1, viewedAt: -1 });

export const RecentlyViewedModel = mongoose.model<IRecentlyViewed>(
  "RecentlyViewed",
  recentlyViewedSchema,
);
