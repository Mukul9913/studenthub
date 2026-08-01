import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";
import type { PropertyType } from "@studenthub/types";

export interface IProperty extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  propertyType: PropertyType;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  area: string;
  nearbyColleges: { name: string; distanceKm: number }[];
  nearbyCompanies: { name: string; distanceKm: number }[];
  amenities: string[];
  food: {
    provided: boolean;
    mealsIncluded: ("breakfast" | "lunch" | "dinner" | "tea_snacks")[];
    details?: string;
    monthlyCharges?: number;
  };
  images: string[];
  videos: string[];
  isVerified: boolean;
  status: "draft" | "pending_review" | "published" | "rejected" | "archived";
  rejectionReason?: string;
  avgRating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    propertyType: {
      type: String,
      enum: {
        values: ["pg", "hostel", "flat", "house"],
        message: "{VALUE} is not a valid property type",
      },
      required: [true, "Property type is required"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        lowercase: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: [true, "Coordinates are required"],
          validate: {
            validator: (val: number[]) => {
              if (!val || val.length !== 2) return false;
              const lng = val[0];
              const lat = val[1];
              if (lng === undefined || lat === undefined) return false;
              return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
            },
            message: "Coordinates must be a valid [longitude, latitude] pair",
          },
        },
      },
    },
    area: {
      type: String,
      required: [true, "Area/Locality is required"],
      trim: true,
    },
    nearbyColleges: [
      {
        name: { type: String, required: true, trim: true },
        distanceKm: { type: Number, required: true, min: 0 },
      },
    ],
    nearbyCompanies: [
      {
        name: { type: String, required: true, trim: true },
        distanceKm: { type: Number, required: true, min: 0 },
      },
    ],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    food: {
      provided: {
        type: Boolean,
        default: false,
      },
      mealsIncluded: [
        {
          type: String,
          enum: ["breakfast", "lunch", "dinner", "tea_snacks"],
        },
      ],
      details: {
        type: String,
        trim: true,
      },
      monthlyCharges: {
        type: Number,
        min: [0, "Monthly charges cannot be negative"],
      },
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    videos: [
      {
        type: String,
        trim: true,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "rejected", "archived"],
      default: "pending_review",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
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
propertySchema.index({ ownerId: 1 });
propertySchema.index({ "location.coordinates": "2dsphere" });
propertySchema.index({ "location.city": 1, area: 1 });
propertySchema.index({ title: "text", description: "text", area: "text" });

export const PropertyModel = mongoose.model<IProperty>("Property", propertySchema);
