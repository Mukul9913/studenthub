import type { UserRole, OwnerType } from "@studenthub/types";

export interface RoleOption {
  value: Exclude<UserRole, "admin">;
  label: string;
  description?: string;
}

export interface OwnerTypeOption {
  value: OwnerType;
  label: string;
  description?: string;
}

export const PUBLIC_ROLE_OPTIONS: RoleOption[] = [
  {
    value: "student",
    label: "Student",
    description: "Looking for PG, hostel, or study spaces in Indore",
  },
  {
    value: "professional",
    label: "Working Professional",
    description: "Relocating for work or looking for rental accommodation",
  },
  {
    value: "owner",
    label: "Business / Service Owner",
    description: "Owner of accommodations, study libraries, messes, or local services",
  },
];

export const OWNER_TYPE_OPTIONS: OwnerTypeOption[] = [
  {
    value: "accommodation",
    label: "Accommodation / PG / Hostel",
    description: "Manage rooms, PGs, or rental properties",
  },
  {
    value: "library",
    label: "Library / Study Space",
    description: "Manage study halls, reading rooms, or library desks",
  },
  {
    value: "mess",
    label: "Mess / Food Service",
    description: "Provide monthly mess, tiffin, or catering services",
  },
  {
    value: "service_provider",
    label: "Other Local Service",
    description: "Provide laundry, gym, transport, or student services",
  },
];

export const OWNER_TYPE_LABELS: Record<OwnerType, string> = {
  accommodation: "Accommodation / PG / Hostel",
  library: "Library / Study Space",
  mess: "Mess / Food Service",
  service_provider: "Other Local Service",
};
