import mongoose from "mongoose";
import { PropertyModel } from "../models/property.model.js";
import { LibraryModel } from "../models/library.model.js";
import type { ISearchProvider, ISearchProviderResult } from "./search-provider.interface.js";
import type {
  SearchQueryParams,
  SearchResultItem,
  SearchSuggestionResponse,
} from "@studenthub/types";

export class MongoSearchProvider implements ISearchProvider {
  private formatPropertyResult(p: Record<string, unknown>): SearchResultItem {
    const loc = (p.location || {}) as {
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      coordinates?: { coordinates?: [number, number] };
    };
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];

    return {
      id: String(p._id || p.id),
      targetType: "ACCOMMODATION",
      title: String(p.title || "Accommodation Property"),
      slug: String(p.slug || p._id),
      description: String(p.description || ""),
      image:
        images[0] ||
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      images,
      area: String(p.area || ""),
      city: String(loc.city || "indore"),
      location: {
        address: String(loc.address || ""),
        city: String(loc.city || "indore"),
        state: String(loc.state || "Madhya Pradesh"),
        zipCode: String(loc.zipCode || "452001"),
        coordinates: (loc.coordinates?.coordinates as [number, number]) || [75.8577, 22.7196],
      },
      price:
        typeof p.minRent === "number"
          ? p.minRent
          : typeof p.monthlyRent === "number"
            ? p.monthlyRent
            : 5000,
      pricingLabel: "month",
      rating: typeof p.avgRating === "number" ? p.avgRating : 0,
      reviewsCount: typeof p.reviewsCount === "number" ? p.reviewsCount : 0,
      isVerified: Boolean(p.isVerified),
      status: String(p.status || "APPROVED"),
      attributes: {
        propertyType: p.propertyType,
        food: p.food,
        amenities: p.amenities,
      },
      createdAt:
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : String(p.createdAt || new Date().toISOString()),
    };
  }

  private formatLibraryResult(l: Record<string, unknown>): SearchResultItem {
    const loc = (l.location || {}) as {
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      coordinates?: { coordinates?: [number, number] };
    };
    const pricing = (l.pricing || {}) as { monthlyFee?: number };
    const images = Array.isArray(l.images) ? (l.images as string[]) : [];

    return {
      id: String(l._id || l.id),
      targetType: "LIBRARY",
      title: String(l.name || "Study Library"),
      slug: String(l.slug || l._id),
      description: String(l.description || ""),
      image:
        images[0] ||
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      images,
      area: String(l.area || ""),
      city: String(loc.city || "indore"),
      location: {
        address: String(loc.address || ""),
        city: String(loc.city || "indore"),
        state: String(loc.state || "Madhya Pradesh"),
        zipCode: String(loc.zipCode || "452001"),
        coordinates: (loc.coordinates?.coordinates as [number, number]) || [75.8577, 22.7196],
      },
      price: typeof pricing.monthlyFee === "number" ? pricing.monthlyFee : 1000,
      pricingLabel: "month",
      rating: typeof l.avgRating === "number" ? l.avgRating : 0,
      reviewsCount: typeof l.reviewsCount === "number" ? l.reviewsCount : 0,
      isVerified: Boolean(l.isVerified),
      status: String(l.status || "APPROVED"),
      attributes: {
        facilities: l.facilities,
        operatingHours: l.operatingHours,
        seatCapacity: l.seatCapacity,
        availableSeats: l.availableSeats,
      },
      createdAt:
        l.createdAt instanceof Date
          ? l.createdAt.toISOString()
          : String(l.createdAt || new Date().toISOString()),
    };
  }

  async search(params: SearchQueryParams): Promise<ISearchProviderResult> {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const results: SearchResultItem[] = [];

    const publicStatusFilter = { $in: ["APPROVED", "published"] };

    // Build Accommodation Filter
    const propertyFilter: Record<string, unknown> = { status: publicStatusFilter };
    if (params.city) propertyFilter["location.city"] = params.city.toLowerCase();
    if (params.area) propertyFilter.area = { $regex: new RegExp(params.area, "i") };
    if (params.propertyType) propertyFilter.propertyType = params.propertyType;
    if (params.isVerified !== undefined) propertyFilter.isVerified = params.isVerified;

    if (params.q) {
      propertyFilter.$or = [
        { title: { $regex: params.q, $options: "i" } },
        { area: { $regex: params.q, $options: "i" } },
        { description: { $regex: params.q, $options: "i" } },
        { "nearbyColleges.name": { $regex: params.q, $options: "i" } },
      ];
    }

    // Build Library Filter
    const libraryFilter: Record<string, unknown> = { status: publicStatusFilter };
    if (params.city) libraryFilter["location.city"] = params.city.toLowerCase();
    if (params.area) libraryFilter.area = { $regex: new RegExp(params.area, "i") };
    if (params.isVerified !== undefined) libraryFilter.isVerified = params.isVerified;

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      libraryFilter["pricing.monthlyFee"] = {};
      if (params.minPrice !== undefined)
        (libraryFilter["pricing.monthlyFee"] as Record<string, number>).$gte = params.minPrice;
      if (params.maxPrice !== undefined)
        (libraryFilter["pricing.monthlyFee"] as Record<string, number>).$lte = params.maxPrice;
    }

    const libraryFacilities: string[] = [];
    if (params.ac) libraryFacilities.push("ac");
    if (params.wifi) libraryFacilities.push("wifi");
    if (params.powerBackup) libraryFacilities.push("power_backup");
    if (params.cctv) libraryFacilities.push("cctv");
    if (params.locker) libraryFacilities.push("locker");
    if (params.parking) libraryFacilities.push("parking");

    if (libraryFacilities.length > 0) {
      libraryFilter.facilities = { $all: libraryFacilities };
    }

    if (params.is24x7) {
      libraryFilter["operatingHours.is24x7"] = true;
    }

    if (params.q) {
      libraryFilter.$or = [
        { name: { $regex: params.q, $options: "i" } },
        { area: { $regex: params.q, $options: "i" } },
        { description: { $regex: params.q, $options: "i" } },
      ];
    }

    // Execute queries
    const target = (params.targetType || "ALL").toUpperCase();

    if (target === "ALL" || target === "ACCOMMODATION" || target === "PG" || target === "HOSTEL") {
      const properties = await PropertyModel.find(propertyFilter)
        .populate("ownerId", "firstName lastName email phone")
        .lean()
        .exec();

      results.push(
        ...properties.map((p) => this.formatPropertyResult(p as Record<string, unknown>)),
      );
    }

    if (target === "ALL" || target === "LIBRARY") {
      const libraries = await LibraryModel.find(libraryFilter)
        .populate("ownerId", "firstName lastName email phone")
        .lean()
        .exec();

      results.push(...libraries.map((l) => this.formatLibraryResult(l as Record<string, unknown>)));
    }

    // Sort Results
    const sortBy = params.sortBy || "newest";
    results.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "popularity_desc") return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      // Default sorting: Weighted rating + recency boost for top-reputation listings
      const scoreA = (a.rating || 0) * 10 + (a.reviewsCount || 0);
      const scoreB = (b.rating || 0) * 10 + (b.reviewsCount || 0);
      if (scoreA !== scoreB) return scoreB - scoreA;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = results.length;
    const paginated = results.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    let nextCursor: string | undefined = undefined;
    if (paginated.length > 0 && skip + limit < total) {
      const lastItem = paginated[paginated.length - 1];
      if (lastItem) {
        nextCursor = Buffer.from(
          JSON.stringify({ id: lastItem.id, createdAt: lastItem.createdAt }),
        ).toString("base64");
      }
    }

    return {
      items: paginated,
      total,
      page,
      pageSize: limit,
      totalPages,
      nextCursor,
    };
  }

  async getSuggestions(query: string, _city = "indore"): Promise<SearchSuggestionResponse> {
    const qRegex = new RegExp(query, "i");
    const publicStatusFilter = { $in: ["APPROVED", "published"] };

    const [properties, libraries] = await Promise.all([
      PropertyModel.find({
        status: publicStatusFilter,
        $or: [{ title: qRegex }, { area: qRegex }, { "nearbyColleges.name": qRegex }],
      })
        .limit(5)
        .lean()
        .exec(),
      LibraryModel.find({
        status: publicStatusFilter,
        $or: [{ name: qRegex }, { area: qRegex }],
      })
        .limit(5)
        .lean()
        .exec(),
    ]);

    const suggestions = [
      ...properties.map((p) => ({
        title: p.title,
        type: "listing" as const,
        category: "ACCOMMODATION" as const,
        id: p._id.toString(),
        area: p.area,
        city: p.location?.city || "indore",
      })),
      ...libraries.map((l) => ({
        title: l.name,
        type: "listing" as const,
        category: "LIBRARY" as const,
        id: l._id.toString(),
        area: l.area,
        city: l.location?.city || "indore",
      })),
    ];

    const trendingAreas = ["Bhawarkua", "Vijay Nagar", "Palasia", "Geeta Bhawan", "Chhawani"];
    const popularSearches = [
      "Single Room PG",
      "24x7 AC Library",
      "Girls Hostel Near Holkar College",
      "Flat in Vijay Nagar",
    ];
    const nearbyColleges = [
      "Holkar Science College",
      "GSITS Indore",
      "IIPS DAVV",
      "SGSITS",
      "MEDICAPS",
    ];

    return {
      suggestions,
      trendingAreas,
      popularSearches,
      nearbyColleges,
    };
  }

  async getSimilarListings(
    targetType: string,
    targetId: string,
    limit = 4,
  ): Promise<SearchResultItem[]> {
    const canonicalType = targetType.toUpperCase();
    const objId = new mongoose.Types.ObjectId(targetId);

    if (canonicalType === "ACCOMMODATION") {
      const current = await PropertyModel.findById(objId).lean().exec();
      if (!current) return [];

      const similars = await PropertyModel.find({
        _id: { $ne: objId },
        status: { $in: ["APPROVED", "published"] },
        $or: [{ area: current.area }, { propertyType: current.propertyType }],
      })
        .limit(limit)
        .lean()
        .exec();

      return similars.map((p) => this.formatPropertyResult(p as Record<string, unknown>));
    } else {
      const current = await LibraryModel.findById(objId).lean().exec();
      if (!current) return [];

      const similars = await LibraryModel.find({
        _id: { $ne: objId },
        status: { $in: ["APPROVED", "published"] },
        area: current.area,
      })
        .limit(limit)
        .lean()
        .exec();

      return similars.map((l) => this.formatLibraryResult(l as Record<string, unknown>));
    }
  }

  async getNearbyListings(
    lat: number,
    lng: number,
    radiusKm = 10,
    targetType = "ALL",
    limit = 6,
  ): Promise<SearchResultItem[]> {
    const maxDistanceMeters = radiusKm * 1000;
    const results: SearchResultItem[] = [];

    const geoQuery = {
      status: { $in: ["APPROVED", "published"] },
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };

    if (targetType === "ALL" || targetType === "ACCOMMODATION") {
      const properties = await PropertyModel.find(geoQuery).limit(limit).lean().exec();
      results.push(
        ...properties.map((p) => this.formatPropertyResult(p as Record<string, unknown>)),
      );
    }

    if (targetType === "ALL" || targetType === "LIBRARY") {
      const libraries = await LibraryModel.find(geoQuery).limit(limit).lean().exec();
      results.push(...libraries.map((l) => this.formatLibraryResult(l as Record<string, unknown>)));
    }

    return results.slice(0, limit);
  }
}
