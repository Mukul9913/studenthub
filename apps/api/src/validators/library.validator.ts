import { z } from "zod";

const locationSchema = z.object({
  address: z.string().min(1, "Address is required").trim(),
  city: z.string().min(1, "City is required").trim().toLowerCase(),
  state: z.string().min(1, "State is required").trim(),
  zipCode: z.string().min(1, "Zip code is required").trim(),
});

const contactSchema = z.object({
  phone: z.string().trim().optional(),
  email: z.string().email("Invalid email").trim().optional(),
  website: z.string().url("Invalid website URL").trim().optional(),
});

const pricingSchema = z.object({
  monthlyFee: z.number().min(0, "Monthly fee cannot be negative"),
  weeklyFee: z.number().min(0).optional(),
  dailyFee: z.number().min(0).optional(),
  registrationFee: z.number().min(0).optional(),
});

const operatingHoursSchema = z.object({
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  openDays: z.array(z.string()).optional(),
  is24x7: z.boolean().optional(),
});

export const createLibrarySchema = {
  body: z.object({
    name: z
      .string({ required_error: "Library name is required" })
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name cannot exceed 120 characters")
      .trim(),
    description: z
      .string({ required_error: "Description is required" })
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters")
      .trim(),
    location: locationSchema,
    area: z.string().min(1, "Area is required").trim(),
    contact: contactSchema.optional(),
    pricing: pricingSchema,
    facilities: z.array(z.string()).optional().default([]),
    operatingHours: operatingHoursSchema.optional(),
    seatCapacity: z.number().min(1).optional().default(50),
    availableSeats: z.number().min(0).optional().default(10),
    images: z.array(z.string().url()).optional().default([]),
    status: z.enum(["draft", "pending_review"]).optional().default("pending_review"),
  }),
};

export const updateLibrarySchema = {
  body: z.object({
    name: z.string().min(3).max(120).trim().optional(),
    description: z.string().min(10).max(2000).trim().optional(),
    location: locationSchema.partial().optional(),
    area: z.string().min(1).trim().optional(),
    contact: contactSchema.partial().optional(),
    pricing: pricingSchema.partial().optional(),
    facilities: z.array(z.string()).optional(),
    operatingHours: operatingHoursSchema.partial().optional(),
    seatCapacity: z.number().min(1).optional(),
    availableSeats: z.number().min(0).optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(["draft", "pending_review", "archived"]).optional(),
  }),
};

export const listLibrariesSchema = {
  query: z.object({
    area: z.string().trim().optional(),
    search: z.string().trim().optional(),
    minFee: z
      .string()
      .transform((val) => Number(val))
      .refine((n) => !isNaN(n) && n >= 0, "minFee must be a positive number")
      .optional(),
    maxFee: z
      .string()
      .transform((val) => Number(val))
      .refine((n) => !isNaN(n) && n >= 0, "maxFee must be a positive number")
      .optional(),
    ac: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    wifi: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    powerBackup: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    is24x7: z
      .string()
      .transform((val) => val === "true")
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
      .enum(["recommended", "fee-asc", "fee-desc", "rating"])
      .optional()
      .default("recommended"),
  }),
};
