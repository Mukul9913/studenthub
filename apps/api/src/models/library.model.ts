import mongoose, { Schema, type Document } from "mongoose";

export interface ILibrary extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
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
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  pricing: {
    monthlyFee: number;
    weeklyFee?: number;
    dailyFee?: number;
    registrationFee?: number;
  };
  facilities: string[];
  operatingHours: {
    openingTime: string;
    closingTime: string;
    openDays: string[];
    is24x7: boolean;
  };
  seatCapacity: number;
  availableSeats: number;
  images: string[];
  isVerified: boolean;
  status: "draft" | "pending_review" | "published" | "rejected" | "archived";
  rejectionReason?: string;
  avgRating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const librarySchema = new Schema<ILibrary>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    name: {
      type: String,
      required: [true, "Library name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
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
        },
      },
    },
    area: {
      type: String,
      required: [true, "Area/Locality is required"],
      trim: true,
    },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true },
    },
    pricing: {
      monthlyFee: {
        type: Number,
        required: [true, "Monthly fee is required"],
        min: [0, "Monthly fee cannot be negative"],
      },
      weeklyFee: { type: Number, min: 0 },
      dailyFee: { type: Number, min: 0 },
      registrationFee: { type: Number, min: 0 },
    },
    facilities: [{ type: String, trim: true }],
    operatingHours: {
      openingTime: { type: String, default: "06:00" },
      closingTime: { type: String, default: "23:00" },
      openDays: [{ type: String }],
      is24x7: { type: Boolean, default: false },
    },
    seatCapacity: { type: Number, default: 50, min: 1 },
    availableSeats: { type: Number, default: 10, min: 0 },
    images: [{ type: String, trim: true }],
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "rejected", "archived"],
      default: "published",
    },
    rejectionReason: { type: String, trim: true },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
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

librarySchema.index({ ownerId: 1 });
librarySchema.index({ slug: 1 }, { unique: true });
librarySchema.index({ "location.coordinates": "2dsphere" });
librarySchema.index({ "location.city": 1, area: 1 });
librarySchema.index({ name: "text", description: "text", area: "text" });

export const LibraryModel = mongoose.model<ILibrary>("Library", librarySchema);
