/**
 * Shared Application Constants for StudentHub
 * Import via: import { USER_ROLES, PROPERTY_TYPES, ... } from "@studenthub/constants"
 */

export const USER_ROLES = ["student", "professional", "owner", "admin"] as const;
export type UserRoleConstant = (typeof USER_ROLES)[number];

export const OWNER_TYPES = ["accommodation", "library", "mess", "service_provider"] as const;
export type OwnerTypeConstant = (typeof OWNER_TYPES)[number];

export const PROPERTY_TYPES = ["pg", "hostel", "flat", "house"] as const;
export type PropertyTypeConstant = (typeof PROPERTY_TYPES)[number];

export const LIBRARY_TYPES = ["silent_study", "digital", "co_working", "traditional"] as const;
export type LibraryTypeConstant = (typeof LIBRARY_TYPES)[number];

export const MESS_PROVIDER_TYPES = [
  "mess",
  "tiffin",
  "home_kitchen",
  "cloud_kitchen",
  "catering",
] as const;
export type MessProviderTypeConstant = (typeof MESS_PROVIDER_TYPES)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type MealTypeConstant = (typeof MEAL_TYPES)[number];

export const FOOD_PREFERENCES = ["vegetarian", "non_vegetarian", "jain", "eggetarian"] as const;
export type FoodPreferenceConstant = (typeof FOOD_PREFERENCES)[number];

export const MEAL_PLAN_DURATIONS = ["daily", "weekly", "15_day", "monthly", "custom"] as const;
export type MealPlanDurationConstant = (typeof MEAL_PLAN_DURATIONS)[number];

export const SEARCH_TARGET_TYPES = [
  "ALL",
  "ACCOMMODATION",
  "LIBRARY",
  "MESS",
  "HOSTEL",
  "COACHING",
  "CAFE",
  "LAUNDRY",
  "BIKE_RENTAL",
  "TIFFIN",
] as const;
export type SearchTargetTypeConstant = (typeof SEARCH_TARGET_TYPES)[number];

export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "rating_desc",
  "popularity_desc",
  "distance_asc",
] as const;
export type SortOptionConstant = (typeof SORT_OPTIONS)[number];

export const LISTING_STATUS = [
  "DRAFT",
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
  "ARCHIVED",
  "draft",
  "pending_review",
  "published",
  "rejected",
  "archived",
  "suspended",
] as const;
export type ListingStatusConstant = (typeof LISTING_STATUS)[number];

export const MODERATION_STATUS = [
  "DRAFT",
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
  "ARCHIVED",
] as const;
export type ModerationStatusConstant = (typeof MODERATION_STATUS)[number];

export const MODERATION_ACTION = [
  "SUBMIT",
  "START_REVIEW",
  "APPROVE",
  "REJECT",
  "SUSPEND",
  "ARCHIVE",
  "RESTORE",
  "ASSIGN_MODERATOR",
  "ADD_COMMENT",
] as const;
export type ModerationActionConstant = (typeof MODERATION_ACTION)[number];

export const VERIFICATION_STATUS = [
  "UNVERIFIED",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
] as const;
export type VerificationStatusConstant = (typeof VERIFICATION_STATUS)[number];

export const LEAD_STATUS = [
  "NEW",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "RESCHEDULED",
  "VISITED",
  "CONVERTED",
  "CANCELLED",
] as const;
export type LeadStatusConstant = (typeof LEAD_STATUS)[number];

export const LEAD_TARGET_TYPE = [
  "ACCOMMODATION",
  "LIBRARY",
  "MESS",
  "COACHING",
  "CAFE",
  "PG",
  "HOSTEL",
  "TIFFIN",
  "LAUNDRY",
] as const;
export type LeadTargetTypeConstant = (typeof LEAD_TARGET_TYPE)[number];

export const LEAD_SOURCE = [
  "DIRECT_ENQUIRY",
  "VISIT_REQUEST",
  "WHATSAPP_CLICK",
  "CALL_CLICK",
] as const;
export type LeadSourceConstant = (typeof LEAD_SOURCE)[number];

