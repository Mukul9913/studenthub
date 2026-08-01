export type PropertyType = "PG" | "Hostel" | "Private Room" | "Shared Room";
export type GenderPreference = "Male" | "Female" | "Any";
export type FoodAvailability = "Included" | "Optional" | "Not Available";
export type AvailabilityStatus = "Available" | "Filling Fast" | "Full";

export type Amenity =
  | "WiFi"
  | "AC"
  | "Parking"
  | "Power Backup"
  | "Laundry"
  | "Attached Bathroom"
  | "Security"
  | "CCTV"
  | "Furnished"
  | "Study Table";

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  verified: boolean;
  memberSince: string;
  totalListings: number;
}

export interface Location {
  area: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface Accommodation {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  genderPreference: GenderPreference;
  foodAvailability: FoodAvailability;
  availabilityStatus: AvailabilityStatus;
  monthlyRent: number;
  securityDeposit: number;
  location: Location;
  amenities: Amenity[];
  images: string[];
  nearbyColleges: string[];
  nearbyCompanies: string[];
  owner: Owner;
  verified: boolean;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

export interface AccommodationFilters {
  query: string;
  area: string | "all";
  propertyType: PropertyType | "all";
  genderPreference: GenderPreference | "all";
  minRent: number;
  maxRent: number;
  amenities: Amenity[];
  sort: "recommended" | "rent-asc" | "rent-desc" | "recent";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "owner";
  avatarUrl?: string;
}
