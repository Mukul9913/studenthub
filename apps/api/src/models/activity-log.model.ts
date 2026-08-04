import mongoose, { Schema, type Document } from "mongoose";
import { ACTIVITY_TYPE } from "@studenthub/constants";
import type { ActivityTypeConstant } from "@studenthub/constants";

export interface IActivityLog extends Document {
  ownerId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  type: ActivityTypeConstant;
  description: string;
  metadata?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    type: { type: String, enum: ACTIVITY_TYPE, required: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

// Primary index for chronological activity timeline per lead
activityLogSchema.index({ leadId: 1, createdAt: -1 });
activityLogSchema.index({ ownerId: 1, createdAt: -1 });

export const ActivityLogModel = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
