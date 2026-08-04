import mongoose, { Schema, type Document } from "mongoose";

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  targetType: string;
  filters?: Record<string, unknown>;
  isSaved: boolean;
  savedName?: string;
  notifyNewListings: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    query: {
      type: String,
      trim: true,
      default: "",
    },
    targetType: {
      type: String,
      default: "ALL",
      uppercase: true,
      trim: true,
    },
    filters: {
      type: Schema.Types.Mixed,
    },
    isSaved: {
      type: Boolean,
      default: false,
      index: true,
    },
    savedName: {
      type: String,
      trim: true,
    },
    notifyNewListings: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ userId: 1, isSaved: 1 });

export const SearchHistoryModel = mongoose.model<ISearchHistory>(
  "SearchHistory",
  searchHistorySchema,
);
