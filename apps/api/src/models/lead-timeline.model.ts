import mongoose, { Schema, type Document } from "mongoose";

export interface ILeadTimeline extends Document {
  leadId: mongoose.Types.ObjectId;
  action: string;
  actorId?: mongoose.Types.ObjectId;
  actorRole?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const leadTimelineSchema = new Schema<ILeadTimeline>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead ID is required"],
    },
    action: {
      type: String,
      required: [true, "Action description is required"],
      trim: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    actorRole: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    metadata: {
      type: Schema.Types.Mixed,
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
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

leadTimelineSchema.index({ leadId: 1, createdAt: 1 });

export const LeadTimelineModel = mongoose.model<ILeadTimeline>("LeadTimeline", leadTimelineSchema);
