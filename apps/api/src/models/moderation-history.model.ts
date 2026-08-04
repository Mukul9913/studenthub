import mongoose, { Schema, type Document } from "mongoose";

export interface IModerationHistory extends Document {
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  action: string;
  previousStatus?: string;
  newStatus: string;
  moderatorId?: mongoose.Types.ObjectId;
  reason?: string;
  notes?: string;
  createdAt: Date;
}

const moderationHistorySchema = new Schema<IModerationHistory>(
  {
    targetType: {
      type: String,
      required: [true, "Target type is required"],
      uppercase: true,
      trim: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      uppercase: true,
      trim: true,
    },
    previousStatus: {
      type: String,
      uppercase: true,
      trim: true,
    },
    newStatus: {
      type: String,
      required: [true, "New status is required"],
      uppercase: true,
      trim: true,
    },
    moderatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

moderationHistorySchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const ModerationHistoryModel = mongoose.model<IModerationHistory>(
  "ModerationHistory",
  moderationHistorySchema,
);
