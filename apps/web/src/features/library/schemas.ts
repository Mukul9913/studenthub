import { z } from "zod";
import type { LibraryFacility } from "@studenthub/types";

export const FACILITY_LABELS: Record<LibraryFacility, string> = {
  ac: "AC Hall",
  wifi: "High-speed Wi-Fi",
  power_backup: "Power Backup",
  drinking_water: "RO Drinking Water",
  cctv: "CCTV Surveillance",
  parking: "Vehicle Parking",
  individual_desk: "Individual Desk",
  ergonomic_chair: "Ergonomic Chair",
  charging_point: "Personal Charging Slot",
  locker: "Personal Locker",
  washroom: "Clean Washroom",
  newspaper: "Daily Newspapers",
  twenty_four_seven_access: "24x7 Open",
};

export const createLibraryFormSchema = z.object({
  name: z
    .string({ required_error: "Library name is required." })
    .min(3, "Name must be at least 3 characters.")
    .max(120, "Name cannot exceed 120 characters.")
    .trim(),
  description: z
    .string({ required_error: "Description is required." })
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description cannot exceed 2000 characters.")
    .trim(),
  area: z.string().min(1, "Area is required.").trim(),
  address: z.string().min(1, "Address is required.").trim(),
  zipCode: z.string().min(1, "Zip/Pin code is required.").trim(),
  phone: z.string().trim().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  monthlyFee: z.number().min(0, "Monthly fee cannot be negative."),
  seatCapacity: z.number().min(1, "Seat capacity must be at least 1."),
  availableSeats: z.number().min(0, "Available seats cannot be negative."),
  facilities: z.array(z.string()).optional().default([]),
  is24x7: z.boolean().default(false),
});

export type CreateLibraryFormPayload = z.infer<typeof createLibraryFormSchema>;
