import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { MarketingOrderStatus } from "@studenthub/types";

export interface IMarketingOrder extends Document {
  ownerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  status: MarketingOrderStatus;
  notes?: string;
  amountPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const marketingOrderSchema = new Schema<IMarketingOrder>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "MarketingService",
      required: true,
      index: true,
    },
    listingId: { type: Schema.Types.ObjectId },
    status: {
      type: String,
      enum: ["REQUESTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "REQUESTED",
      index: true,
    },
    notes: { type: String },
    amountPaid: { type: Number, default: 0 },
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

export const MarketingOrderModel: Model<IMarketingOrder> =
  mongoose.models.MarketingOrder ||
  mongoose.model<IMarketingOrder>("MarketingOrder", marketingOrderSchema);
