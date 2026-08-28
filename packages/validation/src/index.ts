import { z } from "zod";
import {
  USER_ROLES,
  OWNER_TYPES,
  PROPERTY_TYPES,
  LEAD_STATUS,
  LEAD_TARGET_TYPE,
  LEAD_SOURCE,
  SEARCH_TARGET_TYPES,
  SORT_OPTIONS,
} from "@studenthub/constants";

/**
 * Auth Schemas
 */
export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number (10 digits)")
    .optional(),
  role: z.enum(USER_ROLES).default("student"),
  ownerType: z.enum(OWNER_TYPES).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Accommodation Schemas
 */
export const geoCoordinatesSchema = z.tuple([
  z.number().min(-180).max(180), // longitude
  z.number().min(-90).max(90), // latitude
]);

export const locationSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().default("Indore"),
  state: z.string().default("Madhya Pradesh"),
  zipCode: z.string().min(6).max(6),
  coordinates: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: geoCoordinatesSchema,
  }),
});

export const nearbyInstitutionSchema = z.object({
  name: z.string().min(2),
  distanceKm: z.number().nonnegative(),
});

export const foodAvailabilitySchema = z.object({
  provided: z.boolean(),
  mealsIncluded: z.array(z.enum(["breakfast", "lunch", "dinner", "tea_snacks"])).optional(),
  details: z.string().optional(),
  monthlyCharges: z.number().nonnegative().optional(),
});

export const createAccommodationSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  propertyType: z.enum(PROPERTY_TYPES),
  area: z.string().min(2, "Area is required"),
  location: locationSchema,
  nearbyColleges: z.array(nearbyInstitutionSchema).optional().default([]),
  nearbyCompanies: z.array(nearbyInstitutionSchema).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  food: foodAvailabilitySchema,
  images: z.array(z.string().url()).min(1, "At least 1 image is required").max(15),
  videos: z.array(z.string().url()).optional().default([]),
});

export const updateAccommodationSchema = createAccommodationSchema.partial();

export const accommodationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  city: z.string().optional(),
  area: z.string().optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  status: z.string().optional(),
  sortBy: z.enum(["recent", "rent-asc", "rent-desc", "recommended"]).default("recent"),
  search: z.string().optional(),
});

/**
 * Library Schemas
 */
export const libraryPricingSchema = z.object({
  monthlyFee: z.number().positive("Monthly fee must be positive"),
  weeklyFee: z.number().positive().optional(),
  dailyFee: z.number().positive().optional(),
  registrationFee: z.number().nonnegative().optional(),
});

export const libraryOperatingHoursSchema = z.object({
  openingTime: z.string(),
  closingTime: z.string(),
  openDays: z.array(z.string()).min(1),
  is24x7: z.boolean().default(false),
});

export const createLibrarySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(15, "Description must be at least 15 characters").max(2000),
  area: z.string().min(2, "Area is required"),
  location: locationSchema,
  pricing: libraryPricingSchema,
  facilities: z.array(z.string()).min(1, "At least 1 facility required"),
  operatingHours: libraryOperatingHoursSchema,
  seatCapacity: z.number().int().positive(),
  availableSeats: z.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1, "At least 1 image required"),
});

export const updateLibrarySchema = createLibrarySchema.partial();

export const libraryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  area: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Enquiry Schemas
 */
export const createEnquirySchema = z.object({
  targetType: z.enum(["ACCOMMODATION", "LIBRARY", "MESS"]),
  targetId: z.string().min(1, "Target ID is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"]),
});

/**
 * Lead Schemas
 */
export const createLeadSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().min(3, "Message must be at least 3 characters").max(1000),
  contactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
    .optional(),
  contactEmail: z.string().email("Invalid email address").optional(),
  source: z.enum(LEAD_SOURCE).default("VISIT_REQUEST"),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUS),
  notes: z.string().max(1000).optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});

export const addFollowUpSchema = z.object({
  note: z.string().min(3, "Follow-up note is required").max(1000),
  scheduledFollowUpDate: z.string().optional(),
  contactChannel: z.enum(["CALL", "WHATSAPP", "EMAIL", "IN_PERSON"]).default("CALL"),
});

export const leadQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(LEAD_STATUS).optional(),
  targetType: z.enum(LEAD_TARGET_TYPE).optional(),
  targetId: z.string().optional(),
  ownerId: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
});

/**
 * User Profile Schemas
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  avatar: z.string().url().optional(),
  ownerType: z.enum(OWNER_TYPES).optional(),
});

/**
 * Listing Moderation & Verification Schemas
 */
export const submitForReviewSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  notes: z.string().max(1000).optional(),
});

export const approveListingSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  notes: z.string().max(1000).optional(),
  verifyListing: z.boolean().default(true),
});

export const rejectListingSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(5, "Rejection reason must be at least 5 characters").max(500),
  notes: z.string().max(1000).optional(),
});

export const suspendListingSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(5, "Suspension reason is required").max(500),
  notes: z.string().max(1000).optional(),
});

export const archiveListingSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().max(500).optional(),
});

export const restoreListingSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
});

