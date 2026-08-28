import { z } from "zod";

const nearbyInstitutionSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  distanceKm: z.number().min(0, "Distance cannot be negative"),
});

const coordinatesSchema = z.object({
  type: z.literal("Point"),
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must be a [longitude, latitude] pair")
    .refine(
      (coords) =>
        coords[0] !== undefined &&
        coords[0] >= -180 &&
        coords[0] <= 180 &&
        coords[1] !== undefined &&
        coords[1] >= -90 &&
        coords[1] <= 90,
      "Coordinates must be valid values: longitude [-180, 180], latitude [-90, 90]",
    ),
});

const locationSchema = z.object({
  address: z.string().min(1, "Address is required").trim(),
  city: z.string().min(1, "City is required").trim().toLowerCase(),
  state: z.string().min(1, "State is required").trim(),
  zipCode: z.string().min(1, "Zip code is required").trim(),
  pincode: z.string().trim().optional(),
  formattedAddress: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  googlePlaceId: z.string().trim().optional(),
  coordinates: coordinatesSchema,
});

const foodSchema = z.object({
  provided: z.boolean().default(false),
  mealsIncluded: z
    .array(z.enum(["breakfast", "lunch", "dinner", "tea_snacks"]))
    .optional()
    .default([]),
  details: z.string().trim().optional(),
  monthlyCharges: z.number().min(0).optional(),
});

const roomInputSchema = z.object({
  roomType: z.enum(["private", "shared"]),
  sharingCount: z.number().min(1, "Sharing count must be at least 1"),
  rent: z.number().min(0, "Rent cannot be negative"),
  deposit: z.number().min(0, "Deposit cannot be negative"),
  genderPreference: z.enum(["boys", "girls", "unisex"]),
  amenities: z.array(z.string()).optional().default([]),
  totalBeds: z.number().min(1, "Total beds must be at least 1"),
  availableBeds: z.number().min(0, "Available beds cannot be negative"),
  availableFrom: z.string().datetime("Available from must be a valid ISO datetime").optional(),
  isAvailable: z.boolean().optional().default(true),
});

export const createAccommodationSchema = {
  body: z
    .object({
      title: z
        .string({ required_error: "Title is required" })
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title cannot exceed 100 characters")
        .trim(),
      description: z
        .string({ required_error: "Description is required" })
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description cannot exceed 2000 characters")
        .trim(),
      propertyType: z.enum(["pg", "hostel", "flat", "house"], {
        required_error: "Property type is required",
      }),
      location: locationSchema,
      area: z.string({ required_error: "Area is required" }).min(1, "Area is required").trim(),
      nearbyColleges: z.array(nearbyInstitutionSchema).optional().default([]),
      nearbyCompanies: z.array(nearbyInstitutionSchema).optional().default([]),
      amenities: z.array(z.string()).optional().default([]),
      food: foodSchema.optional().default({ provided: false, mealsIncluded: [] }),
      images: z.array(z.string().url()).optional().default([]),
      videos: z.array(z.string().url()).optional().default([]),
      status: z.enum(["draft", "pending_review"]).optional().default("pending_review"),
      rooms: z.array(roomInputSchema).optional().default([]),
    })
    .strict()
    .refine(
      (data) => {
        // Validation check for room inputs nested validation
        if (data.rooms) {
          for (const rm of data.rooms) {
            if (rm.roomType === "private" && rm.sharingCount !== 1) {
              return false;
            }
            if (rm.availableBeds > rm.totalBeds) {
              return false;
            }
          }
        }
        return true;
      },
      {
        message:
          "Private rooms must have sharingCount of 1, and availableBeds cannot exceed totalBeds",
        path: ["rooms"],
      },
    ),
};

export const updateAccommodationSchema = {
  body: z
    .object({
      title: z.string().min(3).max(100).trim().optional(),
      description: z.string().min(10).max(2000).trim().optional(),
      propertyType: z.enum(["pg", "hostel", "flat", "house"]).optional(),
      location: locationSchema.partial().optional(),
      area: z.string().min(1).trim().optional(),
      nearbyColleges: z.array(nearbyInstitutionSchema).optional(),
      nearbyCompanies: z.array(nearbyInstitutionSchema).optional(),
      amenities: z.array(z.string()).optional(),
      food: foodSchema.partial().optional(),
      images: z.array(z.string().url()).optional(),
      videos: z.array(z.string().url()).optional(),
      status: z.enum(["draft", "pending_review", "archived"]).optional(),
    })
    .strict(),
};

export const listAccommodationsSchema = {
  query: z
    .object({
      area: z.string().trim().optional(),
      propertyType: z.enum(["pg", "hostel", "flat", "house"]).optional(),
      genderPreference: z.enum(["boys", "girls", "unisex"]).optional(),
      minRent: z
        .string()
        .transform((val) => Number(val))
        .refine((n) => !isNaN(n) && n >= 0, "minRent must be a positive number")
        .optional(),
      maxRent: z
        .string()
        .transform((val) => Number(val))
        .refine((n) => !isNaN(n) && n >= 0, "maxRent must be a positive number")
        .optional(),
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
        .enum(["recommended", "rent-asc", "rent-desc", "recent"])
        .optional()
        .default("recommended"),
    })
    .refine(
      (query) => {
        if (
          query.minRent !== undefined &&
          query.maxRent !== undefined &&
          query.minRent > query.maxRent
        ) {
          return false;
        }
        return true;
      },
      {
        message: "minRent cannot be greater than maxRent",
        path: ["minRent"],
      },
    ),
};
