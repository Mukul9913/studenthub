import {
  FOOD_PREFERENCES,
  MEAL_PLAN_DURATIONS,
  MEAL_TYPES,
  MESS_PROVIDER_TYPES,
} from "@studenthub/constants";
import { z } from "zod";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const providerTypeEnum = z.enum(MESS_PROVIDER_TYPES);
const mealTypeEnum = z.enum(MEAL_TYPES);
const foodPreferenceEnum = z.enum(FOOD_PREFERENCES);
const mealPlanDurationEnum = z.enum(MEAL_PLAN_DURATIONS);

const locationSchema = z.object({
  address: z.string().min(1, "Address is required").trim(),
  city: z.string().trim().toLowerCase().optional(),
  state: z.string().min(1, "State is required").trim(),
  zipCode: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  formattedAddress: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  googlePlaceId: z.string().trim().optional(),
  coordinates: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

const contactSchema = z.object({
  phone: z.string().trim().optional(),
  email: z.string().email("Invalid email").trim().optional(),
  website: z.string().url("Invalid website URL").trim().optional(),
});

const pricingSchema = z.object({
  startingMealPrice: z.number().min(0, "Starting meal price cannot be negative"),
  currency: z.string().trim().optional().default("INR"),
});

const operatingHoursSchema = z.object({
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  openDays: z.array(z.string()).optional(),
  is24x7: z.boolean().optional(),
});

const menuItemSchema = z.object({
  name: z.string().min(1, "Menu item name is required").max(120).trim(),
  description: z.string().max(300).trim().optional(),
});

export const messDayMenuSchema = z.object({
  day: z.enum(WEEK_DAYS),
  breakfast: z.array(menuItemSchema).optional().default([]),
  lunch: z.array(menuItemSchema).optional().default([]),
  dinner: z.array(menuItemSchema).optional().default([]),
});

export const messMealPlanSchema = z.object({
  name: z.string().min(2, "Meal plan name is required").max(120).trim(),
  description: z.string().max(500).trim().optional(),
  duration: mealPlanDurationEnum,
  includedMeals: z.array(mealTypeEnum).min(1, "At least one meal must be included"),
  price: z.number().min(0, "Price cannot be negative"),
  deliveryIncluded: z.boolean().optional().default(false),
  pauseAllowed: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const createMessSchema = {
  body: z.object({
    name: z
      .string({ required_error: "Mess name is required" })
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name cannot exceed 120 characters")
      .trim(),
    description: z
      .string({ required_error: "Description is required" })
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters")
      .trim(),
    providerType: providerTypeEnum.optional().default("mess"),
    location: locationSchema,
    area: z.string().min(1, "Area is required").trim(),
    contact: contactSchema.optional(),
    foodPreferences: z.array(foodPreferenceEnum).optional().default([]),
    mealTypes: z.array(mealTypeEnum).optional().default([]),
    pricing: pricingSchema,
    deliveryAvailable: z.boolean().optional().default(false),
    pickupAvailable: z.boolean().optional().default(true),
    subscriptionAvailable: z.boolean().optional().default(true),
    deliveryRadiusKm: z.number().min(0).max(50).optional(),
    operatingHours: operatingHoursSchema.optional(),
    images: z.array(z.string().url()).optional().default([]),
    mealPlans: z.array(messMealPlanSchema).optional().default([]),
    weeklyMenu: z.array(messDayMenuSchema).optional().default([]),
    status: z.enum(["DRAFT", "PENDING_REVIEW"]).optional().default("PENDING_REVIEW"),
  }),
};

export const updateMessSchema = {
  body: z.object({
    name: z.string().min(3).max(120).trim().optional(),
    description: z.string().min(10).max(2000).trim().optional(),
    providerType: providerTypeEnum.optional(),
    location: locationSchema.partial().optional(),
    area: z.string().min(1).trim().optional(),
    contact: contactSchema.partial().optional(),
    foodPreferences: z.array(foodPreferenceEnum).optional(),
    mealTypes: z.array(mealTypeEnum).optional(),
    pricing: pricingSchema.partial().optional(),
    deliveryAvailable: z.boolean().optional(),
    pickupAvailable: z.boolean().optional(),
    subscriptionAvailable: z.boolean().optional(),
    deliveryRadiusKm: z.number().min(0).max(50).optional(),
    operatingHours: operatingHoursSchema.partial().optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(["DRAFT", "PENDING_REVIEW", "ARCHIVED"]).optional(),
  }),
};

export const replaceMessMenuSchema = {
  body: z.object({
    weeklyMenu: z.array(messDayMenuSchema).max(7, "Weekly menu cannot exceed 7 days"),
  }),
};

export const replaceMessPlansSchema = {
  body: z.object({
    mealPlans: z.array(messMealPlanSchema).max(20, "Cannot define more than 20 meal plans"),
  }),
};

const booleanQueryFlag = z
  .string()
  .transform((val) => val === "true")
  .optional();

export const listMessSchema = {
  query: z.object({
    search: z.string().trim().optional(),
    area: z.string().trim().optional(),
    providerType: providerTypeEnum.optional(),
    foodPreference: foodPreferenceEnum.optional(),
    mealType: mealTypeEnum.optional(),
    minPrice: z
      .string()
      .transform((val) => Number(val))
      .refine((n) => !isNaN(n) && n >= 0, "minPrice must be a positive number")
      .optional(),
    maxPrice: z
      .string()
      .transform((val) => Number(val))
      .refine((n) => !isNaN(n) && n >= 0, "maxPrice must be a positive number")
      .optional(),
    delivery: booleanQueryFlag,
    pickup: booleanQueryFlag,
    subscription: booleanQueryFlag,
    page: z
      .string()
      .transform((val) => Number(val))
      .refine((n) => !isNaN(n) && n > 0, "page must be greater than 0")
      .optional()
      .default("1"),
    limit: z
      .string()
      .transform((val) => Number(val))
      .refine((n) => !isNaN(n) && n > 0 && n <= 100, "limit must be between 1 and 100")
      .optional()
      .default("10"),
    sortBy: z
      .enum(["recommended", "price_asc", "price_desc", "rating", "newest"])
      .optional()
      .default("recommended"),
  }),
};
