import mongoose, { Schema, type Document } from "mongoose";

export interface IBadge extends Document {
  code: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "shield-check" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const BadgeModel = mongoose.model<IBadge>("Badge", BadgeSchema);
