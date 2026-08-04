/**
 * Shared Application Constants for StudentHub
 * Import via: import { USER_ROLES, PROPERTY_TYPES, ... } from "@studenthub/constants"
 */
export declare const USER_ROLES: readonly ["student", "professional", "owner", "admin"];
export type UserRoleConstant = (typeof USER_ROLES)[number];
export declare const OWNER_TYPES: readonly ["accommodation", "library", "mess", "service_provider"];
export type OwnerTypeConstant = (typeof OWNER_TYPES)[number];
export declare const PROPERTY_TYPES: readonly ["pg", "hostel", "flat", "house"];
export type PropertyTypeConstant = (typeof PROPERTY_TYPES)[number];
export declare const LIBRARY_TYPES: readonly [
  "silent_study",
  "digital",
  "co_working",
  "traditional",
];
export type LibraryTypeConstant = (typeof LIBRARY_TYPES)[number];
export declare const LISTING_STATUS: readonly [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "archived",
  "suspended",
];
export type ListingStatusConstant = (typeof LISTING_STATUS)[number];
export declare const BOOKING_STATUS: readonly ["pending", "confirmed", "cancelled", "completed"];
export type BookingStatusConstant = (typeof BOOKING_STATUS)[number];
export declare const PAYMENT_STATUS: readonly ["pending", "paid", "failed", "refunded"];
export type PaymentStatusConstant = (typeof PAYMENT_STATUS)[number];
export declare const ROUTES: {
  readonly HOME: "/";
  readonly ACCOMMODATIONS: "/accommodations";
  readonly ACCOMMODATION_DETAILS: (id: string) => string;
  readonly LIBRARIES: "/libraries";
  readonly LIBRARY_DETAILS: (id: string) => string;
  readonly LOGIN: "/login";
  readonly REGISTER: "/register";
  readonly FORBIDDEN: "/403";
  readonly PROFILE: "/dashboard/profile";
  readonly SETTINGS: "/dashboard/settings";
  readonly USER_ENQUIRIES: "/dashboard/enquiries";
  readonly OWNER_DASHBOARD: "/owner/dashboard";
  readonly OWNER_LISTINGS: "/owner/listings";
  readonly OWNER_CREATE_ACCOMMODATION: "/owner/accommodations/new";
  readonly OWNER_EDIT_ACCOMMODATION: (id: string) => string;
  readonly OWNER_CREATE_LIBRARY: "/owner/libraries/new";
  readonly OWNER_EDIT_LIBRARY: (id: string) => string;
  readonly OWNER_LEADS: "/owner/leads";
  readonly ADMIN_DASHBOARD: "/admin/dashboard";
  readonly ADMIN_LISTINGS: "/admin/listings";
  readonly ADMIN_USERS: "/admin/users";
  readonly ADMIN_OWNERS: "/admin/owners";
  readonly ADMIN_ENQUIRIES: "/admin/enquiries";
};
export declare const API_ENDPOINTS: {
  readonly HEALTH: "/health";
  readonly DOCS: "/docs";
  readonly OPENAPI_JSON: "/openapi.json";
  readonly AUTH: {
    readonly REGISTER: "/auth/register";
    readonly LOGIN: "/auth/login";
    readonly REFRESH: "/auth/refresh";
    readonly LOGOUT: "/auth/logout";
    readonly ME: "/auth/me";
  };
  readonly USERS: {
    readonly BASE: "/users";
    readonly BY_ID: (id: string) => string;
  };
  readonly ACCOMMODATIONS: {
    readonly BASE: "/accommodations";
    readonly BY_ID: (id: string) => string;
    readonly MY_LISTINGS: "/accommodations/my-listings";
  };
  readonly LIBRARIES: {
    readonly BASE: "/libraries";
    readonly BY_ID: (id: string) => string;
    readonly MY_LISTINGS: "/libraries/my-listings";
  };
  readonly ENQUIRIES: {
    readonly BASE: "/enquiries";
    readonly MY_ENQUIRIES: "/enquiries/me";
    readonly OWNER_LEADS: "/enquiries/owner/leads";
    readonly UPDATE_STATUS: (id: string) => string;
  };
  readonly ADMIN: {
    readonly OVERVIEW: "/admin/overview";
    readonly LISTINGS: "/admin/listings";
    readonly APPROVE_LISTING: (id: string) => string;
    readonly REJECT_LISTING: (id: string) => string;
    readonly USERS: "/admin/users";
    readonly OWNERS: "/admin/owners";
    readonly ENQUIRIES: "/admin/enquiries";
  };
};
//# sourceMappingURL=index.d.ts.map
