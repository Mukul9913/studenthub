import mongoose, { Schema, type Document } from "mongoose";
import { FOLLOWUP_TYPE, FOLLOWUP_STATUS } from "@studenthub/constants";
import type { FollowUpTypeConstant, FollowUpStatusConstant } from "@studenthub/constants";

export interface IFollowUpReminder {
  reminderAt: Date;
  status: "PENDING" | "SENT" | "DISMISSED";
}

export interface IFollowUp extends Document {
  leadId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  type: FollowUpTypeConstant;
  notes?: string;
  status: FollowUpStatusConstant;
  completedAt?: Date;
  reminder?: IFollowUpReminder;
  createdAt: Date;
  updatedAt: Date;
}

const followUpReminderSchema = new Schema<IFollowUpReminder>(
  {
    reminderAt: { type: Date, required: true },
    status: { type: String, enum: ["PENDING", "SENT", "DISMISSED"], default: "PENDING" },
  },
  { _id: false },
);

const followUpSchema = new Schema<IFollowUp>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead ID is required"],
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
      index: true,
    },
    scheduledAt: { type: Date, required: [true, "Scheduled date is required"] },
    type: { type: String, enum: FOLLOWUP_TYPE, required: true, default: "CALL" },
    notes: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: FOLLOWUP_STATUS, default: "PENDING" },
    completedAt: { type: Date },
    reminder: { type: followUpReminderSchema },
  },
  {
    timestamps: true,
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
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

followUpSchema.index({ leadId: 1, createdAt: -1 });
followUpSchema.index({ ownerId: 1, status: 1 });
followUpSchema.index({ ownerId: 1, scheduledAt: 1 }); // for Today / Tomorrow / Overdue queries
followUpSchema.index({ "reminder.status": 1, "reminder.reminderAt": 1 }); // reminder polling

export const FollowUpModel = mongoose.model<IFollowUp>("FollowUp", followUpSchema);
