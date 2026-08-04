import mongoose, { Schema, type Document } from "mongoose";

export interface IOwnerScore extends Document {
  ownerId: mongoose.Types.ObjectId;
  score: number; // 0-100 overall performance score
  profileCompletionScore: number; // 0-100
  verifiedStatusScore: number; // 0-100
  responseTimeScore: number; // 0-100
  reviewRatingScore: number; // 0-100
  leadConversionScore: number; // 0-100
  listingQualityScore: number; // 0-100
  spamPenaltyScore: number; // 0-100
  totalReviewsCount: number;
  averageRating: number;
  leadAcceptanceRate: number;
  avgResponseTimeMinutes: number;
  yearsOnPlatform: number;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerScoreSchema = new Schema<IOwnerScore>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true,
    },
    score: { type: Number, default: 70, min: 0, max: 100, index: true },
    profileCompletionScore: { type: Number, default: 80, min: 0, max: 100 },
    verifiedStatusScore: { type: Number, default: 0, min: 0, max: 100 },
    responseTimeScore: { type: Number, default: 75, min: 0, max: 100 },
    reviewRatingScore: { type: Number, default: 80, min: 0, max: 100 },
    leadConversionScore: { type: Number, default: 70, min: 0, max: 100 },
    listingQualityScore: { type: Number, default: 85, min: 0, max: 100 },
    spamPenaltyScore: { type: Number, default: 0, min: 0, max: 100 },
    totalReviewsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    leadAcceptanceRate: { type: Number, default: 85 },
    avgResponseTimeMinutes: { type: Number, default: 30 },
    yearsOnPlatform: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export const OwnerScoreModel = mongoose.model<IOwnerScore>("OwnerScore", OwnerScoreSchema);
