import mongoose, { Schema, type Document } from "mongoose";

export interface IModerationComment extends Document {
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: string;
  comment: string;
  isInternalOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const moderationCommentSchema = new Schema<IModerationComment>(
  {
    targetType: {
      type: String,
      required: [true, "Target type is required"],
      uppercase: true,
      trim: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
    },
    authorRole: {
      type: String,
      required: [true, "Author role is required"],
      lowercase: true,
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    isInternalOnly: {
      type: Boolean,
      default: false,
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

moderationCommentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const ModerationCommentModel = mongoose.model<IModerationComment>(
  "ModerationComment",
  moderationCommentSchema,
);