export const assignModeratorSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  moderatorId: z.string().min(1, "Moderator ID is required"),
});

export const addModerationCommentSchema = z.object({
  targetType: z.enum(LEAD_TARGET_TYPE),
  targetId: z.string().min(1, "Target ID is required"),
  comment: z.string().min(2, "Comment must be at least 2 characters").max(1000),
  isInternalOnly: z.boolean().default(false),
});

export const moderationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().optional(),
  targetType: z.enum(LEAD_TARGET_TYPE).optional(),
  moderatorId: z.string().optional(),
  ownerId: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Search & Discovery Schemas
 */
export const globalSearchSchema = z.object({
  q: z.string().optional(),
  targetType: z.enum(SEARCH_TARGET_TYPES).default("ALL"),
  city: z.string().optional(),
  area: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().positive().optional().default(10),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  gender: z.string().optional(),
  propertyType: z.string().optional(),
  roomType: z.string().optional(),
  bhk: z.coerce.number().optional(),
  furnishing: z.string().optional(),
  tenantType: z.string().optional(),
  ac: z.coerce.boolean().optional(),
  wifi: z.coerce.boolean().optional(),
  powerBackup: z.coerce.boolean().optional(),
  parking: z.coerce.boolean().optional(),
  cctv: z.coerce.boolean().optional(),
  locker: z.coerce.boolean().optional(),
  is24x7: z.coerce.boolean().optional(),
  foodProvided: z.coerce.boolean().optional(),
  isVerified: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isAvailable: z.coerce.boolean().optional(),
  sortBy: z.enum(SORT_OPTIONS).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  cursor: z.string().optional(),
});

export const searchSuggestionsSchema = z.object({
  q: z.string().min(1, "Query string is required").max(100),
  city: z.string().optional(),
});

export const saveSearchSchema = z.object({
  name: z.string().min(2, "Search name is required").max(100),
  query: z.string().optional(),
  targetType: z.enum(SEARCH_TARGET_TYPES).default("ALL"),
  filters: z.record(z.unknown()).optional(),
  notifyNewListings: z.boolean().default(true),
});

export const searchAnalyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});

/**
 * Revenue & Monetization Engine Schemas
 */
export const planFeaturesSchema = z.object({
  maxListings: z.number().int().default(1),
  monthlyLeadLimit: z.number().int().default(25),
  featuredListingsIncluded: z.number().int().default(0),
  marketingCreditsIncluded: z.number().int().default(0),
  verifiedBadge: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
  advancedAnalytics: z.boolean().default(false),
  leadExport: z.boolean().default(false),
  homepageBanner: z.boolean().default(false),
  sponsoredListingsAllowed: z.boolean().default(false),
  customFeatures: z.array(z.string()).optional().default([]),
});

export const createPlanSchema = z.object({
  name: z.string().min(2, "Plan name is required").max(50),
  code: z.string().min(2, "Plan code is required").max(30),
  description: z.string().min(10, "Description is required").max(500),
  priceMonthly: z.number().nonnegative(),
  priceAnnual: z.number().nonnegative(),
  features: planFeaturesSchema,
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

export const updatePlanSchema = createPlanSchema.partial();

export const subscribePlanSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
  couponCode: z.string().optional(),
});

export const createMarketingServiceSchema = z.object({
  title: z.string().min(3, "Title is required").max(100),
  code: z.string().min(2, "Code is required").max(50),
  category: z.enum(["PHOTOSHOOT", "SOCIAL_PROMO", "LOCAL_SEO", "BANNER_AD", "FEATURED_CAMPAIGN"]),
  description: z.string().min(10, "Description is required").max(1000),
  price: z.number().positive("Price must be positive"),
  deliverables: z.array(z.string()).min(1, "At least 1 deliverable required"),
  isActive: z.boolean().default(true),
});

export const orderMarketingServiceSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  listingId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const createLeadPackageSchema = z.object({
  title: z.string().min(3).max(100),
  creditsCount: z.number().int().positive(),
  price: z.number().positive(),
  discountPercentage: z.number().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const purchaseLeadPackageSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
});

export const featureListingSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  targetType: z.enum(["ACCOMMODATION", "LIBRARY", "MESS"]),
  durationDays: z.number().int().positive().default(7),
  placementScope: z.enum(["SEARCH", "CATEGORY", "HOMEPAGE"]).default("SEARCH"),
});

export const verifyOwnerSchema = z.object({
  documentType: z.string().min(2, "Document type is required"),
  documentUrls: z.array(z.string().url()).min(1, "At least 1 document URL is required"),
  listingId: z.string().optional(),
});

export const reviewVerificationSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  rejectionReason: z.string().max(500).optional(),
  badgeType: z.enum(["VERIFIED_OWNER", "VERIFIED_LISTING"]).default("VERIFIED_OWNER"),
});

