import type { FilterQuery, SortOrder } from "mongoose";
import mongoose from "mongoose";
import { StudentPreferenceModel } from "../models/student-preference.model.js";
import { ViewHistoryModel } from "../models/view-history.model.js";
import { SavedSearchModel } from "../models/saved-search.model.js";
import { LibraryModel } from "../models/library.model.js";
import { PropertyModel } from "../models/property.model.js";
import { LeadModel } from "../models/lead.model.js";
import type { IStudentPreference } from "../models/student-preference.model.js";
import type { RecommendationReasonConstant } from "@studenthub/constants";
import type {
  StudentPreferenceDTO,
  RecommendationDTO,
  ViewHistoryDTO,
  SavedSearchDTO,
  HomePageFeedDTO,
  OwnerListingAnalyticsDTO,
  ListingViewAnalyticsDTO,
} from "@studenthub/types";

// ─── Scoring Weights (rule-based v1.0) ────────────────────────────────────────
// These are the feature weights for the scoring engine.
// When migrating to ML, these weights will be replaced by model outputs.
const WEIGHTS = {
  BUDGET_MATCH: 0.3,
  LOCATION_MATCH: 0.25,
  FACILITY_MATCH: 0.2,
  RATING: 0.15,
  POPULARITY: 0.1,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toListingShape(doc: Record<string, unknown>, _targetType: string) {
  return {
    id: String(doc._id ?? doc.id),
    title: (doc.name ?? doc.title ?? "") as string,
    area: (doc.area ?? "") as string,
    city: (doc.city ?? "Indore") as string,
    price: (doc.monthlyFee ?? doc.rent ?? doc.price ?? undefined) as number | undefined,
    rating: (doc.rating ?? 0) as number,
    reviewsCount: (doc.reviewsCount ?? 0) as number,
    images: (Array.isArray(doc.images) ? doc.images.slice(0, 1) : []) as string[],
    isVerified: Boolean(doc.isVerified),
    ownerName: (doc.ownerName ?? "") as string,
  };
}

function buildRecommendationDTO(
  doc: Record<string, unknown>,
  targetType: string,
  score: number,
  reasons: RecommendationReasonConstant[],
): RecommendationDTO {
  return {
    id: String(doc._id ?? doc.id),
    targetType,
    targetId: String(doc._id ?? doc.id),
    score,
    reasons,
    listing: toListingShape(doc, targetType),
    isViewed: false,
    isClicked: false,
    isSaved: false,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────

/**
 * Rule-based relevance score for a listing against student preferences.
 * Returns a 0-100 score and the reasons that contributed to it.
 *
 * This function is the ML integration boundary:
 * - For ML integration, replace the body of this function with a call to your model inference service.
 * - The signature must remain stable: (listing, prefs) => { score, reasons }
 */
function calculateRelevanceScore(
  listing: Record<string, unknown>,
  prefs: Record<string, unknown> | IStudentPreference | null,
): { score: number; reasons: RecommendationReasonConstant[] } {
  let score = 50; // base score
  const reasons: RecommendationReasonConstant[] = [];

  const p = prefs as Record<string, unknown> | null;

  if (!p) {
    // No preferences — fall back to rating + popularity
    const rating = Number(listing.rating ?? 0);
    const popularity = Math.min(Number(listing.reviewsCount ?? 0), 100) / 100;
    score = rating * 10 * WEIGHTS.RATING * 10 + popularity * 10 * WEIGHTS.POPULARITY * 10 + 40;
    return { score: Math.min(100, Math.round(score)), reasons: ["HIGH_RATED"] };
  }

  // Budget match (0-30 pts)
  const price = Number(listing.monthlyFee ?? listing.rent ?? listing.price ?? 0);
  const budgetMin = p.budgetMin as number | undefined;
  const budgetMax = p.budgetMax as number | undefined;
  if (price > 0 && budgetMin != null && budgetMax != null) {
    if (price >= budgetMin && price <= budgetMax) {
      score += WEIGHTS.BUDGET_MATCH * 100;
      reasons.push("BUDGET_MATCH");
    } else if (price < budgetMin * 1.2) {
      score += WEIGHTS.BUDGET_MATCH * 50;
    }
  }

  // Location match (0-25 pts)
  const listingArea = String(listing.area ?? "").toLowerCase();
  const preferredAreas = (p.preferredAreas as string[] | undefined) ?? [];
  if (preferredAreas.some((a) => listingArea.includes(a.toLowerCase()))) {
    score += WEIGHTS.LOCATION_MATCH * 100;
    reasons.push("LOCATION_MATCH");
  }

  // Facility match (0-20 pts)
  const listingFacilities = (listing.amenities ?? listing.facilities ?? []) as string[];
  const preferredFacilities = (p.preferredFacilities as string[] | undefined) ?? [];
  if (preferredFacilities.length > 0 && listingFacilities.length > 0) {
    const matched = preferredFacilities.filter((f) =>
      listingFacilities.some((lf: string) => lf.toLowerCase().includes(f.toLowerCase())),
    ).length;
    const matchRatio = matched / preferredFacilities.length;
    score += matchRatio * WEIGHTS.FACILITY_MATCH * 100;
    if (matchRatio > 0.5) reasons.push("INTEREST_MATCH");
  }

  // Rating (0-15 pts)
  const rating = Number(listing.rating ?? 0);
  score += (rating / 5) * WEIGHTS.RATING * 100;
  if (rating >= 4.5) reasons.push("HIGH_RATED");

  // Popularity (0-10 pts)
  const reviewsCount = Math.min(Number(listing.reviewsCount ?? 0), 100);
  score += (reviewsCount / 100) * WEIGHTS.POPULARITY * 100;

  // New listing bonus
  const createdAt = listing.createdAt as Date | undefined;
  if (createdAt && Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) {
    score += 5;
    reasons.push("NEW_LISTING");
  }

  // Verified owner bonus
  if (listing.isVerified) {
    score += 3;
    reasons.push("VERIFIED_OWNER");
  }

  if (reasons.length === 0) reasons.push("TRENDING");

  return { score: Math.min(100, Math.round(score)), reasons };
}

/**
 * Collaborative filtering stub — ready for ML model injection.
 * Currently applies a small popularity boost to co-viewed listings.
 */
async function applyCollaborativeFilter(
  userId: string,
  candidates: RecommendationDTO[],
): Promise<RecommendationDTO[]> {
  const userLeads = await LeadModel.find(
    { studentId: new mongoose.Types.ObjectId(userId) },
    { targetId: 1, targetType: 1 },
  )
    .limit(20)
    .lean();

  const myTargetIds = new Set(userLeads.map((l) => String(l.targetId)));

  return candidates.map((c) => {
    if (myTargetIds.has(c.targetId)) {
      return {
        ...c,
        score: Math.min(100, c.score + 5),
        reasons: [...c.reasons, "RECENTLY_VIEWED"],
      };
    }
    return c;
  });
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getStudentPreferences(userId: string): Promise<StudentPreferenceDTO | null> {
  const pref = await StudentPreferenceModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();
  if (!pref) return null;
  return {
    id: String(pref._id),
    userId: String(pref.userId),
    college: pref.college,
    course: pref.course,
    year: pref.year,
    budgetMin: pref.budgetMin,
    budgetMax: pref.budgetMax,
    preferredAreas: pref.preferredAreas,
    preferredFacilities: pref.preferredFacilities,
    favoriteCategories: pref.favoriteCategories,
    accommodationPreference: pref.accommodationPreference,
    libraryType: pref.libraryType,
    genderPreference: pref.genderPreference,
    studyHoursPerDay: pref.studyHoursPerDay,
    transportationMode: pref.transportationMode,
    lifestylePreferences: pref.lifestylePreferences,
    lastUpdated: pref.lastUpdated.toISOString(),
  };
}

export async function upsertStudentPreferences(
  userId: string,
  data: Partial<IStudentPreference>,
): Promise<StudentPreferenceDTO> {
  const pref = await StudentPreferenceModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { ...data, userId: new mongoose.Types.ObjectId(userId), lastUpdated: new Date() },
    { upsert: true, new: true, runValidators: true },
  ).lean();

  if (!pref) throw new Error("Failed to save preferences");

  return {
    id: String(pref._id),
    userId: String(pref.userId),
    college: pref.college,
    course: pref.course,
    year: pref.year,
    budgetMin: pref.budgetMin,
    budgetMax: pref.budgetMax,
    preferredAreas: pref.preferredAreas,
    preferredFacilities: pref.preferredFacilities,
    favoriteCategories: pref.favoriteCategories,
    accommodationPreference: pref.accommodationPreference,
    libraryType: pref.libraryType,
    genderPreference: pref.genderPreference,
    studyHoursPerDay: pref.studyHoursPerDay,
    transportationMode: pref.transportationMode,
    lifestylePreferences: pref.lifestylePreferences,
    lastUpdated: pref.lastUpdated.toISOString(),
  };
}

export async function getRecommendedForUser(
  userId: string,
  targetType: "LIBRARY" | "ACCOMMODATION" | "ALL",
  limit = 10,
): Promise<RecommendationDTO[]> {
  const prefs = await StudentPreferenceModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  const query: FilterQuery<unknown> = { status: "APPROVED" };

  const libraries: RecommendationDTO[] = [];
  const properties: RecommendationDTO[] = [];

  if (targetType === "LIBRARY" || targetType === "ALL") {
    const libs = await LibraryModel.find(query).limit(40).lean();
    for (const lib of libs) {
      const doc = lib as Record<string, unknown>;
      const { score, reasons } = calculateRelevanceScore(doc, prefs);
      libraries.push(buildRecommendationDTO(doc, "LIBRARY", score, reasons));
    }
  }

  if (targetType === "ACCOMMODATION" || targetType === "ALL") {
    const props = await PropertyModel.find(query).limit(40).lean();
    for (const prop of props) {
      const doc = prop as Record<string, unknown>;
      const { score, reasons } = calculateRelevanceScore(doc, prefs);
      properties.push(buildRecommendationDTO(doc, "ACCOMMODATION", score, reasons));
    }
  }

  let combined = [...libraries, ...properties]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit * 3);
  combined = await applyCollaborativeFilter(userId, combined);
  return combined.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getTrendingListings(
  targetType: "LIBRARY" | "ACCOMMODATION",
  area?: string,
  limit = 10,
): Promise<RecommendationDTO[]> {
  const query: FilterQuery<unknown> = { status: "APPROVED" };
  if (area) query.area = { $regex: area, $options: "i" };

  const sort: Record<string, SortOrder> = { rating: -1, reviewsCount: -1, createdAt: -1 };
  const docs =
    targetType === "LIBRARY"
      ? await LibraryModel.find(query).sort(sort).limit(limit).lean()
      : await PropertyModel.find(query).sort(sort).limit(limit).lean();

  return docs.map((d) => {
    const doc = d as Record<string, unknown>;
    const { score, reasons } = calculateRelevanceScore(doc, null);
    return buildRecommendationDTO(doc, targetType, score, ["TRENDING", ...reasons]);
  });
}

export async function getPopularNearMe(
  area: string,
  targetType: "LIBRARY" | "ACCOMMODATION",
  limit = 8,
): Promise<RecommendationDTO[]> {
  return getTrendingListings(targetType, area, limit);
}

export async function getSimilarListings(
  targetId: string,
  targetType: "LIBRARY" | "ACCOMMODATION",
  limit = 6,
): Promise<RecommendationDTO[]> {
  const source =
    targetType === "LIBRARY"
      ? await LibraryModel.findById(targetId).lean()
      : await PropertyModel.findById(targetId).lean();
  if (!source) return [];

  const src = source as Record<string, unknown>;
  const similarQuery: FilterQuery<unknown> = {
    _id: { $ne: new mongoose.Types.ObjectId(targetId) },
    status: "APPROVED",
    area: src.area as string | undefined,
  };

  const docs =
    targetType === "LIBRARY"
      ? await LibraryModel.find(similarQuery)
          .limit(limit * 2)
          .lean()
      : await PropertyModel.find(similarQuery)
          .limit(limit * 2)
          .lean();

  return docs
    .map((d) => {
      const doc = d as Record<string, unknown>;
      const { score, reasons } = calculateRelevanceScore(doc, null);
      return buildRecommendationDTO(doc, targetType, score, ["SIMILAR_TO_SAVED", ...reasons]);
    })
    .slice(0, limit);
}

export async function getNewListings(targetType?: string, limit = 8): Promise<RecommendationDTO[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const query: FilterQuery<unknown> = { status: "APPROVED", createdAt: { $gte: sevenDaysAgo } };

  const results: RecommendationDTO[] = [];
  if (!targetType || targetType === "LIBRARY") {
    const libs = await LibraryModel.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    results.push(
      ...libs.map((d) =>
        buildRecommendationDTO(d as Record<string, unknown>, "LIBRARY", 70, ["NEW_LISTING"]),
      ),
    );
  }
  if (!targetType || targetType === "ACCOMMODATION") {
    const props = await PropertyModel.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    results.push(
      ...props.map((d) =>
        buildRecommendationDTO(d as Record<string, unknown>, "ACCOMMODATION", 70, ["NEW_LISTING"]),
      ),
    );
  }
  return results.slice(0, limit);
}

export async function getBudgetFriendly(limit = 8): Promise<RecommendationDTO[]> {
  const results: RecommendationDTO[] = [];
  const libs = await LibraryModel.find({ status: "APPROVED", monthlyFee: { $lte: 3000 } })
    .sort({ rating: -1 })
    .limit(limit)
    .lean();
  results.push(
    ...libs.map((d) =>
      buildRecommendationDTO(d as Record<string, unknown>, "LIBRARY", 60, ["BUDGET_MATCH"]),
    ),
  );
  return results;
}

export async function getPremiumPicks(limit = 8): Promise<RecommendationDTO[]> {
  const results: RecommendationDTO[] = [];
  const libs = await LibraryModel.find({
    status: "APPROVED",
    rating: { $gte: 4.0 },
    isVerified: true,
  })
    .sort({ rating: -1, reviewsCount: -1 })
    .limit(limit)
    .lean();
  results.push(
    ...libs.map((d) =>
      buildRecommendationDTO(d as Record<string, unknown>, "LIBRARY", 90, [
        "HIGH_RATED",
        "VERIFIED_OWNER",
      ]),
    ),
  );
  const props = await PropertyModel.find({
    status: "APPROVED",
    rating: { $gte: 4.0 },
    isVerified: true,
  })
    .sort({ rating: -1, reviewsCount: -1 })
    .limit(limit)
    .lean();
  results.push(
    ...props.map((d) =>
      buildRecommendationDTO(d as Record<string, unknown>, "ACCOMMODATION", 90, [
        "HIGH_RATED",
        "VERIFIED_OWNER",
      ]),
    ),
  );
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getPersonalizedFeed(userId: string | null): Promise<HomePageFeedDTO> {
  const [
    recommendedForYou,
    trendingLibraries,
    trendingProperties,
    newListings,
    budgetFriendly,
    premiumPicks,
    recentlyViewed,
  ] = await Promise.all([
    userId ? getRecommendedForUser(userId, "ALL", 10) : Promise.resolve([]),
    getTrendingListings("LIBRARY", undefined, 10),
    getTrendingListings("ACCOMMODATION", undefined, 10),
    getNewListings(undefined, 10),
    getBudgetFriendly(8),
    getPremiumPicks(8),
    userId ? getRecentlyViewed(userId, 8) : Promise.resolve([]),
  ]);

  const prefs = userId
    ? await StudentPreferenceModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean()
    : null;

  const popularNearYou = prefs?.preferredAreas?.[0]
    ? await getPopularNearMe(prefs.preferredAreas[0], "LIBRARY", 8)
    : trendingLibraries.slice(0, 8);

  return {
    recommendedForYou,
    popularNearYou,
    recentlyViewed,
    trendingLibraries,
    trendingProperties,
    newListings,
    featuredListings: premiumPicks,
    budgetFriendly,
    premiumPicks,
    hasPreferences: !!prefs,
  };
}

export async function trackView(
  userId: string,
  targetType: string,
  targetId: string,
  source: string,
  durationSeconds?: number,
): Promise<void> {
  const listing =
    targetType === "LIBRARY"
      ? await LibraryModel.findById(targetId).lean()
      : await PropertyModel.findById(targetId).lean();
  if (!listing) return;

  const doc = listing as Record<string, unknown>;

  // Upsert: if viewed in last 30 min, update duration instead of creating duplicate
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  await ViewHistoryModel.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      viewedAt: { $gte: thirtyMinsAgo },
    },
    {
      $set: {
        durationSeconds,
        source,
        targetTitle: (doc.name ?? doc.title ?? "") as string,
        targetArea: doc.area as string | undefined,
        targetRating: doc.rating as number | undefined,
        targetPrice: (doc.monthlyFee ?? doc.rent) as number | undefined,
      },
    },
    { upsert: true },
  );
}

export async function getRecentlyViewed(userId: string, limit = 8): Promise<ViewHistoryDTO[]> {
  const docs = await ViewHistoryModel.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ viewedAt: -1 })
    .limit(limit)
    .lean();

  return docs.map((d) => ({
    id: String(d._id),
    userId: String(d.userId),
    targetType: d.targetType,
    targetId: String(d.targetId),
    targetTitle: d.targetTitle,
    targetArea: d.targetArea,
    targetImage: d.targetImage,
    targetRating: d.targetRating,
    targetPrice: d.targetPrice,
    viewedAt: d.viewedAt.toISOString(),
    durationSeconds: d.durationSeconds,
    source: d.source,
  }));
}

