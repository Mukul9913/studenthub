import type { FilterQuery } from "mongoose";
import { LibraryModel, type ILibrary } from "../models/library.model.js";

export interface LibrarySearchFilters {
  city?: string;
  area?: string;
  search?: string;
  minFee?: number;
  maxFee?: number;
  ac?: boolean;
  wifi?: boolean;
  powerBackup?: boolean;
  is24x7?: boolean;
  status?: string;
  skip?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class LibraryRepository {
  async create(data: Partial<ILibrary>): Promise<ILibrary> {
    const library = new LibraryModel(data);
    return await library.save();
  }

  async findById(id: string): Promise<ILibrary | null> {
    return await LibraryModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<ILibrary | null> {
    return await LibraryModel.findOne({ slug }).exec();
  }

  async findByOwner(ownerId: string): Promise<ILibrary[]> {
    return await LibraryModel.find({ ownerId }).sort({ createdAt: -1 }).exec();
  }

  async searchPaginated(
    filters: LibrarySearchFilters,
  ): Promise<{ items: ILibrary[]; total: number }> {
    const query: FilterQuery<ILibrary> = {};

    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = { $in: ["APPROVED", "published"] } as unknown as string;
    }

    if (filters.city) {
      query["location.city"] = filters.city.toLowerCase();
    }

    if (filters.area) {
      const cleanArea = filters.area.trim().replace(/n$/i, "");
      query.area = { $regex: new RegExp(cleanArea, "i") };
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { area: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.minFee !== undefined || filters.maxFee !== undefined) {
      query["pricing.monthlyFee"] = {};
      if (filters.minFee !== undefined) {
        query["pricing.monthlyFee"].$gte = filters.minFee;
      }
      if (filters.maxFee !== undefined) {
        query["pricing.monthlyFee"].$lte = filters.maxFee;
      }
    }

    if (filters.ac) {
      query.facilities = { $in: ["ac"] };
    }

    if (filters.wifi) {
      if (query.facilities) {
        query.facilities.$in.push("wifi");
      } else {
        query.facilities = { $in: ["wifi"] };
      }
    }

    if (filters.powerBackup) {
      if (query.facilities) {
        query.facilities.$in.push("power_backup");
      } else {
        query.facilities = { $in: ["power_backup"] };
      }
    }

    if (filters.is24x7) {
      query["operatingHours.is24x7"] = true;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    if (filters.sortBy === "fee-asc") {
      sortOptions["pricing.monthlyFee"] = 1;
    } else if (filters.sortBy === "fee-desc") {
      sortOptions["pricing.monthlyFee"] = -1;
    } else if (filters.sortBy === "rating") {
      sortOptions.avgRating = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = filters.skip || 0;
    const limit = filters.limit || 10;

    const [items, total] = await Promise.all([
      LibraryModel.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      LibraryModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async update(id: string, data: Partial<ILibrary>): Promise<ILibrary | null> {
    return await LibraryModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<ILibrary | null> {
    return await LibraryModel.findByIdAndDelete(id).exec();
  }
}
