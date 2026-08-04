import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { PlanFeatureConfig } from "@studenthub/types";

export interface IPlan extends Document {
  name: string;
  code: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: PlanFeatureConfig;
  isActive: boolean;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    priceMonthly: { type: Number, required: true, min: 0 },
    priceAnnual: { type: Number, required: true, min: 0 },
    features: {
      maxListings: { type: Number, default: 1 },
      monthlyLeadLimit: { type: Number, default: 25 },
      featuredListingsIncluded: { type: Number, default: 0 },
      marketingCreditsIncluded: { type: Number, default: 0 },
      verifiedBadge: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      leadExport: { type: Boolean, default: false },
      homepageBanner: { type: Boolean, default: false },
      sponsoredListingsAllowed: { type: Boolean, default: false },
      customFeatures: { type: [String], default: [] },
    },
    isActive: { type: Boolean, default: true, index: true },
    isPopular: { type: Boolean, default: false },
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

export const PlanModel: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", planSchema);
