/**
 * Shared domain types for StudentHub.
 * Import via: import type { ... } from "@studenthub/types"
 */

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export type UserRole = "student" | "professional" | "owner" | "admin";

export type OwnerType = "accommodation" | "library" | "mess" | "service_provider";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  ownerType?: OwnerType | null;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: UserRole;
  ownerType?: OwnerType | null;
  avatar?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  ownerType?: OwnerType | null;
  avatar?: string;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  ownerType?: OwnerType | null;
  avatar?: string;
}

export interface LoginUserDto {
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export type UserId = string;

export type CitySlug = "indore";

export type HealthStatus = {
  status: "ok" | "degraded" | "down";
  service: string;
  timestamp: string;
};

export type PropertyType = "pg" | "hostel" | "flat" | "house";
export type RoomType = "private" | "shared";
export type GenderPreference = "boys" | "girls" | "unisex";
export type PropertyStatus = "draft" | "pending_review" | "published" | "rejected" | "archived";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PropertyLocation {
  address: string;
  city: CitySlug | string;
  state: string;
  zipCode: string;
  coordinates: GeoLocation;
}

export interface NearbyInstitution {
  name: string;
  distanceKm: number;
}

export interface FoodAvailability {
  provided: boolean;
  mealsIncluded?: ("breakfast" | "lunch" | "dinner" | "tea_snacks")[];
  details?: string;
  monthlyCharges?: number;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  location: PropertyLocation;
  area: string;
  nearbyColleges: NearbyInstitution[];
  nearbyCompanies: NearbyInstitution[];
  amenities: string[];
  food: FoodAvailability;
  images: string[];
  videos: string[];
  isVerified: boolean;
  status: PropertyStatus;
  rejectionReason?: string;
  avgRating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomType: RoomType;
  sharingCount: number;
  rent: number;
  deposit: number;
  genderPreference: GenderPreference;
  amenities: string[];
  totalBeds: number;
  availableBeds: number;
  availableFrom: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LibraryStatus = "draft" | "pending_review" | "published" | "rejected" | "archived";

export type LibraryFacility =
  | "ac"
  | "wifi"
  | "power_backup"
  | "drinking_water"
  | "cctv"
  | "parking"
  | "individual_desk"
  | "ergonomic_chair"
  | "charging_point"
  | "locker"
  | "washroom"
  | "newspaper"
  | "twenty_four_seven_access";

export interface LibraryLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: GeoLocation;
}

export interface LibraryPricing {
  monthlyFee: number;
  weeklyFee?: number;
  dailyFee?: number;
  registrationFee?: number;
}

export interface LibraryOperatingHours {
  openingTime: string;
  closingTime: string;
  openDays: string[];
  is24x7: boolean;
}

export interface LibraryContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface Library {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: LibraryLocation;
  area: string;
  contact: LibraryContact;
  pricing: LibraryPricing;
  facilities: (LibraryFacility | string)[];
  operatingHours: LibraryOperatingHours;
  seatCapacity: number;
  availableSeats: number;
  images: string[];
  ownerId: string;
  isVerified: boolean;
  status: LibraryStatus;
  rejectionReason?: string;
  avgRating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type EnquiryTargetType = "ACCOMMODATION" | "LIBRARY";

export type EnquiryStatus = "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "CONVERTED" | "CLOSED";

export interface EnquiryTargetDetails {
  id: string;
  title: string;
  area: string;
  image?: string;
  link: string;
}

export interface EnquiryUserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Enquiry {
  id: string;
  userId: string;
  user?: EnquiryUserDetails;
  ownerId: string;
  targetType: EnquiryTargetType;
  targetId: string;
  targetDetails?: EnquiryTargetDetails;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}
