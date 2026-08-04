import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUsage extends Document {
  ownerId: mongoose.Types.ObjectId;
  activeListingsCount: number;
  totalLeadsReceived: number;
  monthlyLeadsReceived: number;
  featuredListingsUsed: number;
  marketingCreditsUsed: number;
  leadCreditsBalance: number;
  lastResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const usageSchema = new Schema<IUsage>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    activeListingsCount: { type: Number, default: 0, min: 0 },
    totalLeadsReceived: { type: Number, default: 0, min: 0 },
    monthlyLeadsReceived: { type: Number, default: 0, min: 0 },
    featuredListingsUsed: { type: Number, default: 0, min: 0 },
    marketingCreditsUsed: { type: Number, default: 0, min: 0 },
    leadCreditsBalance: { type: Number, default: 0, min: 0 },
    lastResetDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown> & { _id?: unknown; __v?: unknown }) => {
        if (ret._id) ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const UsageModel: Model<IUsage> =
  mongoose.models.Usage || mongoose.model<IUsage>("Usage", usageSchema);
