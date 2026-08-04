/**
 * Shared Application Constants for StudentHub
 * Import via: import { USER_ROLES, PROPERTY_TYPES, ... } from "@studenthub/constants"
 */
export const USER_ROLES = ["student", "professional", "owner", "admin"];
export const OWNER_TYPES = ["accommodation", "library", "mess", "service_provider"];
export const PROPERTY_TYPES = ["pg", "hostel", "flat", "house"];
export const LIBRARY_TYPES = ["silent_study", "digital", "co_working", "traditional"];
export const LISTING_STATUS = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "archived",
  "suspended",
];
export const BOOKING_STATUS = ["pending", "confirmed", "cancelled", "completed"];
export const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"];
export const ROUTES = {
  HOME: "/",
  ACCOMMODATIONS: "/accommodations",
  ACCOMMODATION_DETAILS: (id) => `/accommodations/${id}`,
  LIBRARIES: "/libraries",
  LIBRARY_DETAILS: (id) => `/libraries/${id}`,
  LOGIN: "/login",
  REGISTER: "/register",
  FORBIDDEN: "/403",
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
  USER_ENQUIRIES: "/dashboard/enquiries",
  OWNER_DASHBOARD: "/owner/dashboard",
  OWNER_LISTINGS: "/owner/listings",
  OWNER_CREATE_ACCOMMODATION: "/owner/accommodations/new",
  OWNER_EDIT_ACCOMMODATION: (id) => `/owner/accommodations/${id}/edit`,
  OWNER_CREATE_LIBRARY: "/owner/libraries/new",
  OWNER_EDIT_LIBRARY: (id) => `/owner/libraries/${id}/edit`,
  OWNER_LEADS: "/owner/leads",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_LISTINGS: "/admin/listings",
  ADMIN_USERS: "/admin/users",
  ADMIN_OWNERS: "/admin/owners",
  ADMIN_ENQUIRIES: "/admin/enquiries",
};
export const API_ENDPOINTS = {
  HEALTH: "/health",
  DOCS: "/docs",
  OPENAPI_JSON: "/openapi.json",
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
  },
  ACCOMMODATIONS: {
    BASE: "/accommodations",
    BY_ID: (id) => `/accommodations/${id}`,
    MY_LISTINGS: "/accommodations/my-listings",
  },
  LIBRARIES: {
    BASE: "/libraries",
    BY_ID: (id) => `/libraries/${id}`,
    MY_LISTINGS: "/libraries/my-listings",
  },
  ENQUIRIES: {
    BASE: "/enquiries",
    MY_ENQUIRIES: "/enquiries/me",
    OWNER_LEADS: "/enquiries/owner/leads",
    UPDATE_STATUS: (id) => `/enquiries/${id}/status`,
  },
  ADMIN: {
    OVERVIEW: "/admin/overview",
    LISTINGS: "/admin/listings",
    APPROVE_LISTING: (id) => `/admin/listings/${id}/approve`,
    REJECT_LISTING: (id) => `/admin/listings/${id}/reject`,
    USERS: "/admin/users",
    OWNERS: "/admin/owners",
    ENQUIRIES: "/admin/enquiries",
  },
};
//# sourceMappingURL=index.js.map
