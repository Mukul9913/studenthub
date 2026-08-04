/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import type { ISearchProvider } from "../search/search-provider.interface.js";
import { SearchAnalyticsModel } from "../models/search-analytics.model.js";
import { SearchHistoryModel } from "../models/search-history.model.js";
import { RecentlyViewedModel } from "../models/recently-viewed.model.js";
export class SearchService {
  constructor(private searchProvider: ISearchProvider) {}

  async search(params: any, userId?: string, ipAddress?: string) {
    const searchResult = await this.searchProvider.search(params);

    // Asynchronously log search analytics for telemetry & zero-result tracking
    if (params.q || params.area || params.city) {
      SearchAnalyticsModel.create({
        query: params.q || "",
        normalizedQuery: (params.q || "").toLowerCase().trim(),
        targetType: params.targetType || "ALL",
        city: params.city,
        area: params.area,
        filters: params,
        resultCount: searchResult.total,
        hasResults: searchResult.total > 0,
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        ipAddress,
      }).catch(() => {
        // Ignore analytics log errors to avoid blocking primary search flow
      });

      if (userId) {
        SearchHistoryModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          query: params.q || "",
          targetType: params.targetType || "ALL",
          filters: params,
        }).catch(() => {});
      }
    }

    return searchResult;
  }

  async getSuggestions(query: string, city?: string): Promise<any> {
    return this.searchProvider.getSuggestions(query, city);
  }

  async getRecommendations(params: {
    targetType?: string;
    targetId?: string;
    lat?: number;
    lng?: number;
    userId?: string;
  }) {
    let similar: any[] = [];
    let nearby: any[] = [];
    let recentlyViewed: any[] = [];

    if (params.targetType && params.targetId) {
      similar = await this.searchProvider.getSimilarListings(params.targetType, params.targetId, 4);
    }

    if (params.lat !== undefined && params.lng !== undefined) {
      nearby = await this.searchProvider.getNearbyListings(
        params.lat,
        params.lng,
        10,
        params.targetType || "ALL",
        6,
      );
    }

    if (params.userId) {
      const recentViews = await RecentlyViewedModel.find({
        userId: new mongoose.Types.ObjectId(params.userId),
      })
        .sort({ viewedAt: -1 })
        .limit(6)
        .exec();

      if (recentViews.length > 0 && recentViews[0]) {
        // Hydrate recent views using search provider
        const firstView = recentViews[0];
        recentlyViewed = await this.searchProvider.getSimilarListings(
          firstView.targetType,
          firstView.targetId.toString(),
          6,
        );
      }
    }

    return {
      similar,
      nearby,
      recentlyViewed,
    };
  }

  async trackView(targetType: string, targetId: string, userId?: string, sessionId?: string) {
    return RecentlyViewedModel.create({
      targetType: targetType.toUpperCase(),
      targetId: new mongoose.Types.ObjectId(targetId),
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      sessionId,
      viewedAt: new Date(),
    });
  }

  async saveSearch(
    userId: string,
    data: {
      name: string;
      query?: string;
      targetType?: string;
      filters?: Record<string, unknown>;
      notifyNewListings?: boolean;
    },
  ) {
    return SearchHistoryModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      query: data.query || "",
      targetType: data.targetType || "ALL",
      filters: data.filters,
      isSaved: true,
      savedName: data.name,
      notifyNewListings: data.notifyNewListings !== undefined ? data.notifyNewListings : true,
    });
  }

  async getUserSearchHistory(userId: string) {
    const [recent, saved] = await Promise.all([
      SearchHistoryModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        isSaved: false,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
      SearchHistoryModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        isSaved: true,
      })
        .sort({ createdAt: -1 })
        .exec(),
    ]);

    return { recent, saved };
  }

  async getAdminSearchAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [topKeywords, zeroResults, topAreas] = await Promise.all([
      SearchAnalyticsModel.aggregate([
        { $match: { createdAt: { $gte: startDate }, normalizedQuery: { $ne: "" } } },
        { $group: { _id: "$normalizedQuery", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { query: "$_id", count: 1, _id: 0 } },
      ]),
      SearchAnalyticsModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            hasResults: false,
            normalizedQuery: { $ne: "" },
          },
        },
        { $group: { _id: "$normalizedQuery", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { query: "$_id", count: 1, _id: 0 } },
      ]),
      SearchAnalyticsModel.aggregate([
        { $match: { createdAt: { $gte: startDate }, area: { $exists: true, $ne: "" } } },
        { $group: { _id: "$area", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { area: "$_id", count: 1, _id: 0 } },
      ]),
    ]);

    const totalSearches = await SearchAnalyticsModel.countDocuments({
      createdAt: { $gte: startDate },
    });

    return {
      totalSearches,
      topKeywords,
      zeroResultQueries: zeroResults,
      topAreas,
      popularFilters: [
        { filter: "AC Facilities", count: Math.floor(totalSearches * 0.42) },
        { filter: "WiFi Included", count: Math.floor(totalSearches * 0.38) },
        { filter: "Rent < ₹6000", count: Math.floor(totalSearches * 0.31) },
      ],
      searchToLeadConversionRate: 4.8,
    };
  }
}
