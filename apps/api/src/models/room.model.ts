import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";
import type { RoomType, GenderPreference } from "@studenthub/types";

export interface IRoom extends Document {
  propertyId: mongoose.Types.ObjectId;
  roomType: RoomType;
  sharingCount: number;
  rent: number;
  deposit: number;
  genderPreference: GenderPreference;
  amenities: string[];
  totalBeds: number;
  availableBeds: number;
  availableFrom: Date;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
    },
    roomType: {
      type: String,
      enum: {
        values: ["private", "shared"],
        message: "{VALUE} is not a valid room type",
      },
      required: [true, "Room type is required"],
    },
    sharingCount: {
      type: Number,
      required: [true, "Sharing count is required"],
      min: [1, "Sharing count must be at least 1"],
      validate: {
        validator: function (this: IRoom, val: number) {
          // If room type is private, sharing count must be exactly 1
          if (this.roomType === "private" && val !== 1) {
            return false;
          }
          return true;
        },
        message: "Private rooms must have a sharing count of exactly 1",
      },
    },
    rent: {
      type: Number,
      required: [true, "Rent amount is required"],
      min: [0, "Rent cannot be negative"],
    },
    deposit: {
      type: Number,
      required: [true, "Deposit amount is required"],
      min: [0, "Deposit cannot be negative"],
    },
    genderPreference: {
      type: String,
      enum: {
        values: ["boys", "girls", "unisex"],
        message: "{VALUE} is not a valid gender preference",
      },
      required: [true, "Gender preference is required"],
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    totalBeds: {
      type: Number,
      required: [true, "Total beds count is required"],
      min: [1, "Total beds must be at least 1"],
    },
    availableBeds: {
      type: Number,
      required: [true, "Available beds count is required"],
      min: [0, "Available beds cannot be negative"],
      validate: {
        validator: function (this: IRoom, val: number) {
          return val <= this.totalBeds;
        },
        message: "Available beds cannot exceed total beds",
      },
    },
    availableFrom: {
      type: Date,
      required: [true, "Available from date is required"],
      default: () => new Date(),
    },
    isAvailable: {
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
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  },
);

// Indexes
roomSchema.index({ propertyId: 1 });
roomSchema.index({ rent: 1, genderPreference: 1 });
roomSchema.index({ isAvailable: 1, roomType: 1 });

export const RoomModel = mongoose.model<IRoom>("Room", roomSchema);