export async function saveSearch(
  userId: string,
  data: { query?: string; filters?: Record<string, unknown>; targetType: string; label?: string },
): Promise<SavedSearchDTO> {
  const doc = await SavedSearchModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), query: data.query, targetType: data.targetType },
    {
      $inc: { hitCount: 1 },
      $set: { filters: data.filters ?? {}, label: data.label, savedAt: new Date() },
      $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), targetType: data.targetType },
    },
    { upsert: true, new: true },
  ).lean();

  if (!doc) throw new Error("Failed to save search");

  return {
    id: String(doc._id),
    userId: String(doc.userId),
    query: doc.query,
    filters: doc.filters as Record<string, unknown>,
    targetType: doc.targetType,
    savedAt: doc.savedAt.toISOString(),
    hitCount: doc.hitCount,
    label: doc.label,
  };
}

export async function getSavedSearches(userId: string): Promise<SavedSearchDTO[]> {
  const docs = await SavedSearchModel.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ savedAt: -1 })
    .limit(20)
    .lean();

  return docs.map((d) => ({
    id: String(d._id),
    userId: String(d.userId),
    query: d.query,
    filters: d.filters as Record<string, unknown>,
    targetType: d.targetType,
    savedAt: d.savedAt.toISOString(),
    hitCount: d.hitCount,
    label: d.label,
  }));
}

