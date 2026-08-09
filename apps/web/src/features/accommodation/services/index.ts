import { fetchApi, getToken, ApiError } from "@/services/api";
import { appConfig } from "@/config/env";
import type { Accommodation, AccommodationFilters } from "../types";
import type { Property, Room } from "@studenthub/types";
import type { CreateAccommodationPayload } from "../schemas";
import {
  PROPERTY_TYPE_LABELS,
  GENDER_LABELS,
  type BackendPropertyType,
  type BackendGenderPreference,
} from "../schemas";

export interface PropertyWithRooms extends Property {
  rooms?: Room[];
}

export interface PaginatedProperties {
  items: PropertyWithRooms[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  Backend → UI mapper                                                */
/* ------------------------------------------------------------------ */

function mapPropertyToAccommodation(p: PropertyWithRooms): Accommodation {
  const rooms = p.rooms || [];

  const monthlyRent = rooms.length > 0 ? Math.min(...rooms.map((r) => r.rent)) : 0;
  const securityDeposit = rooms.length > 0 ? Math.min(...rooms.map((r) => r.deposit)) : 0;

  // Map backend enum → display label
  const rawGender = rooms[0]?.genderPreference as BackendGenderPreference | undefined;
  const genderPreference = rawGender
    ? (GENDER_LABELS[rawGender] === "Any / Co-ed" ? "Any" : GENDER_LABELS[rawGender]) || "Any"
    : "Any";

  const availabilityStatus =
    rooms.reduce((acc, r) => acc + (r.availableBeds || 0), 0) > 0 ? "Available" : "Full";

  // Map backend food object
  const foodProvided = (p as unknown as { food?: { provided?: boolean } })?.food?.provided;
  const foodAvailability = foodProvided ? "Included" : "Not Available";

  // Map backend propertyType enum → display label
  const displayPropertyType =
    PROPERTY_TYPE_LABELS[p.propertyType as BackendPropertyType] || p.propertyType;

  const propertyId = p.id || (p as unknown as { _id?: string })._id || "";
  const ownerIdStr =
    typeof p.ownerId === "object" && p.ownerId
      ? (p.ownerId as unknown as { _id?: string })._id || String(p.ownerId)
      : String(p.ownerId || "");
  const ownerObj =
    typeof p.ownerId === "object" && p.ownerId
      ? (p.ownerId as unknown as {
          _id?: string;
          firstName?: string;
          lastName?: string;
          phone?: string;
          email?: string;
        })
      : null;
  const ownerName = ownerObj?.firstName
    ? `${ownerObj.firstName} ${ownerObj.lastName || ""}`.trim()
    : "Listing Owner";

  return {
    id: propertyId,
    title: p.title,
    description: p.description || "",
    propertyType: displayPropertyType as Accommodation["propertyType"],
    genderPreference: genderPreference as Accommodation["genderPreference"],
    foodAvailability: foodAvailability as Accommodation["foodAvailability"],
    availabilityStatus: availabilityStatus as Accommodation["availabilityStatus"],
    monthlyRent,
    securityDeposit,
    location: {
      area: p.area,
      address: p.location?.address || "",
      city: p.location?.city || "",
      state: p.location?.state || "",
      pincode: p.location?.zipCode || "",
    },
    amenities: (p.amenities || []) as Accommodation["amenities"],
    images:
      p.images && p.images.length > 0
        ? p.images
        : [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
          ],
    nearbyColleges: (p.nearbyColleges || []).map((c) => c.name),
    nearbyCompanies: (p.nearbyCompanies || []).map((c) => c.name),
    owner: {
      id: ownerIdStr,
      name: ownerName,
      phone: ownerObj?.phone || "",
      email: ownerObj?.email || "",
      verified: p.isVerified,
      memberSince: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      totalListings: 1,
    },
    verified: p.isVerified,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    rating: p.avgRating > 0 ? p.avgRating : undefined,
    reviewCount: p.reviewsCount > 0 ? p.reviewsCount : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  API calls                                                          */
/* ------------------------------------------------------------------ */

/**
 * Maps frontend filter enum values to backend enum values for the query string.
 * Frontend displays "PG", backend expects "pg" etc.
 */
const PROPERTY_TYPE_TO_BACKEND: Record<string, string> = {
  PG: "pg",
  Hostel: "hostel",
  "Private Room": "flat",
  "Shared Room": "house",
};

const GENDER_TO_BACKEND: Record<string, string> = {
  Male: "boys",
  Female: "girls",
  Any: "unisex",
};

export interface PaginatedAccommodations {
  items: Accommodation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAccommodations(
  filters?: Partial<AccommodationFilters & { page?: number; limit?: number; sort?: string }>,
): Promise<PaginatedAccommodations> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.query && filters.query.trim()) params.append("q", filters.query.trim());
    if (filters.area && filters.area !== "all") params.append("area", filters.area);
    if (filters.propertyType && filters.propertyType !== "all") {
      const backendType =
        PROPERTY_TYPE_TO_BACKEND[filters.propertyType] || filters.propertyType.toLowerCase();
      params.append("propertyType", backendType);
    }
    if (filters.genderPreference && filters.genderPreference !== "all") {
      const backendGender =
        GENDER_TO_BACKEND[filters.genderPreference] || filters.genderPreference.toLowerCase();
      params.append("genderPreference", backendGender);
    }
    if (filters.minRent) params.append("minRent", filters.minRent.toString());
    if (filters.maxRent) params.append("maxRent", filters.maxRent.toString());

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sort) {
      params.append("sortBy", filters.sort);
    }
  }
  const queryString = params.toString();

  const response = await fetchApi<PaginatedProperties>(
    `/accommodations${queryString ? `?${queryString}` : ""}`,
  );

  const items = response.items || [];
  const accommodations = items.map(mapPropertyToAccommodation);

  return {
    items: accommodations,
    total: response.total || 0,
    page: response.page || 1,
    pageSize: response.pageSize || 10,
    totalPages: response.totalPages || 1,
  };
}

export async function getAccommodationById(id: string): Promise<Accommodation | undefined> {
  const response = await fetchApi<{ property: PropertyWithRooms; rooms: Room[] }>(
    `/accommodations/${id}`,
  );
  if (!response?.property) return undefined;

  // Merge rooms into the property for the mapper
  const propertyWithRooms: PropertyWithRooms = {
    ...response.property,
    rooms: response.rooms || [],
  };
  return mapPropertyToAccommodation(propertyWithRooms);
}

export async function getSimilarAccommodations(id: string): Promise<Accommodation[]> {
  const all = await getAccommodations();
  return all.items.filter((a) => a.id !== id).slice(0, 3);
}

export async function createAccommodation(
  input: CreateAccommodationPayload,
): Promise<{ property: unknown; rooms: unknown[] }> {
  return fetchApi<{ property: unknown; rooms: unknown[] }>("/accommodations", {
    method: "POST",
    data: input,
  });
}

export async function updateAccommodation(
  id: string,
  input: Partial<Omit<CreateAccommodationPayload, "rooms">>,
): Promise<unknown> {
  return fetchApi<unknown>(`/accommodations/${id}`, {
    method: "PATCH",
    data: input,
  });
}

export async function uploadAccommodationImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const token = getToken();

