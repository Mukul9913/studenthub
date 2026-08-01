import type { FilterQuery } from "mongoose";
import { RoomModel, type IRoom } from "../models/room.model.js";

export class RoomRepository {
  async create(data: Partial<IRoom>): Promise<IRoom> {
    const room = new RoomModel(data);
    return await room.save();
  }

  async findById(id: string): Promise<IRoom | null> {
    return await RoomModel.findById(id).populate("propertyId").exec();
  }

  async findByProperty(propertyId: string): Promise<IRoom[]> {
    return await RoomModel.find({ propertyId }).exec();
  }

  async search(filters: {
    propertyIds?: string[];
    minRent?: number;
    maxRent?: number;
    genderPreference?: string;
    isAvailable?: boolean;
    roomType?: string;
  }): Promise<IRoom[]> {
    const query: FilterQuery<IRoom> = {};

    if (filters.propertyIds && filters.propertyIds.length > 0) {
      query.propertyId = { $in: filters.propertyIds };
    }

    if (filters.minRent !== undefined || filters.maxRent !== undefined) {
      query.rent = {};
      if (filters.minRent !== undefined) {
        query.rent.$gte = filters.minRent;
      }
      if (filters.maxRent !== undefined) {
        query.rent.$lte = filters.maxRent;
      }
    }

    if (filters.genderPreference) {
      query.genderPreference = filters.genderPreference;
    }

    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    if (filters.roomType) {
      query.roomType = filters.roomType;
    }

    return await RoomModel.find(query).exec();
  }

  async update(id: string, data: Partial<IRoom>): Promise<IRoom | null> {
    return await RoomModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<IRoom | null> {
    return await RoomModel.findByIdAndDelete(id).exec();
  }

  async deleteManyByProperty(propertyId: string): Promise<void> {
    await RoomModel.deleteMany({ propertyId }).exec();
  }
}
