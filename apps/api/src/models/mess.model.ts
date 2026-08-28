import mongoose, { Schema, type Document } from "mongoose";
import {
  FOOD_PREFERENCES,
  MEAL_PLAN_DURATIONS,
  MEAL_TYPES,
  MESS_PROVIDER_TYPES,
} from "@studenthub/constants";

export interface IMessMenuItem {
  name: string;
  description?: string;
}

export interface IMessDayMenu {
  day: string;
  breakfast: IMessMenuItem[];
  lunch: IMessMenuItem[];
  dinner: IMessMenuItem[];
}

export interface IMessMealPlan {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  duration: string;
  includedMeals: string[];
  price: number;
  deliveryIncluded: boolean;
  pauseAllowed: boolean;
  isActive: boolean;
}

export interface IMess extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  providerType: string;
  location: {
    formattedAddress?: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    pincode?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
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
  foodPreferences: string[];
  mealTypes: string[];
  pricing: {
    startingMealPrice: number;
    currency: string;
  };
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  subscriptionAvailable: boolean;
  deliveryRadiusKm?: number;
  operatingHours: {
    openingTime: string;
    closingTime: string;
    openDays: string[];
    is24x7: boolean;
  };
  images: string[];
  mealPlans: IMessMealPlan[];
  weeklyMenu: IMessDayMenu[];
  isVerified: boolean;
  verificationStatus?: string;
  verificationDate?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  status: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  assignedModeratorId?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  moderationNotes?: string;
  avgRating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const menuItemSchema = new Schema<IMessMenuItem>(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
      maxlength: [120, "Menu item name cannot exceed 120 characters"],
    },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const dayMenuSchema = new Schema<IMessDayMenu>(
  {
    day: {
      type: String,
      required: [true, "Day is required"],
      enum: WEEK_DAYS,
    },
    breakfast: { type: [menuItemSchema], default: [] },
    lunch: { type: [menuItemSchema], default: [] },
    dinner: { type: [menuItemSchema], default: [] },
  },
  { _id: false },
);

const mealPlanSchema = new Schema<IMessMealPlan>({
  name: {
    type: String,
    required: [true, "Meal plan name is required"],
    trim: true,
    maxlength: [120, "Meal plan name cannot exceed 120 characters"],
  },
  description: { type: String, trim: true, maxlength: 500 },
  duration: {
    type: String,
    required: [true, "Meal plan duration is required"],
    enum: MEAL_PLAN_DURATIONS,
    default: "monthly",
  },
  includedMeals: [{ type: String, enum: MEAL_TYPES }],
  price: {
    type: Number,
    required: [true, "Meal plan price is required"],
    min: [0, "Price cannot be negative"],
  },
  deliveryIncluded: { type: Boolean, default: false },
  pauseAllowed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
});

const messSchema = new Schema<IMess>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    name: {
      type: String,
      required: [true, "Mess name is required"],
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
    providerType: {
      type: String,
      required: [true, "Provider type is required"],
      enum: MESS_PROVIDER_TYPES,
      default: "mess",
    },
    location: {
      formattedAddress: { type: String, trim: true },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      country: { type: String, default: "India" },
      pincode: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
      googlePlaceId: { type: String, trim: true },
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
    foodPreferences: [{ type: String, enum: FOOD_PREFERENCES }],
    mealTypes: [{ type: String, enum: MEAL_TYPES }],
    pricing: {
      startingMealPrice: {
        type: Number,
        required: [true, "Starting meal price is required"],
        min: [0, "Starting meal price cannot be negative"],
      },
      currency: { type: String, default: "INR", trim: true },
    },
    deliveryAvailable: { type: Boolean, default: false },
    pickupAvailable: { type: Boolean, default: true },
    subscriptionAvailable: { type: Boolean, default: true },
    deliveryRadiusKm: { type: Number, min: 0 },
    operatingHours: {
      openingTime: { type: String, default: "07:00" },
      closingTime: { type: String, default: "22:00" },
      openDays: [{ type: String }],
      is24x7: { type: Boolean, default: false },
    },
    images: [{ type: String, trim: true }],
    mealPlans: { type: [mealPlanSchema], default: [] },
    weeklyMenu: { type: [dayMenuSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, trim: true },
    verificationDate: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      default: "APPROVED",
      uppercase: true,
    },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedModeratorId: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String, trim: true },
    moderationNotes: { type: String, trim: true },
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

messSchema.index({ slug: 1 }, { unique: true });
messSchema.index({ ownerId: 1 });
messSchema.index({ area: 1 });
messSchema.index({ status: 1 });
messSchema.index({ providerType: 1 });
messSchema.index({ foodPreferences: 1 });
messSchema.index({ mealTypes: 1 });
messSchema.index({ "location.coordinates": "2dsphere" });
messSchema.index({ "location.city": 1, area: 1, status: 1 });
messSchema.index({ name: "text", description: "text", area: "text" });

export const MessModel = mongoose.model<IMess>("Mess", messSchema);
