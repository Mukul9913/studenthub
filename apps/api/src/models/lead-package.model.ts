import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ILeadPackage extends Document {
  title: string;
  creditsCount: number;
  price: number;
  discountPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadPackageSchema = new Schema<ILeadPackage>(
  {
    title: { type: String, required: true, trim: true },
    creditsCount: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
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

export const LeadPackageModel: Model<ILeadPackage> =
  mongoose.models.LeadPackage || mongoose.model<ILeadPackage>("LeadPackage", leadPackageSchema);