  const response = await fetch(`${appConfig.apiUrl}/accommodations/upload-images`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new ApiError(
      result.error?.message || "Failed to upload images",
      response.status,
      result.error?.code,
    );
  }

  return result.data.images as string[];
}

export interface MyListingsResponse {
  items: (PropertyWithRooms & { status?: string; rejectionReason?: string })[];
  stats: {
    total: number;
    published: number;
    pendingReview: number;
    draft: number;
    rejected: number;
    archived: number;
  };
}

export async function getMyListings(): Promise<{
  items: Accommodation[];
  stats: MyListingsResponse["stats"];
}> {
  const response = await fetchApi<MyListingsResponse>("/accommodations/owner/my-listings");

  const items = (response.items || []).map((p) => {
    const mapped = mapPropertyToAccommodation(p);
    return {
      ...mapped,
      status: p.status || "pending_review",
      rejectionReason: p.rejectionReason,
    };
  });

  return {
    items: items as (Accommodation & { status: string; rejectionReason?: string })[],
    stats: response.stats || {
      total: 0,
      published: 0,
      pendingReview: 0,
      draft: 0,
      rejected: 0,
      archived: 0,
    },
  };
}

export async function deleteAccommodation(id: string): Promise<void> {
  await fetchApi<void>(`/accommodations/${id}`, {
    method: "DELETE",
  });
}

export async function submitForReview(id: string): Promise<unknown> {
  return fetchApi<unknown>(`/accommodations/${id}/submit-review`, {
    method: "POST",
  });
}
