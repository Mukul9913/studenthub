import mongoose, { Schema, type Document } from "mongoose";

export interface IEnquiry extends Document {
  userId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  targetType: "ACCOMMODATION" | "LIBRARY" | "MESS";
  targetId: mongoose.Types.ObjectId;
  message: string;
  status: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "CONVERTED" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    targetType: {
      type: String,
      enum: ["ACCOMMODATION", "LIBRARY", "MESS"],
      required: [true, "Target type is required"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"],
      default: "NEW",
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
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

enquirySchema.index({ userId: 1 });
enquirySchema.index({ ownerId: 1 });
enquirySchema.index({ targetType: 1, targetId: 1 });
enquirySchema.index({ userId: 1, targetType: 1, targetId: 1, status: 1 });

export const EnquiryModel = mongoose.model<IEnquiry>("Enquiry", enquirySchema);