// ─── Owner Listing Analytics ──────────────────────────────────────────────────

export async function getOwnerListingAnalytics(ownerId: string): Promise<OwnerListingAnalyticsDTO> {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const [libraries, properties] = await Promise.all([
    LibraryModel.find({ ownerId: ownerObjectId }).lean(),
    PropertyModel.find({ ownerId: ownerObjectId }).lean(),
  ]);

  const allListings = [
    ...libraries.map((l) => ({ ...l, _type: "LIBRARY" })),
    ...properties.map((p) => ({ ...p, _type: "ACCOMMODATION" })),
  ];

  const listingAnalytics: ListingViewAnalyticsDTO[] = [];
  let totalViews = 0;
  let totalSaves = 0;
  let totalLeads = 0;

  for (const listing of allListings) {
    const doc = listing as Record<string, unknown>;
    const listingId = String(doc._id);
    const targetType = doc._type as string;

    const [views, leads] = await Promise.all([
      ViewHistoryModel.find({
        targetType,
        targetId: new mongoose.Types.ObjectId(listingId),
      }).lean(),
      LeadModel.countDocuments({
        targetType: targetType === "ACCOMMODATION" ? "ACCOMMODATION" : "LIBRARY",
        targetId: new mongoose.Types.ObjectId(listingId),
      }),
    ]);

    const uniqueViewers = new Set(views.map((v) => String(v.userId))).size;
    const conversionRate = views.length > 0 ? leads / views.length : 0;

    const viewsByDayMap: Record<string, number> = {};
    for (const v of views) {
      const day = v.viewedAt ? new Date(v.viewedAt).toISOString().split("T")[0] : "";
      if (day) viewsByDayMap[day] = (viewsByDayMap[day] ?? 0) + 1;
    }

    const sourceMap: Record<string, number> = {};
    for (const v of views) {
      const sourceStr = String(v.source ?? "DIRECT");
      sourceMap[sourceStr] = (sourceMap[sourceStr] ?? 0) + 1;
    }

    totalViews += views.length;
    totalSaves += Number(doc.savedCount ?? 0);
    totalLeads += leads;

    listingAnalytics.push({
      listingId,
      targetType,
      title: (doc.name ?? doc.title ?? "") as string,
      totalViews: views.length,
      uniqueViews: uniqueViewers,
      totalSaves: Number(doc.savedCount ?? 0),
      leads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      searchImpressions: 0,
      ctr: 0,
      avgViewDurationSeconds:
        views.length > 0
          ? Math.round(views.reduce((acc, v) => acc + (v.durationSeconds ?? 0), 0) / views.length)
          : 0,
      viewsByDay: Object.entries(viewsByDayMap)
        .map(([date, v]) => ({ date, views: v }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topSources: Object.entries(sourceMap)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
    });
  }

  return {
    totalViews,
    totalSaves,
    totalLeads,
    overallCTR: 0,
    listings: listingAnalytics,
  };
}
