import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { MarketingServiceCategory } from "@studenthub/types";

export interface IMarketingService extends Document {
  title: string;
  code: string;
  category: MarketingServiceCategory;
  description: string;
  price: number;
  deliverables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const marketingServiceSchema = new Schema<IMarketingService>(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: {
      type: String,
      enum: ["PHOTOSHOOT", "SOCIAL_PROMO", "LOCAL_SEO", "BANNER_AD", "FEATURED_CAMPAIGN"],
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    deliverables: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
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

export const MarketingServiceModel: Model<IMarketingService> =
  mongoose.models.MarketingService ||
  mongoose.model<IMarketingService>("MarketingService", marketingServiceSchema);
