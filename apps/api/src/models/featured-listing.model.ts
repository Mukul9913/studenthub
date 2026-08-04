import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IFeaturedListing extends Document {
  listingId: mongoose.Types.ObjectId;
  targetType: "ACCOMMODATION" | "LIBRARY";
  ownerId: mongoose.Types.ObjectId;
  durationDays: number;
  placementScope: "SEARCH" | "CATEGORY" | "HOMEPAGE";
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const featuredListingSchema = new Schema<IFeaturedListing>(
  {
    listingId: { type: Schema.Types.ObjectId, required: true, index: true },
    targetType: { type: String, enum: ["ACCOMMODATION", "LIBRARY"], required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    durationDays: { type: Number, required: true, default: 7 },
    placementScope: {
      type: String,
      enum: ["SEARCH", "CATEGORY", "HOMEPAGE"],
      default: "SEARCH",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
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

export const FeaturedListingModel: Model<IFeaturedListing> =
  mongoose.models.FeaturedListing ||
  mongoose.model<IFeaturedListing>("FeaturedListing", featuredListingSchema);
