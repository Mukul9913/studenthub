import mongoose, { Schema, type Document } from "mongoose";
import { RECOMMENDATION_REASON, RECOMMENDATION_ALGORITHM } from "@studenthub/constants";
import type {
  RecommendationReasonConstant,
  RecommendationAlgorithmConstant,
} from "@studenthub/constants";

export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  score: number; // 0-100 weighted relevance score
  reasons: RecommendationReasonConstant[];
  position: number;
  isViewed: boolean;
  isClicked: boolean;
  isSaved: boolean;
  generatedAt: Date;
  expiresAt: Date;
  // ML-ready metadata — pluggable for future model swaps
  algorithmType: RecommendationAlgorithmConstant;
  modelVersion: string;
  featureVector: number[];
  createdAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, required: true, trim: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    reasons: [{ type: String, enum: RECOMMENDATION_REASON }],
    position: { type: Number, default: 0 },
    isViewed: { type: Boolean, default: false },
    isClicked: { type: Boolean, default: false },
    isSaved: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
    },
    algorithmType: {
      type: String,
      enum: RECOMMENDATION_ALGORITHM,
      default: "RULE_BASED",
    },
    modelVersion: { type: String, default: "v1.0.0" },
    featureVector: [{ type: Number }],
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

// TTL: auto-delete expired recommendations after 24h
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
recommendationSchema.index({ userId: 1, targetType: 1, score: -1 });
recommendationSchema.index({ userId: 1, algorithmType: 1, generatedAt: -1 });

export const RecommendationModel = mongoose.model<IRecommendation>(
  "Recommendation",
  recommendationSchema,
);
