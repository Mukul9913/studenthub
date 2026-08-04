import mongoose, { Schema, type Document } from "mongoose";

export interface ISearchAnalytics extends Document {
  query: string;
  normalizedQuery: string;
  targetType: string;
  city?: string;
  area?: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  hasResults: boolean;
  userId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  conversionAction?: string;
  createdAt: Date;
}

const searchAnalyticsSchema = new Schema<ISearchAnalytics>(
  {
    query: {
      type: String,
      trim: true,
      default: "",
    },
    normalizedQuery: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      default: "",
    },
    targetType: {
      type: String,
      default: "ALL",
      uppercase: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    area: {
      type: String,
      trim: true,
      index: true,
    },
    filters: {
      type: Schema.Types.Mixed,
    },
    resultCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    hasResults: {
      type: Boolean,
      default: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    conversionAction: {
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

searchAnalyticsSchema.index({ normalizedQuery: 1, createdAt: -1 });
searchAnalyticsSchema.index({ createdAt: -1 });
searchAnalyticsSchema.index({ hasResults: 1, createdAt: -1 });

export const SearchAnalyticsModel = mongoose.model<ISearchAnalytics>(
  "SearchAnalytics",
  searchAnalyticsSchema,
);
