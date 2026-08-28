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
  nextCursor?: string;
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
export type PropertyStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"
  | "ARCHIVED"
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PropertyLocation {
  address: string;
  city: CitySlug | string;
  state: string;
  zipCode: string;
  pincode?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
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
  verificationStatus?: VerificationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  moderationNotes?: string;
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

export type LibraryStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"
  | "ARCHIVED"
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

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
  pincode?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
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
  verificationStatus?: VerificationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  moderationNotes?: string;
  rejectionReason?: string;
  avgRating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mess / Tiffin Marketplace Domain Models
 */
export type MessProviderType = "mess" | "tiffin" | "home_kitchen" | "cloud_kitchen" | "catering";

export type MealType = "breakfast" | "lunch" | "dinner";

export type FoodPreference = "vegetarian" | "non_vegetarian" | "jain" | "eggetarian";

export type MealPlanDuration = "daily" | "weekly" | "15_day" | "monthly" | "custom";

export type MessStatus = LibraryStatus;

export type MessWeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface MessLocation {
  formattedAddress?: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  pincode?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  coordinates: GeoLocation;
}

export interface MessContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface MessPricing {
  startingMealPrice: number;
  currency: string;
}

export interface MessOperatingHours {
  openingTime: string;
  closingTime: string;
  openDays: string[];
  is24x7: boolean;
}

export interface MessMealPlan {
  id: string;
  name: string;
  description?: string;
  duration: MealPlanDuration;
  includedMeals: MealType[];
  price: number;
  deliveryIncluded: boolean;
  pauseAllowed: boolean;
  isActive: boolean;
}

export interface MessMenuItem {
  name: string;
  description?: string;
}

export interface MessDayMenu {
  day: MessWeekDay;
  breakfast: MessMenuItem[];
  lunch: MessMenuItem[];
  dinner: MessMenuItem[];
}

export interface MessProvider {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  providerType: MessProviderType;
  location: MessLocation;
  area: string;
  contact: MessContact;
  foodPreferences: (FoodPreference | string)[];
  mealTypes: (MealType | string)[];
  pricing: MessPricing;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  subscriptionAvailable: boolean;
  deliveryRadiusKm?: number;
  operatingHours: MessOperatingHours;
  images: string[];
  mealPlans: MessMealPlan[];
  weeklyMenu: MessDayMenu[];
  isVerified: boolean;
  status: MessStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  moderationNotes?: string;
  avgRating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MessSortBy = "recommended" | "price_asc" | "price_desc" | "rating" | "newest";

export interface MessFilters {
  search?: string;
  area?: string;
  providerType?: MessProviderType;
  foodPreference?: FoodPreference;
  mealType?: MealType;
  minPrice?: number;
  maxPrice?: number;
  delivery?: boolean;
  pickup?: boolean;
  subscription?: boolean;
  page?: number;
  limit?: number;
  sortBy?: MessSortBy;
}

export interface PaginatedMesses {
  items: MessProvider[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type EnquiryTargetType = "ACCOMMODATION" | "LIBRARY" | "MESS";
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

/**
 * Lead Management Domain Models & Telemetry
 */
export type LeadStatus =
  | "NEW"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "RESCHEDULED"
  | "VISITED"
  | "CONVERTED"
  | "CANCELLED";

export type LeadTargetType =
  | "ACCOMMODATION"
  | "LIBRARY"
  | "MESS"
  | "TIFFIN"
  | "LAUNDRY"
  | "COACHING"
  | "CAFE"
  | "PG"
  | "HOSTEL";

export type LeadSource = "DIRECT_ENQUIRY" | "VISIT_REQUEST" | "WHATSAPP_CLICK" | "CALL_CLICK";

export interface LeadRevenueMetadata {
  isSponsored?: boolean;
  isVerifiedOwner?: boolean;
  monetizationTier?: "free" | "standard" | "premium";
  leadCreditsCharged?: number;
}

export interface LeadTimeline {
  id: string;
  leadId: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  ownerId: string;
  note: string;
  scheduledFollowUpDate?: string;
  contactChannel?: "CALL" | "WHATSAPP" | "EMAIL" | "IN_PERSON";
  status: "PENDING" | "COMPLETED";
  createdAt: string;
}

export interface LeadTargetDetails {
  id: string;
  title: string;
  area: string;
  image?: string;
  link: string;
  propertyType?: string;
}

export interface LeadUserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface LeadOwnerDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Lead {
  id: string;
  studentId: string;
  student?: LeadUserDetails;
  ownerId: string;
  owner?: LeadOwnerDetails;
  targetType: LeadTargetType;
  targetId: string;
  targetDetails?: LeadTargetDetails;
  preferredDate?: string;
  preferredTime?: string;
  message: string;
  contactPhone: string;
  contactEmail?: string;
  status: LeadStatus;
  source: LeadSource;
  revenueMetadata?: LeadRevenueMetadata;
  timelines?: LeadTimeline[];
  followUps?: FollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  targetType: LeadTargetType;
  targetId: string;
  preferredDate?: string;
  preferredTime?: string;
  message: string;
  contactPhone?: string;
  contactEmail?: string;
  source?: LeadSource;
}

export interface UpdateLeadStatusDto {
  status: LeadStatus;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

export interface AddFollowUpDto {
  note: string;
  scheduledFollowUpDate?: string;
  contactChannel?: "CALL" | "WHATSAPP" | "EMAIL" | "IN_PERSON";
}

export interface OwnerLeadAnalytics {
  totalLeads: number;
  todayLeads: number;
  pendingLeads: number;
  acceptedLeads: number;
  rejectedLeads: number;
  visitedLeads: number;
  convertedLeads: number;
  cancelledLeads: number;
  conversionRate: number;
}

export interface AdminLeadAnalytics {
  totalLeads: number;
  todayLeads: number;
  weeklyLeads: number;
  monthlyLeads: number;
  conversionRate: number;
  topListings: Array<{ id: string; title: string; targetType: string; count: number }>;
  topOwners: Array<{ id: string; name: string; email: string; count: number }>;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
}

/**
 * Listing Moderation & Verification Domain Types
 */
export type ModerationStatus =
  "DRAFT" | "PENDING_REVIEW" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED" | "ARCHIVED";

export type ModerationAction =
  | "SUBMIT"
  | "START_REVIEW"
  | "APPROVE"
  | "REJECT"
  | "SUSPEND"
  | "ARCHIVE"
  | "RESTORE"
  | "ASSIGN_MODERATOR"
  | "ADD_COMMENT";

export type VerificationStatus = "UNVERIFIED" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";

export interface ModerationHistory {
  id: string;
  targetType: string;
  targetId: string;
  action: ModerationAction;
  previousStatus?: ModerationStatus | string;
  newStatus: ModerationStatus | string;
  moderatorId?: string;
  moderatorName?: string;
  reason?: string;
  notes?: string;
  timestamp: string;
}

export interface ModerationComment {
  id: string;
  targetType: string;
  targetId: string;
  authorId: string;
  authorName?: string;
  authorRole: string;
  comment: string;
  isInternalOnly: boolean;
  createdAt: string;
}

export interface ModerationQueueItem {
  id: string;
  targetType: string;
  targetId: string;
  title: string;
  area: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  status: ModerationStatus | string;
  verificationStatus?: VerificationStatus;
  submittedAt?: string;
  assignedModeratorId?: string;
  assignedModeratorName?: string;
  rejectionReason?: string;
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminModerationAnalytics {
  pendingCount: number;
  underReviewCount: number;
  approvedTodayCount: number;
  rejectedTodayCount: number;
  totalApproved: number;
  totalRejected: number;
  totalSuspended: number;
  averageReviewTimeHours: number;
  topModerators: Array<{ id: string; name: string; email: string; reviewsCount: number }>;
}

/**
 * Search & Discovery Engine Domain Types
 */
export type SearchTargetType =
  | "ALL"
  | "ACCOMMODATION"
  | "LIBRARY"
  | "HOSTEL"
  | "COACHING"
  | "CAFE"
  | "LAUNDRY"
  | "BIKE_RENTAL"
  | "TIFFIN";

export type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "popularity_desc"
  | "distance_asc";

export interface SearchQueryParams {
  q?: string;
  targetType?: SearchTargetType;
  city?: string;
  area?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  propertyType?: string;
  roomType?: string;
  bhk?: number;
  furnishing?: string;
  tenantType?: string;
  ac?: boolean;
  wifi?: boolean;
  powerBackup?: boolean;
  parking?: boolean;
  cctv?: boolean;
  locker?: boolean;
  is24x7?: boolean;
  foodProvided?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  isAvailable?: boolean;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface SearchResultItem {
  id: string;
  targetType: "ACCOMMODATION" | "LIBRARY" | string;
  title: string;
  slug?: string;
  description: string;
  image?: string;
  images: string[];
  area: string;
  city: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: [number, number];
  };
  price: number;
  pricingLabel: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured?: boolean;
  status: string;
  attributes: Record<string, unknown>;
  ownerName?: string;
  createdAt: string;
}

export interface SearchSuggestionItem {
  title: string;
  type: "listing" | "area" | "college" | "city";
  category: "ACCOMMODATION" | "LIBRARY" | "GENERAL";
  id?: string;
  area?: string;
  city?: string;
}

export interface SearchSuggestionResponse {
  suggestions: SearchSuggestionItem[];
  trendingAreas: string[];
  popularSearches: string[];
  nearbyColleges: string[];
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  targetType?: string;
  filters?: Record<string, unknown>;
  createdAt: string;
}

export interface SavedSearchItem {
  id: string;
  userId: string;
  name: string;
  query: string;
  targetType?: string;
  filters?: Record<string, unknown>;
  notifyNewListings: boolean;
  createdAt: string;
}

export interface AdminSearchAnalytics {
  totalSearches: number;
  topKeywords: Array<{ query: string; count: number }>;
  zeroResultQueries: Array<{ query: string; count: number }>;
  topAreas: Array<{ area: string; count: number }>;
  popularFilters: Array<{ filter: string; count: number }>;
  searchToLeadConversionRate: number;
}

/**
 * Revenue & Monetization Engine Domain Types
 */
export type PlanTier = "FREE" | "STARTER" | "PRO" | "BUSINESS";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "TRIALING" | "PENDING";
export type BillingCycle = "MONTHLY" | "ANNUAL";
export type MarketingServiceCategory =
  "PHOTOSHOOT" | "SOCIAL_PROMO" | "LOCAL_SEO" | "BANNER_AD" | "FEATURED_CAMPAIGN";
export type MarketingOrderStatus = "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface PlanFeatureConfig {
  maxListings: number; // -1 for unlimited
  monthlyLeadLimit: number; // -1 for unlimited
  featuredListingsIncluded: number;
  marketingCreditsIncluded: number;
  verifiedBadge: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  leadExport: boolean;
  homepageBanner: boolean;
  sponsoredListingsAllowed: boolean;
  customFeatures?: string[];
}

export interface PlanDTO {
  id: string;
  name: PlanTier | string;
  code: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: PlanFeatureConfig;
  isActive: boolean;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionDTO {
  id: string;
  ownerId: string;
  planId: string;
  plan?: PlanDTO;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  pricePaid: number;
  paymentGateway?: string;
  transactionId?: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageDTO {
  id: string;
  ownerId: string;
  activeListingsCount: number;
  totalLeadsReceived: number;
  monthlyLeadsReceived: number;
  featuredListingsUsed: number;
  marketingCreditsUsed: number;
  leadCreditsBalance: number;
  lastResetDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingServiceDTO {
  id: string;
  title: string;
  code: string;
  category: MarketingServiceCategory;
  description: string;
  price: number;
  deliverables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingOrderDTO {
  id: string;
  ownerId: string;
  serviceId: string;
  service?: MarketingServiceDTO;
  listingId?: string;
  status: MarketingOrderStatus;
  notes?: string;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPackageDTO {
  id: string;
  title: string;
  creditsCount: number;
  price: number;
  discountPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedListingDTO {
  id: string;
  listingId: string;
  targetType: "ACCOMMODATION" | "LIBRARY" | string;
  ownerId: string;
  durationDays: number; // 7, 15, 30
  placementScope: "SEARCH" | "CATEGORY" | "HOMEPAGE";
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDTO {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  listingId?: string;
  status: "NOT_REQUESTED" | "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  documentType?: string;
  documentUrls: string[];
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  badgeType: "VERIFIED_OWNER" | "VERIFIED_LISTING";
  createdAt: string;
  updatedAt: string;
}

export interface MonetizationAnalyticsDTO {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptionsCount: number;
  subscriptionsByPlan: Record<string, number>;
  pendingVerificationsCount: number;
  completedMarketingOrdersCount: number;
  leadCreditsPurchasedCount: number;
}

export type ReviewStatus = "APPROVED" | "PENDING" | "HIDDEN" | "FLAGGED";
export type ReactionType = "HELPFUL" | "LIKE";
export type ReportReason = "FAKE_REVIEW" | "SPAM" | "ABUSIVE_LANGUAGE" | "IRRELEVANT" | "OTHER";

export interface ReviewReplyDTO {
  id: string;
  reviewId: string;
  ownerId: string;
  ownerName?: string;
  ownerAvatar?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDTO {
  id: string;
  targetType: "ACCOMMODATION" | "LIBRARY" | string;
  targetId: string;
  listingTitle?: string;
  ownerId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  leadId?: string;
  isVerifiedPurchase: boolean;
  rating: number; // 1-5
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  isAnonymous: boolean;
  images: string[];
  videoUrl?: string;
  status: ReviewStatus;
  helpfulCount: number;
  reportCount: number;
  userReaction?: ReactionType;
  reply?: ReviewReplyDTO;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReactionDTO {
  id: string;
  reviewId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}

export interface ReviewReportDTO {
  id: string;
  reviewId: string;
  reviewTitle?: string;
  reporterId: string;
  reporterName?: string;
  reason: ReportReason;
  details?: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: string;
}

export interface OwnerScoreDTO {
  id: string;
  ownerId: string;
  score: number; // 0-100
  profileCompletionScore: number;
  verifiedStatusScore: number;
  responseTimeScore: number;
  reviewRatingScore: number;
  leadConversionScore: number;
  listingQualityScore: number;
  spamPenaltyScore: number;
  totalReviewsCount: number;
  averageRating: number;
  leadAcceptanceRate: number;
  avgResponseTimeMinutes: number;
  yearsOnPlatform: number;
  updatedAt: string;
}

export interface BadgeDTO {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface OwnerPublicProfileDTO {
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  ownerType?: string;
  verificationStatus: "UNVERIFIED" | "PENDING_VERIFICATION" | "VERIFIED";
  isVerified: boolean;
  performanceScore: number; // 0-100
  scoreBreakdown: OwnerScoreDTO;
  totalListings: number;
  averageRating: number;
  totalReviewsCount: number;
  leadAcceptanceRate: number;
  avgResponseTimeMinutes: number;
  yearsOnPlatform: number;
  badges: BadgeDTO[];
  listings: Array<{
    id: string;
    title: string;
    targetType: string;
    city: string;
    area: string;
    price: number;
    images: string[];
    averageRating: number;
    reviewsCount: number;
    status: string;
  }>;
}

export interface ReviewAnalyticsDTO {
  averageRating: number;
  totalReviews: number;
  recommendationPercentage: number;
  ratingDistribution: Record<number, number>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  mostMentionedPros: Array<{ text: string; count: number }>;
  mostMentionedCons: Array<{ text: string; count: number }>;
}

export interface AdminReviewAnalyticsDTO {
  totalReviews: number;
  pendingReportsCount: number;
  hiddenReviewsCount: number;
  mostReviewedListings: Array<{
    targetId: string;
    title: string;
    targetType: string;
    reviewsCount: number;
    averageRating: number;
  }>;
  lowRatedOwners: Array<{
    ownerId: string;
    name: string;
    averageRating: number;
    reviewsCount: number;
    performanceScore: number;
  }>;
}

// =============================================
// RECOMMENDATION ENGINE DTOs
// =============================================

export interface StudentPreferenceDTO {
  id: string;
  userId: string;
  college?: string;
  course?: string;
  year?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredAreas: string[];
  preferredFacilities: string[];
  favoriteCategories: string[];
  accommodationPreference?: string;
  libraryType?: string;
  genderPreference?: "MALE" | "FEMALE" | "ANY";
  studyHoursPerDay?: number;
  transportationMode?: string;
  lifestylePreferences: string[];
  lastUpdated: string;
}

export interface ViewHistoryDTO {
  id: string;
  userId: string;
  targetType: string;
  targetId: string;
  targetTitle: string;
  targetArea?: string;
  targetImage?: string;
  targetRating?: number;
  targetPrice?: number;
  viewedAt: string;
  durationSeconds?: number;
  source: string;
}

export interface SavedSearchDTO {
  id: string;
  userId: string;
  query?: string;
  filters: Record<string, unknown>;
  targetType: string;
  savedAt: string;
  hitCount: number;
  label?: string;
}

export interface RecommendationDTO {
  id: string;
  targetType: string;
  targetId: string;
  score: number;
  reasons: string[];
  listing: {
    id: string;
    title: string;
    area: string;
    city: string;
    price?: number;
    rating?: number;
    reviewsCount?: number;
    images?: string[];
    isVerified?: boolean;
    ownerName?: string;
  };
  isViewed: boolean;
  isClicked: boolean;
  isSaved: boolean;
  generatedAt: string;
}

export interface HomePageFeedDTO {
  recommendedForYou: RecommendationDTO[];
  popularNearYou: RecommendationDTO[];
  recentlyViewed: ViewHistoryDTO[];
  trendingLibraries: RecommendationDTO[];
  trendingProperties: RecommendationDTO[];
  newListings: RecommendationDTO[];
  featuredListings: RecommendationDTO[];
  budgetFriendly: RecommendationDTO[];
  premiumPicks: RecommendationDTO[];
  hasPreferences: boolean;
}

export interface ListingViewAnalyticsDTO {
  listingId: string;
  targetType: string;
  title: string;
  totalViews: number;
  uniqueViews: number;
  totalSaves: number;
  leads: number;
  conversionRate: number;
  searchImpressions: number;
  ctr: number;
  avgViewDurationSeconds: number;
  viewsByDay: Array<{ date: string; views: number }>;
  topSources: Array<{ source: string; count: number }>;
}

export interface OwnerListingAnalyticsDTO {
  totalViews: number;
  totalSaves: number;
  totalLeads: number;
  overallCTR: number;
  listings: ListingViewAnalyticsDTO[];
}

// =============================================
// OWNER CRM DTOs
// =============================================

export interface PipelineNoteDTO {
  text: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface PipelineStageHistoryDTO {
  from: string;
  to: string;
  changedAt: string;
  changedBy: string;
}

export interface LeadPipelineDTO {
  id: string;
  leadId: string;
  ownerId: string;
  stage: string;
  priority: string;
  notes: PipelineNoteDTO[];
  stageHistory: PipelineStageHistoryDTO[];
  expectedConversionDate?: string;
  dealValue?: number;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    id: string;
    studentId: string;
    studentName: string;
    studentPhone: string;
    targetType: string;
    targetTitle: string;
    message: string;
    preferredDate?: string;
    status: string;
    createdAt: string;
  };
}

export interface FollowUpDTO {
  id: string;
  leadId: string;
  ownerId: string;
  scheduledAt: string;
  type: string;
  notes?: string;
  status: string;
  completedAt?: string;
  reminder?: {
    reminderAt: string;
    status: string;
  };
  createdAt: string;
}

export interface CRMTaskDTO {
  id: string;
  ownerId: string;
  leadId?: string;
  type: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
}

export interface ActivityLogDTO {
  id: string;
  ownerId: string;
  leadId: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface CRMAnalyticsDTO {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  avgResponseTimeMinutes: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  leadsByStage: Record<string, number>;
  monthlyLeads: Array<{ month: string; count: number; converted: number }>;
  todayReminders: number;
  tomorrowReminders: number;
  overdueReminders: number;
}

export interface AdminCRMAnalyticsDTO {
  totalPlatformLeads: number;
  totalConversions: number;
  platformConversionRate: number;
  topOwnersByConversion: Array<{
    ownerId: string;
    ownerName: string;
    totalLeads: number;
    converted: number;
    conversionRate: number;
    avgResponseTimeMinutes: number;
  }>;
  popularCities: Array<{ city: string; count: number }>;
  popularColleges: Array<{ college: string; count: number }>;
  mostViewedListings: Array<{
    listingId: string;
    title: string;
    targetType: string;
    views: number;
  }>;
  mostSavedListings: Array<{
    listingId: string;
    title: string;
    targetType: string;
    saves: number;
  }>;
  highestConversionAreas: Array<{ area: string; conversionRate: number; leads: number }>;
}

// ─── Location Intelligence & Education Ecosystem DTOs ──────────────────────────

export interface GeoJSONPointDTO {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface LocationObjectDTO {
  formattedAddress: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  coordinates: GeoJSONPointDTO;
}

export interface GeocodeResultDTO {
  formattedAddress: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
}

export interface DistanceMatrixResultDTO {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationText: string;
  distanceText: string;
  mode: "WALKING" | "CYCLING" | "DRIVING" | "STRAIGHT";
}

export interface EducationCenterDTO {
  id: string;
  name: string;
  slug: string;
  type:
    | "COLLEGE"
    | "UNIVERSITY"
    | "COACHING_INSTITUTE"
    | "SKILL_CENTER"
    | "TRAINING_INSTITUTE"
    | "STUDY_CENTER";
  address: string;
  city: string;
  state: string;
  country?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  website?: string;
  phone?: string;
  logo?: string;
  description?: string;
  isVerified: boolean;
  popularLandmarks?: string[];
  nearbyLibrariesCount?: number;
  nearbyPropertiesCount?: number;
  createdAt: string;
}

export interface StudyZoneDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  latitude: number;
  longitude: number;
  city: string;
  educationCenterIds: string[];
  educationCenters?: EducationCenterDTO[];
  topLibrariesCount?: number;
  topPropertiesCount?: number;
  image?: string;
}

export interface AreaSuggestionDTO {
  id: string;
  name: string;
  type: "AREA" | "STUDY_ZONE" | "EDUCATION_CENTER" | "CITY";
  city: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
}
