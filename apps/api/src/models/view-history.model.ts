import mongoose, { Schema, type Document } from "mongoose";
import { VIEW_SOURCE } from "@studenthub/constants";
import type { ViewSourceConstant } from "@studenthub/constants";

export interface IViewHistory extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  targetTitle: string;
  targetArea?: string;
  targetImage?: string;
  targetRating?: number;
  targetPrice?: number;
  viewedAt: Date;
  durationSeconds?: number;
  source: ViewSourceConstant;
  createdAt: Date;
}

const viewHistorySchema = new Schema<IViewHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, required: true, trim: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetTitle: { type: String, required: true, trim: true, maxlength: 300 },
    targetArea: { type: String, trim: true },
    targetImage: { type: String, trim: true },
    targetRating: { type: Number, min: 0, max: 5 },
    targetPrice: { type: Number, min: 0 },
    viewedAt: { type: Date, default: Date.now },
    durationSeconds: { type: Number, min: 0 },
    source: { type: String, enum: VIEW_SOURCE, default: "DIRECT" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (
        _doc,
        ret: Record<string, unknown> & {
          _id?: unknown;
          __v?: unknown;
        },
      ) => {
        if (ret._id) ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound index to track unique views per user/listing combination
viewHistorySchema.index({ userId: 1, targetType: 1, targetId: 1 });
viewHistorySchema.index({ userId: 1, viewedAt: -1 });
viewHistorySchema.index({ targetType: 1, targetId: 1, viewedAt: -1 });
// TTL: auto-expire view history after 90 days
viewHistorySchema.index({ viewedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const ViewHistoryModel = mongoose.model<IViewHistory>("ViewHistory", viewHistorySchema);
