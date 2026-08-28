import type { FilterQuery } from "mongoose";
import { MessModel, type IMess } from "../models/mess.model.js";

// The schema uppercases `status`, but legacy/lowercase values are matched too.
export const PUBLIC_MESS_STATUSES = ["APPROVED", "PUBLISHED", "published", "approved"];

export interface MessSearchFilters {
  city?: string;
  area?: string;
  search?: string;
  providerType?: string;
  foodPreference?: string;
  mealType?: string;
  minPrice?: number;
  maxPrice?: number;
  delivery?: boolean;
  pickup?: boolean;
  subscription?: boolean;
  status?: string;
  publicOnly?: boolean;
  skip?: number;
  limit?: number;
  sortBy?: string;
}

export class MessRepository {
  async create(data: Partial<IMess>): Promise<IMess> {
    const mess = new MessModel(data);
    return await mess.save();
  }

  async findById(id: string): Promise<IMess | null> {
    return await MessModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<IMess | null> {
    return await MessModel.findOne({ slug: slug.toLowerCase() }).exec();
  }

  async findByOwner(ownerId: string): Promise<IMess[]> {
    return await MessModel.find({ ownerId }).sort({ createdAt: -1 }).exec();
  }

  async searchPaginated(filters: MessSearchFilters): Promise<{ items: IMess[]; total: number }> {
    const query: FilterQuery<IMess> = {};

    if (filters.status) {
      query.status = filters.status;
    } else if (filters.publicOnly) {
      query.status = { $in: PUBLIC_MESS_STATUSES } as unknown as string;
    }

    if (filters.city) {
      query["location.city"] = { $regex: new RegExp(`^${filters.city}$`, "i") };
    }

    if (filters.area) {
      query.area = { $regex: new RegExp(filters.area.trim(), "i") };
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { area: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.providerType) {
      query.providerType = filters.providerType;
    }

    if (filters.foodPreference) {
      query.foodPreferences = { $in: [filters.foodPreference] };
    }

    if (filters.mealType) {
      query.mealTypes = { $in: [filters.mealType] };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceRange: Record<string, number> = {};
      if (filters.minPrice !== undefined) {
        priceRange.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        priceRange.$lte = filters.maxPrice;
      }
      query["pricing.startingMealPrice"] = priceRange;
    }

    if (filters.delivery) {
      query.deliveryAvailable = true;
    }

    if (filters.pickup) {
      query.pickupAvailable = true;
    }

    if (filters.subscription) {
      query.subscriptionAvailable = true;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    if (filters.sortBy === "price_asc") {
      sortOptions["pricing.startingMealPrice"] = 1;
    } else if (filters.sortBy === "price_desc") {
      sortOptions["pricing.startingMealPrice"] = -1;
    } else if (filters.sortBy === "rating") {
      sortOptions.avgRating = -1;
    } else if (filters.sortBy === "newest") {
      sortOptions.createdAt = -1;
    } else {
      sortOptions.isVerified = -1;
      sortOptions.avgRating = -1;
      sortOptions.createdAt = -1;
    }

    const skip = filters.skip || 0;
    const limit = filters.limit || 10;

    const [items, total] = await Promise.all([
      MessModel.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      MessModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async update(id: string, data: Partial<IMess>): Promise<IMess | null> {
    return await MessModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<IMess | null> {
    return await MessModel.findByIdAndDelete(id).exec();
  }
}
