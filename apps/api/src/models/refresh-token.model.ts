import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  isUsed: boolean;
  replacedByToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      required: true,
    },
    replacedByToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index to automatically prune expired refresh token records
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel: Model<IRefreshToken> =
  mongoose.models.RefreshToken || mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
