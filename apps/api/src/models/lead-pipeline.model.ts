import mongoose, { Schema, type Document } from "mongoose";
import { PIPELINE_STAGES, CRM_PRIORITY } from "@studenthub/constants";
import type { PipelineStageConstant, CRMPriorityConstant } from "@studenthub/constants";

export interface IPipelineNote {
  text: string;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

export interface IPipelineStageHistory {
  from: PipelineStageConstant;
  to: PipelineStageConstant;
  changedAt: Date;
  changedBy: mongoose.Types.ObjectId;
  note?: string;
}

export interface ILeadPipeline extends Document {
  leadId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  stage: PipelineStageConstant;
  priority: CRMPriorityConstant;
  notes: IPipelineNote[];
  stageHistory: IPipelineStageHistory[];
  expectedConversionDate?: Date;
  dealValue?: number;
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pipelineNoteSchema = new Schema<IPipelineNote>(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: true },
);

const stageHistorySchema = new Schema<IPipelineStageHistory>(
  {
    from: { type: String, enum: PIPELINE_STAGES, required: true },
    to: { type: String, enum: PIPELINE_STAGES, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const leadPipelineSchema = new Schema<ILeadPipeline>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      unique: true,
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stage: { type: String, enum: PIPELINE_STAGES, default: "NEW_LEAD", required: true },
    priority: { type: String, enum: CRM_PRIORITY, default: "MEDIUM" },
    notes: [pipelineNoteSchema],
    stageHistory: [stageHistorySchema],
    expectedConversionDate: { type: Date },
    dealValue: { type: Number, min: 0 },
    lostReason: { type: String, trim: true, maxlength: 500 },
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

leadPipelineSchema.index({ ownerId: 1, stage: 1 });
leadPipelineSchema.index({ ownerId: 1, priority: 1, updatedAt: -1 });

export const LeadPipelineModel = mongoose.model<ILeadPipeline>("LeadPipeline", leadPipelineSchema);