export const createReviewSchema = z.object({
  targetType: z.enum(["ACCOMMODATION", "LIBRARY", "MESS"]),
  targetId: z.string().min(1, "Target listing ID is required"),
  rating: z.number().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  comment: z.string().min(10, "Review comment must be at least 10 characters").max(2000),
  pros: z.array(z.string().max(100)).optional().default([]),
  cons: z.array(z.string().max(100)).optional().default([]),
  wouldRecommend: z.boolean().default(true),
  isAnonymous: z.boolean().default(false),
  images: z.array(z.string().url()).optional().default([]),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export const createReviewReplySchema = z.object({
  comment: z.string().min(5, "Reply must be at least 5 characters").max(1000),
});

export const reportReviewSchema = z.object({
  reason: z.enum(["FAKE_REVIEW", "SPAM", "ABUSIVE_LANGUAGE", "IRRELEVANT", "OTHER"]),
  details: z.string().max(500).optional(),
});

export const reactReviewSchema = z.object({
  type: z.enum(["HELPFUL", "LIKE"]),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(["APPROVED", "PENDING", "HIDDEN", "FLAGGED"]),
});

// =============================================
// STUDENT PREFERENCES
// =============================================
export const updateStudentPreferencesSchema = z.object({
  college: z.string().max(200).optional(),
  course: z.string().max(200).optional(),
  year: z.number().int().min(1).max(7).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  preferredAreas: z.array(z.string().max(100)).max(10).optional(),
  preferredFacilities: z.array(z.string().max(100)).max(20).optional(),
  favoriteCategories: z.array(z.string().max(50)).max(10).optional(),
  accommodationPreference: z.string().max(100).optional(),
  libraryType: z.string().max(100).optional(),
  genderPreference: z.enum(["MALE", "FEMALE", "ANY"]).optional(),
  studyHoursPerDay: z.number().min(0).max(24).optional(),
  transportationMode: z.string().max(100).optional(),
  lifestylePreferences: z.array(z.string().max(100)).max(15).optional(),
});

export const createSavedSearchSchema = z.object({
  query: z.string().max(200).optional(),
  filters: z.record(z.unknown()).optional(),
  targetType: z.string().max(50),
  label: z.string().max(100).optional(),
});

export const trackViewSchema = z.object({
  targetType: z.string().max(50),
  targetId: z.string().min(1),
  source: z
    .enum(["SEARCH", "RECOMMENDATION", "DIRECT", "TRENDING", "FEATURED", "SIMILAR", "HOME"])
    .optional(),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
});

// =============================================
// OWNER CRM
// =============================================
export const updatePipelineStageSchema = z.object({
  stage: z.enum([
    "NEW_LEAD",
    "CONTACTED",
    "VISIT_SCHEDULED",
    "VISITED",
    "NEGOTIATION",
    "CONVERTED",
    "LOST",
  ]),
  note: z.string().max(1000).optional(),
  lostReason: z.string().max(500).optional(),
  expectedConversionDate: z.string().datetime().optional(),
  dealValue: z.number().min(0).optional(),
});

export const addPipelineNoteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty").max(2000),
});

export const createFollowUpSchema = z.object({
  leadId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  type: z.enum(["CALL", "WHATSAPP", "EMAIL", "VISIT", "SMS"]),
  notes: z.string().max(1000).optional(),
  reminderAt: z.string().datetime().optional(),
});

export const createCRMTaskSchema = z.object({
  leadId: z.string().optional(),
  type: z.enum([
    "CALL_STUDENT",
    "WHATSAPP_STUDENT",
    "VISIT_REMINDER",
    "DOCUMENT_COLLECTION",
    "FOLLOW_UP",
    "CUSTOM",
  ]),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

// =============================================
// LOCATION INTELLIGENCE & GEOSPATIAL
// =============================================
export const geocodeQuerySchema = z.object({
  address: z.string().min(2, "Address is required").max(300),
  city: z.string().optional().default("Indore"),
});

export const reverseGeocodeSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const nearbyListingsQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().int().positive().default(5000),
  targetType: z.enum(["LIBRARY", "ACCOMMODATION", "ALL"]).default("ALL"),
  distanceMode: z.enum(["WALKING", "CYCLING", "DRIVING", "STRAIGHT"]).default("STRAIGHT"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const distanceMatrixQuerySchema = z.object({
  origins: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }),
    )
    .min(1)
    .max(25),
  destinations: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }),
    )
    .min(1)
    .max(25),
  mode: z.enum(["WALKING", "CYCLING", "DRIVING", "STRAIGHT"]).default("WALKING"),
});

export const createEducationCenterSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  type: z.enum([
    "COLLEGE",
    "UNIVERSITY",
    "COACHING_INSTITUTE",
    "SKILL_CENTER",
    "TRAINING_INSTITUTE",
    "STUDY_CENTER",
  ]),
  address: z.string().min(3, "Address is required").max(300),
  city: z.string().min(2).max(100).default("Indore"),
  state: z.string().min(2).max(100).default("Madhya Pradesh"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  googlePlaceId: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  logo: z.string().optional(),
  description: z.string().max(1000).optional(),
  isVerified: z.boolean().default(true),
  popularLandmarks: z.array(z.string()).optional(),
});

export const createStudyZoneSchema = z.object({
  name: z.string().min(2, "Zone name is required").max(100),
  description: z.string().max(1000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().default("Indore"),
  educationCenterIds: z.array(z.string()).optional(),
  image: z.string().optional(),
});
