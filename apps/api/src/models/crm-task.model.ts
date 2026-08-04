import mongoose, { Schema, type Document } from "mongoose";
import { TASK_TYPE, TASK_STATUS, CRM_PRIORITY } from "@studenthub/constants";
import type {
  TaskTypeConstant,
  TaskStatusConstant,
  CRMPriorityConstant,
} from "@studenthub/constants";

export interface ICRMTask extends Document {
  ownerId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  type: TaskTypeConstant;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: CRMPriorityConstant;
  status: TaskStatusConstant;
  completedAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const crmTaskSchema = new Schema<ICRMTask>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    type: { type: String, enum: TASK_TYPE, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    dueDate: { type: Date },
    priority: { type: String, enum: CRM_PRIORITY, default: "MEDIUM" },
    status: { type: String, enum: TASK_STATUS, default: "PENDING" },
    completedAt: { type: Date },
    tags: [{ type: String, trim: true, maxlength: 50 }],
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
  },
);

crmTaskSchema.index({ ownerId: 1, status: 1, dueDate: 1 });
crmTaskSchema.index({ ownerId: 1, leadId: 1 });

export const CRMTaskModel = mongoose.model<ICRMTask>("CRMTask", crmTaskSchema);
