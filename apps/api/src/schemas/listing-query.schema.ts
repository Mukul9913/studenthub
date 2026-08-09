import { z } from "zod";

export const ListingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(50).optional(),
  area: z.string().trim().max(50).optional(),
  propertyType: z.enum(["pg", "hostel", "flat", "house", "all"]).optional(),
  genderPreference: z.enum(["boys", "girls", "coed", "any", "all"]).optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(100).max(50000).optional(),
  sortBy: z
    .enum(["recommended", "rent-asc", "rent-desc", "recent", "nearest"])
    .default("recommended"),
});

export type ListingQueryInput = z.infer<typeof ListingQuerySchema>;
