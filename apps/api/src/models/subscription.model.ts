import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { SubscriptionStatus, BillingCycle } from "@studenthub/types";

export interface ISubscription extends Document {
  ownerId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  pricePaid: number;
  paymentGateway?: string;
  transactionId?: string;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true, index: true },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED", "TRIALING", "PENDING"],
      default: "ACTIVE",
      index: true,
    },
    billingCycle: { type: String, enum: ["MONTHLY", "ANNUAL"], default: "MONTHLY" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
    pricePaid: { type: Number, default: 0 },
    paymentGateway: { type: String, default: "DIRECT" },
    transactionId: { type: String },
    invoiceUrl: { type: String },
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

subscriptionSchema.index({ ownerId: 1, status: 1 });

export const SubscriptionModel: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", subscriptionSchema);