export const BOOKING_STATUS = ["pending", "confirmed", "cancelled", "completed"] as const;
export type BookingStatusConstant = (typeof BOOKING_STATUS)[number];

export const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatusConstant = (typeof PAYMENT_STATUS)[number];

export const PLAN_NAMES = ["FREE", "STARTER", "PRO", "BUSINESS"] as const;
export type PlanNameConstant = (typeof PLAN_NAMES)[number];

export const SUBSCRIPTION_STATUS = [
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "TRIALING",
  "PENDING",
] as const;
export type SubscriptionStatusConstant = (typeof SUBSCRIPTION_STATUS)[number];

export const BILLING_CYCLES = ["MONTHLY", "ANNUAL"] as const;
export type BillingCycleConstant = (typeof BILLING_CYCLES)[number];

export const MARKETING_SERVICE_CATEGORY = [
  "PHOTOSHOOT",
  "SOCIAL_PROMO",
  "LOCAL_SEO",
  "BANNER_AD",
  "FEATURED_CAMPAIGN",
] as const;
export type MarketingServiceCategoryConstant = (typeof MARKETING_SERVICE_CATEGORY)[number];

export const MARKETING_ORDER_STATUS_VALUES = [
  "REQUESTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export const REVIEW_STATUS = ["APPROVED", "PENDING", "HIDDEN", "FLAGGED"] as const;
export type ReviewStatusConstant = (typeof REVIEW_STATUS)[number];

export const REACTION_TYPE = ["HELPFUL", "LIKE"] as const;
export type ReactionTypeConstant = (typeof REACTION_TYPE)[number];

export const REPORT_REASON = [
  "FAKE_REVIEW",
  "SPAM",
  "ABUSIVE_LANGUAGE",
  "IRRELEVANT",
  "OTHER",
] as const;
export type ReportReasonConstant = (typeof REPORT_REASON)[number];

export const BADGE_CODES = [
  "VERIFIED_OWNER",
  "TOP_RATED",
  "FAST_RESPONSE",
  "STUDENT_CHOICE",
  "MOST_VISITED",
  "PREMIUM_OWNER",
] as const;
export type BadgeCodeConstant = (typeof BADGE_CODES)[number];

// ======================================================
// RECOMMENDATION ENGINE
// ======================================================
export const RECOMMENDATION_REASON = [
  "LOCATION_MATCH",
  "BUDGET_MATCH",
  "INTEREST_MATCH",
  "TRENDING",
  "POPULAR_NEAR_YOU",
  "RECENTLY_VIEWED",
  "SIMILAR_TO_SAVED",
  "FEATURED",
  "NEW_LISTING",
  "VERIFIED_OWNER",
  "HIGH_RATED",
  "COLLABORATIVE_FILTER",
] as const;
export type RecommendationReasonConstant = (typeof RECOMMENDATION_REASON)[number];

export const VIEW_SOURCE = [
  "SEARCH",
  "RECOMMENDATION",
  "DIRECT",
  "TRENDING",
  "FEATURED",
  "SIMILAR",
  "HOME",
] as const;
export type ViewSourceConstant = (typeof VIEW_SOURCE)[number];

export const RECOMMENDATION_ALGORITHM = [
  "RULE_BASED",
  "COLLABORATIVE",
  "HYBRID",
  "ML_MODEL",
] as const;
export type RecommendationAlgorithmConstant = (typeof RECOMMENDATION_ALGORITHM)[number];

// ======================================================
// OWNER CRM
// ======================================================
export const PIPELINE_STAGES = [
  "NEW_LEAD",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "VISITED",
  "NEGOTIATION",
  "CONVERTED",
  "LOST",
] as const;
export type PipelineStageConstant = (typeof PIPELINE_STAGES)[number];

export const CRM_PRIORITY = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type CRMPriorityConstant = (typeof CRM_PRIORITY)[number];

export const TASK_TYPE = [
  "CALL_STUDENT",
  "WHATSAPP_STUDENT",
  "VISIT_REMINDER",
  "DOCUMENT_COLLECTION",
  "FOLLOW_UP",
  "CUSTOM",
] as const;
export type TaskTypeConstant = (typeof TASK_TYPE)[number];

export const TASK_STATUS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type TaskStatusConstant = (typeof TASK_STATUS)[number];

export const FOLLOWUP_TYPE = ["CALL", "WHATSAPP", "EMAIL", "VISIT", "SMS"] as const;
export type FollowUpTypeConstant = (typeof FOLLOWUP_TYPE)[number];

export const FOLLOWUP_STATUS = ["PENDING", "COMPLETED", "MISSED", "RESCHEDULED"] as const;
export type FollowUpStatusConstant = (typeof FOLLOWUP_STATUS)[number];

export const ACTIVITY_TYPE = [
  "LEAD_CREATED",
  "STATUS_CHANGED",
  "PIPELINE_STAGE_CHANGED",
  "NOTE_ADDED",
  "CALL_MADE",
  "WHATSAPP_SENT",
  "EMAIL_SENT",
  "VISIT_COMPLETED",
  "TASK_CREATED",
  "TASK_COMPLETED",
  "FOLLOW_UP_SCHEDULED",
  "FOLLOW_UP_COMPLETED",
  "REMINDER_TRIGGERED",
] as const;
export type ActivityTypeConstant = (typeof ACTIVITY_TYPE)[number];

export const ROUTES = {
  HOME: "/",
  ACCOMMODATIONS: "/accommodations",
  ACCOMMODATION_DETAILS: (id: string) => `/accommodations/${id}`,
  LIBRARIES: "/libraries",
  LIBRARY_DETAILS: (id: string) => `/libraries/${id}`,
  MESS: "/mess",
  MESS_DETAILS: (idOrSlug: string) => `/mess/${idOrSlug}`,
  LOGIN: "/login",
  REGISTER: "/register",
  FORBIDDEN: "/403",
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
  USER_ENQUIRIES: "/dashboard/enquiries",
  USER_PREFERENCES: "/dashboard/preferences",
  OWNER_DASHBOARD: "/owner/dashboard",
  OWNER_LISTINGS: "/owner/listings",
  OWNER_CREATE_ACCOMMODATION: "/owner/accommodations/new",
  OWNER_EDIT_ACCOMMODATION: (id: string) => `/owner/accommodations/${id}/edit`,
  OWNER_CREATE_LIBRARY: "/owner/libraries/new",
  OWNER_EDIT_LIBRARY: (id: string) => `/owner/libraries/${id}/edit`,
  OWNER_CREATE_MESS: "/owner/mess/new",
  OWNER_EDIT_MESS: (id: string) => `/owner/mess/${id}/edit`,
  OWNER_MESS_MENU: (id: string) => `/owner/mess/${id}/menu`,
  OWNER_MESS_PLANS: (id: string) => `/owner/mess/${id}/plans`,
  OWNER_LEADS: "/owner/leads",
  OWNER_SUBSCRIPTION: "/owner/subscription",
  OWNER_PUBLIC_PROFILE: (id: string) => `/owner/profile/${id}`,
  OWNER_REVIEWS: "/owner/reviews",
  OWNER_CRM: "/owner/crm",
  OWNER_LISTING_ANALYTICS: "/owner/listing-analytics",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_LISTINGS: "/admin/listings",
  ADMIN_USERS: "/admin/users",
  ADMIN_OWNERS: "/admin/owners",
  ADMIN_ENQUIRIES: "/admin/enquiries",
  ADMIN_MODERATION: "/admin/moderation",
  ADMIN_SEARCH_ANALYTICS: "/admin/search-analytics",
  ADMIN_MONETIZATION: "/admin/monetization",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_CRM_ANALYTICS: "/admin/crm-analytics",
} as const;

export const API_ENDPOINTS = {
  HEALTH: "/health",
  READY: "/ready",
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
    BY_ID: (id: string) => `/users/${id}`,
  },
  ACCOMMODATIONS: {
    BASE: "/accommodations",
    BY_ID: (id: string) => `/accommodations/${id}`,
    MY_LISTINGS: "/accommodations/my-listings",
  },
  LIBRARIES: {
    BASE: "/libraries",
    BY_ID: (id: string) => `/libraries/${id}`,
    MY_LISTINGS: "/libraries/my-listings",
  },
  MESS: {
    BASE: "/mess",
    BY_ID: (idOrSlug: string) => `/mess/${idOrSlug}`,
    MY_LISTINGS: "/mess/owner/my-messes",
    MENU: (id: string) => `/mess/${id}/menu`,
    PLANS: (id: string) => `/mess/${id}/plans`,
  },
  ENQUIRIES: {
    BASE: "/enquiries",
    MY_ENQUIRIES: "/enquiries/me",
    OWNER_LEADS: "/enquiries/owner/leads",
    UPDATE_STATUS: (id: string) => `/enquiries/${id}/status`,
  },
  LEADS: {
    BASE: "/leads",
    MY_LEADS: "/leads/my",
    OWNER_LEADS: "/leads/owner",
    OWNER_ANALYTICS: "/leads/owner/analytics",
    ADMIN_LEADS: "/leads/admin",
    ADMIN_ANALYTICS: "/leads/admin/analytics",
    UPDATE_STATUS: (id: string) => `/leads/${id}/status`,
    ADD_FOLLOWUP: (id: string) => `/leads/${id}/followups`,
    TIMELINE: (id: string) => `/leads/${id}/timeline`,
  },
  MODERATION: {
    BASE: "/moderation",
    ADMIN_QUEUE: "/moderation/admin/queue",
    ADMIN_ANALYTICS: "/moderation/admin/analytics",
    SUBMIT: (id: string) => `/moderation/${id}/submit`,
    START_REVIEW: (id: string) => `/moderation/${id}/start-review`,
    APPROVE: (id: string) => `/moderation/${id}/approve`,
    REJECT: (id: string) => `/moderation/${id}/reject`,
    SUSPEND: (id: string) => `/moderation/${id}/suspend`,
    ARCHIVE: (id: string) => `/moderation/${id}/archive`,
    RESTORE: (id: string) => `/moderation/${id}/restore`,
    ASSIGN: (id: string) => `/moderation/${id}/assign`,
    HISTORY: (id: string) => `/moderation/${id}/history`,
    COMMENTS: (id: string) => `/moderation/${id}/comments`,
  },
  SEARCH: {
    BASE: "/search",
    SUGGESTIONS: "/search/suggestions",
    RECOMMENDATIONS: "/search/recommendations",
    HISTORY: "/search/history",
    SAVED: "/search/saved",
    ADMIN_ANALYTICS: "/search/admin/analytics",
  },
  MONETIZATION: {
    PLANS: "/monetization/plans",
    PLAN_BY_ID: (id: string) => `/monetization/plans/${id}`,
    SUBSCRIPTION_ME: "/monetization/subscription/me",
    SUBSCRIBE: "/monetization/subscription/subscribe",
    CANCEL: "/monetization/subscription/cancel",
    USAGE_ME: "/monetization/usage/me",
    MARKETING_SERVICES: "/monetization/marketing-services",
    ORDER_MARKETING_SERVICE: "/monetization/marketing-services/order",
    LEAD_PACKAGES: "/monetization/lead-packages",
    PURCHASE_LEAD_PACKAGE: "/monetization/lead-packages/purchase",
    FEATURED_LISTINGS: "/monetization/featured-listings",
    VERIFICATION_STATUS: "/monetization/verification/status",
    VERIFICATION_REQUEST: "/monetization/verification/request",
    VERIFICATION_REVIEW: (id: string) => `/monetization/verification/${id}/review`,
    ADMIN_ANALYTICS: "/monetization/admin/analytics",
  },
  REVIEWS: {
    BASE: "/reviews",
    BY_ID: (id: string) => `/reviews/${id}`,
    REPLY: (id: string) => `/reviews/${id}/reply`,
    REACT: (id: string) => `/reviews/${id}/react`,
    REPORT: (id: string) => `/reviews/${id}/report`,
    OWNER_ANALYTICS: "/reviews/owner/analytics",
    ADMIN_QUEUE: "/reviews/admin/queue",
    ADMIN_ANALYTICS: "/reviews/admin/analytics",
    UPDATE_STATUS: (id: string) => `/reviews/admin/${id}/status`,
  },
  OWNERS: {
    PUBLIC_PROFILE: (id: string) => `/owners/${id}/profile`,
    SCORE: (id: string) => `/owners/${id}/score`,
    BADGES: (id: string) => `/owners/${id}/badges`,
    LISTING_ANALYTICS: "/owners/listing-analytics",
  },
  RECOMMENDATIONS: {
    FEED: "/recommendations/feed",
    FOR_YOU: "/recommendations/for-you",
    TRENDING: "/recommendations/trending",
    POPULAR_NEAR_ME: "/recommendations/popular-near-me",
    SIMILAR: (targetType: string, targetId: string) =>
      `/recommendations/similar/${targetType}/${targetId}`,
    RECENTLY_VIEWED: "/recommendations/recently-viewed",
    TRACK_VIEW: "/recommendations/track-view",
  },
  STUDENT_PREFERENCES: {
    BASE: "/student-preferences",
    SAVED_SEARCHES: "/student-preferences/saved-searches",
  },
  CRM: {
    PIPELINE: "/crm/pipeline",
    PIPELINE_STAGE: (leadId: string) => `/crm/pipeline/${leadId}/stage`,
    PIPELINE_NOTE: (leadId: string) => `/crm/pipeline/${leadId}/note`,
    FOLLOWUPS: "/crm/followups",
    FOLLOWUP_COMPLETE: (id: string) => `/crm/followups/${id}/complete`,
    TASKS: "/crm/tasks",
    TASK_STATUS: (id: string) => `/crm/tasks/${id}/status`,
    REMINDERS: "/crm/reminders",
    ACTIVITY: (leadId: string) => `/crm/activity/${leadId}`,
    ANALYTICS: "/crm/analytics",
    ADMIN_ANALYTICS: "/crm/admin/analytics",
  },
  LOCATION: {
    GEOCODE: "/location/geocode",
    REVERSE_GEOCODE: "/location/reverse-geocode",
    NEARBY_LISTINGS: "/location/nearby-listings",
    DISTANCE_MATRIX: "/location/distance-matrix",
    AREA_SUGGESTIONS: "/location/area-suggestions",
    PLACES_AUTOCOMPLETE: "/location/places-autocomplete",
  },
  ADMIN: {
    OVERVIEW: "/admin/overview",
    LISTINGS: "/admin/listings",
    APPROVE_LISTING: (id: string) => `/admin/listings/${id}/approve`,
    REJECT_LISTING: (id: string) => `/admin/listings/${id}/reject`,
    USERS: "/admin/users",
    OWNERS: "/admin/owners",
    ENQUIRIES: "/admin/enquiries",
  },
} as const;

// ─── Location Intelligence Constants ──────────────────────────────────────────

export const EDUCATION_CENTER_TYPES = [
  "COLLEGE",
  "UNIVERSITY",
  "COACHING_INSTITUTE",
  "SKILL_CENTER",
  "TRAINING_INSTITUTE",
  "STUDY_CENTER",
] as const;
export type EducationCenterTypeConstant = (typeof EDUCATION_CENTER_TYPES)[number];

export const DISTANCE_MODES = ["WALKING", "CYCLING", "DRIVING", "STRAIGHT"] as const;
export type DistanceModeConstant = (typeof DISTANCE_MODES)[number];

export const RADIUS_METERS_OPTIONS = [500, 1000, 2000, 5000, 10000, 20000] as const;
export type RadiusMetersConstant = (typeof RADIUS_METERS_OPTIONS)[number];
