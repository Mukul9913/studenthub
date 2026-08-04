import assert from "node:assert";
import { describe, it } from "node:test";
import mongoose from "mongoose";
import { MongoSearchProvider } from "../search/mongo-search.provider.js";
import { SearchAnalyticsModel } from "../models/search-analytics.model.js";
import { SearchHistoryModel } from "../models/search-history.model.js";

describe("Search & Discovery Engine Unit Tests", () => {
  it("MongoSearchProvider should instantiate cleanly and provide getSuggestions fallback", async () => {
    const provider = new MongoSearchProvider();
    assert.ok(provider);
    assert.equal(typeof provider.getSuggestions, "function");
  });

  it("SearchAnalyticsModel should validate correct search analytics log document", async () => {
    const log = new SearchAnalyticsModel({
      query: "bhawarkua pg",
      normalizedQuery: "bhawarkua pg",
      targetType: "ACCOMMODATION",
      city: "indore",
      area: "Bhawarkua",
      resultCount: 12,
      hasResults: true,
      userId: new mongoose.Types.ObjectId(),
      ipAddress: "127.0.0.1",
    });

    const err = await log.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });

  it("SearchHistoryModel should validate saved search history document", async () => {
    const history = new SearchHistoryModel({
      userId: new mongoose.Types.ObjectId(),
      query: "AC Library in Vijay Nagar",
      targetType: "LIBRARY",
      isSaved: true,
      savedName: "My Library Search",
      notifyNewListings: true,
    });

    const err = await history.validate().catch((e) => e);
    assert.strictEqual(err, undefined);
  });
});
