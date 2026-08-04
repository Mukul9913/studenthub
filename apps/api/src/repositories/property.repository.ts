import mongoose, { type FilterQuery, type PipelineStage } from "mongoose";
import { PropertyModel, type IProperty } from "../models/property.model.js";

export class PropertyRepository {
  async create(data: Partial<IProperty>): Promise<IProperty> {
    const property = new PropertyModel(data);
    return await property.save();
  }

  async findById(id: string): Promise<IProperty | null> {
    return await PropertyModel.findById(id).populate("ownerId", "-passwordHash").exec();
  }

  async findByOwner(ownerId: string): Promise<IProperty[]> {
    return await PropertyModel.find({ ownerId }).exec();
  }

  async findNearby(
    longitude: number,
    latitude: number,
    maxDistanceMeters: number,
  ): Promise<IProperty[]> {
    return await PropertyModel.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    }).exec();
  }

  async search(filters: {
    city?: string;
    area?: string;
    type?: string;
    textQuery?: string;
    propertyIds?: string[];
  }): Promise<IProperty[]> {
    const query: FilterQuery<IProperty> = {};

    if (filters.city) {
      query["location.city"] = filters.city.toLowerCase();
    }
    if (filters.area) {
      query.area = { $regex: new RegExp(filters.area, "i") };
    }
    if (filters.type) {
      query.propertyType = filters.type;
    }
    if (filters.textQuery) {
      query.$text = { $search: filters.textQuery };
    }
    if (filters.propertyIds) {
      query._id = { $in: filters.propertyIds };
    }

    return await PropertyModel.find(query).exec();
  }

  async searchPaginated(filters: {
    city?: string;
    area?: string;
    type?: string;
    status?: string;
    textQuery?: string;
    propertyIds?: string[];
    skip: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ items: IProperty[]; total: number }> {
    const match: Record<string, unknown> = {};
    if (filters.status) {
      match.status = filters.status;
    } else {
      match.status = { $in: ["APPROVED", "published"] };
    }
    if (filters.city) match["location.city"] = filters.city.toLowerCase();
    if (filters.area) {
      const cleanArea = filters.area.trim().replace(/n$/i, "");
      match.area = { $regex: new RegExp(cleanArea, "i") };
    }
    if (filters.type) match.propertyType = filters.type;
    if (filters.textQuery) match.$text = { $search: filters.textQuery };
    if (filters.propertyIds) {
      match._id = {
        $in: filters.propertyIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const pipeline: PipelineStage[] = [{ $match: match }];

    if (filters.sortBy === "rent-asc" || filters.sortBy === "rent-desc") {
      pipeline.push({
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "propertyId",
          as: "roomsData",
        },
      });
      pipeline.push({
        $addFields: {
          minRent: {
            $min: {
              $map: {
                input: {
                  $filter: {
                    input: "$roomsData",
                    as: "room",
                    cond: { $gte: ["$$room.rent", 0] },
                  },
                },
                as: "room",
                in: "$$room.rent",
              },
            },
          },
        },
      });
      pipeline.push({
        $sort: { minRent: filters.sortBy === "rent-asc" ? 1 : -1 },
      });
    } else {
      let sortField = "createdAt";
      let sortDir: 1 | -1 = -1;
      if (filters.sortBy === "recent") {
        sortField = "createdAt";
        sortDir = -1;
      } else if (filters.sortBy === "recommended") {
        sortField = "avgRating";
        sortDir = -1;
      }

      pipeline.push({ $sort: { [sortField]: sortDir } });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await PropertyModel.aggregate(countPipeline).exec();
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: filters.skip });
    pipeline.push({ $limit: filters.limit });

    const items = await PropertyModel.aggregate(pipeline).exec();
    const hydratedItems = items.map((item) => PropertyModel.hydrate(item));

    return { items: hydratedItems, total };
  }

  async update(id: string, data: Partial<IProperty>): Promise<IProperty | null> {
    return await PropertyModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<IProperty | null> {
    return await PropertyModel.findByIdAndDelete(id).exec();
  }
}
