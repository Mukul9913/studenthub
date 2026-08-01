/**
 * Frontend validation schemas mirroring the backend accommodation contract.
 *
 * Backend source of truth:
 *   apps/api/src/validators/accommodation.validator.ts
 *   apps/api/src/models/property.model.ts
 *   apps/api/src/models/room.model.ts
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Enums — MUST match backend exactly                                 */
/* ------------------------------------------------------------------ */

export const PROPERTY_TYPES = ["pg", "hostel", "flat", "house"] as const;
export type BackendPropertyType = (typeof PROPERTY_TYPES)[number];

export const ROOM_TYPES = ["private", "shared"] as const;
export type BackendRoomType = (typeof ROOM_TYPES)[number];

export const GENDER_PREFERENCES = ["boys", "girls", "unisex"] as const;
export type BackendGenderPreference = (typeof GENDER_PREFERENCES)[number];

export const MEAL_OPTIONS = ["breakfast", "lunch", "dinner", "tea_snacks"] as const;

/* ------------------------------------------------------------------ */
/*  Display labels for backend enum values                             */
/* ------------------------------------------------------------------ */

export const PROPERTY_TYPE_LABELS: Record<BackendPropertyType, string> = {
  pg: "PG",
  hostel: "Hostel",
  flat: "Flat",
  house: "House",
};

export const GENDER_LABELS: Record<BackendGenderPreference, string> = {
  boys: "Boys",
  girls: "Girls",
  unisex: "Any / Co-ed",
};

export const ROOM_TYPE_LABELS: Record<BackendRoomType, string> = {
  private: "Private Room",
  shared: "Shared Room",
};

/* ------------------------------------------------------------------ */
/*  Sub-schemas                                                        */
/* ------------------------------------------------------------------ */

const coordinatesSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2, "Coordinates must be [longitude, latitude]"),
});

const locationSchema = z.object({
  address: z.string().min(1, "Address is required.").trim(),
  city: z.string().min(1, "City is required.").trim(),
  state: z.string().min(1, "State is required.").trim(),
  zipCode: z.string().min(1, "Zip/Pin code is required.").trim(),
  coordinates: coordinatesSchema,
});

const foodSchema = z.object({
  provided: z.boolean().default(false),
  mealsIncluded: z.array(z.enum(MEAL_OPTIONS)).optional().default([]),
  details: z.string().trim().optional(),
  monthlyCharges: z.number().min(0, "Charges cannot be negative.").optional(),
});

const roomInputSchema = z
  .object({
    roomType: z.enum(ROOM_TYPES, {
      required_error: "Room type is required.",
    }),
    sharingCount: z.number().min(1, "Sharing count must be at least 1."),
    rent: z.number().min(0, "Rent cannot be negative."),
    deposit: z.number().min(0, "Deposit cannot be negative."),
    genderPreference: z.enum(GENDER_PREFERENCES, {
      required_error: "Gender preference is required.",
    }),
    amenities: z.array(z.string()).optional().default([]),
    totalBeds: z.number().min(1, "Total beds must be at least 1."),
    availableBeds: z.number().min(0, "Available beds cannot be negative."),
    availableFrom: z.string().datetime().optional(),
    isAvailable: z.boolean().optional().default(true),
  })
  .refine((rm) => rm.availableBeds <= rm.totalBeds, {
    message: "Available beds cannot exceed total beds.",
    path: ["availableBeds"],
  })
  .refine((rm) => !(rm.roomType === "private" && rm.sharingCount !== 1), {
    message: "Private rooms must have sharing count of 1.",
    path: ["sharingCount"],
  });

/* ------------------------------------------------------------------ */
/*  Main schemas                                                       */
/* ------------------------------------------------------------------ */

export const createAccommodationSchema = z.object({
  title: z
    .string({ required_error: "Property title is required." })
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title cannot exceed 100 characters.")
    .trim(),
  description: z
    .string({ required_error: "Description is required." })
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description cannot exceed 2000 characters.")
    .trim(),
  propertyType: z.enum(PROPERTY_TYPES, {
    required_error: "Property type is required.",
  }),
  location: locationSchema,
  area: z.string().min(1, "Area is required.").trim(),
  nearbyColleges: z
    .array(
      z.object({
        name: z.string().min(1).trim(),
        distanceKm: z.number().min(0),
      }),
    )
    .optional()
    .default([]),
  nearbyCompanies: z
    .array(
      z.object({
        name: z.string().min(1).trim(),
        distanceKm: z.number().min(0),
      }),
    )
    .optional()
    .default([]),
  amenities: z.array(z.string()).optional().default([]),
  food: foodSchema.optional().default({ provided: false, mealsIncluded: [] }),
  images: z.array(z.string().url()).optional().default([]),
  videos: z.array(z.string().url()).optional().default([]),
  rooms: z.array(roomInputSchema).optional().default([]),
});

export type CreateAccommodationPayload = z.infer<typeof createAccommodationSchema>;
export type RoomInput = z.infer<typeof roomInputSchema>;
