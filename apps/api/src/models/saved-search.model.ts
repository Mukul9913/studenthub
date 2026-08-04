import mongoose, { Schema, type Document } from "mongoose";

export interface ISavedSearch extends Document {
  userId: mongoose.Types.ObjectId;
  query?: string;
  filters: Record<string, unknown>;
  targetType: string;
  savedAt: Date;
  hitCount: number;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

const savedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    query: { type: String, trim: true, maxlength: 200 },
    filters: { type: Schema.Types.Mixed, default: {} },
    targetType: { type: String, required: true, trim: true },
    savedAt: { type: Date, default: Date.now },
    hitCount: { type: Number, default: 1, min: 0 },
    label: { type: String, trim: true, maxlength: 100 },
  },
  {
    timestamps: true,
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

savedSearchSchema.index({ userId: 1, targetType: 1 });
savedSearchSchema.index({ userId: 1, savedAt: -1 });

export const SavedSearchModel = mongoose.model<ISavedSearch>("SavedSearch", savedSearchSchema);
