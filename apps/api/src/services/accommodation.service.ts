import { NotFoundError, ForbiddenError } from "../errors/index.js";
import type { IProperty } from "../models/property.model.js";
import type { IRoom } from "../models/room.model.js";
import type { PropertyRepository } from "../repositories/property.repository.js";
import type { RoomRepository } from "../repositories/room.repository.js";

interface CreateAccommodationPayload {
  title: string;
  description: string;
  propertyType: "pg" | "hostel" | "flat" | "house";
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  area: string;
  nearbyColleges?: { name: string; distanceKm: number }[];
  nearbyCompanies?: { name: string; distanceKm: number }[];
  amenities?: string[];
  food?: {
    provided: boolean;
    mealsIncluded?: ("breakfast" | "lunch" | "dinner" | "tea_snacks")[];
    details?: string;
    monthlyCharges?: number;
  };
  images?: string[];
  videos?: string[];
  rooms?: {
    roomType: "private" | "shared";
    sharingCount: number;
    rent: number;
    deposit: number;
    genderPreference: "boys" | "girls" | "unisex";
    amenities?: string[];
    totalBeds: number;
    availableBeds: number;
    availableFrom?: string;
    isAvailable?: boolean;
  }[];
}

type UpdateAccommodationPayload = Partial<Omit<CreateAccommodationPayload, "rooms">>;

export class AccommodationService {
  constructor(
    private propertyRepository: PropertyRepository,
    private roomRepository: RoomRepository,
  ) {}

  async createAccommodation(
    caller: { id: string; role: string; ownerType?: string | null },
    payload: CreateAccommodationPayload,
  ): Promise<{ property: IProperty; rooms: IRoom[] }> {
    if (caller.role !== "admin" && caller.ownerType && caller.ownerType !== "accommodation") {
      throw new ForbiddenError(
        `Your owner business account is registered as '${caller.ownerType}'. You cannot manage accommodation listings.`,
        "DOMAIN_BUSINESS_TYPE_MISMATCH",
      );
    }

    const { rooms, ...propertyData } = payload;

    const property = await this.propertyRepository.create({
      ...propertyData,
      ownerId: caller.id,
    } as unknown as Partial<IProperty>);

    const roomDocs: IRoom[] = [];
    if (rooms && rooms.length > 0) {
      for (const roomData of rooms) {
        const room = await this.roomRepository.create({
          ...roomData,
          propertyId: property._id,
        } as unknown as Partial<IRoom>);
        roomDocs.push(room);
      }
    }

    return { property, rooms: roomDocs };
  }

  private isAuthorizedOwnerOrAdmin(
    property: IProperty,
    caller: { id: string; role: string },
  ): boolean {
    if (caller.role === "admin") return true;

    let ownerIdStr = "";
    if (typeof property.ownerId === "object" && property.ownerId !== null) {
      ownerIdStr =
        (property.ownerId as unknown as { _id?: { toString(): string } })._id?.toString() ||
        (property.ownerId as unknown as { id?: string }).id ||
        String(property.ownerId);
    } else {
      ownerIdStr = String(property.ownerId || "");
    }

    return ownerIdStr === caller.id;
  }

  async updateAccommodation(
    propertyId: string,
    caller: { id: string; role: string },
    data: UpdateAccommodationPayload,
  ): Promise<IProperty> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Accommodation listing not found", "ACCOMMODATION_NOT_FOUND");
    }

    if (!this.isAuthorizedOwnerOrAdmin(property, caller)) {
      throw new ForbiddenError(
        "You are not authorized to update this listing",
        "ACCOMMODATION_UPDATE_FORBIDDEN",
      );
    }

    const updated = await this.propertyRepository.update(
      propertyId,
      data as unknown as Partial<IProperty>,
    );
    if (!updated) {
      throw new NotFoundError("Accommodation listing not found", "ACCOMMODATION_NOT_FOUND");
    }

    return updated;
  }

  async getAccommodation(id: string): Promise<{ property: IProperty; rooms: IRoom[] }> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError("Accommodation listing not found", "ACCOMMODATION_NOT_FOUND");
    }

    const rooms = await this.roomRepository.findByProperty(id);
    return { property, rooms };
  }

  async listAccommodations(filters: {
    area?: string;
    propertyType?: string;
    genderPreference?: string;
    minRent?: number;
    maxRent?: number;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    items: (IProperty & { rooms: IRoom[] })[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const {
      minRent,
      maxRent,
      genderPreference,
      area,
      propertyType,
      status,
      page = 1,
      limit = 10,
      sortBy = "recommended",
      sortOrder = "desc",
    } = filters;
    const skip = (page - 1) * limit;

    const hasRoomFilters =
      minRent !== undefined || maxRent !== undefined || genderPreference !== undefined;

    let propertyIds: string[] | undefined = undefined;

    if (hasRoomFilters) {
      const rooms = await this.roomRepository.search({
        minRent,
        maxRent,
        genderPreference,
      });

      if (rooms.length === 0) {
        return { items: [], total: 0, page, pageSize: limit, totalPages: 0 };
      }

      propertyIds = Array.from(new Set(rooms.map((r) => r.propertyId.toString())));
    }

    const { items, total } = await this.propertyRepository.searchPaginated({
      city: "indore",
      area,
      type: propertyType,
      status,
      propertyIds,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    if (items.length === 0) {
      return { items: [], total, page, pageSize: limit, totalPages: Math.ceil(total / limit) };
    }

    const returnedPropertyIds = items.map((p) => p._id.toString());
    const rooms = await this.roomRepository.search({ propertyIds: returnedPropertyIds });

    const itemsWithRooms = items.map((p) => {
      const pRooms = rooms.filter((r) => r.propertyId.toString() === p._id.toString());
      return Object.assign(p.toObject ? p.toObject() : p, { rooms: pRooms }) as IProperty & {
        rooms: IRoom[];
      };
    });

    return {
      items: itemsWithRooms,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyListings(ownerId: string): Promise<{
    items: (IProperty & { rooms: IRoom[] })[];
    stats: {
      total: number;
      published: number;
      pendingReview: number;
      draft: number;
      rejected: number;
      archived: number;
    };
  }> {
    const properties = await this.propertyRepository.findByOwner(ownerId);
    const propertyIds = properties.map((p) => p._id.toString());
    const rooms = propertyIds.length > 0 ? await this.roomRepository.search({ propertyIds }) : [];

    const itemsWithRooms = properties.map((p) => {
      const pRooms = rooms.filter((r) => r.propertyId.toString() === p._id.toString());
      return Object.assign(p.toObject ? p.toObject() : p, { rooms: pRooms }) as IProperty & {
        rooms: IRoom[];
      };
    });

    const stats = {
      total: properties.length,
      published: properties.filter((p) => p.status === "published").length,
      pendingReview: properties.filter((p) => p.status === "pending_review").length,
      draft: properties.filter((p) => p.status === "draft").length,
      rejected: properties.filter((p) => p.status === "rejected").length,
      archived: properties.filter((p) => p.status === "archived").length,
    };

    return { items: itemsWithRooms, stats };
  }

  async deleteAccommodation(
    propertyId: string,
    caller: { id: string; role: string },
  ): Promise<void> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Accommodation listing not found", "ACCOMMODATION_NOT_FOUND");
    }

    if (!this.isAuthorizedOwnerOrAdmin(property, caller)) {
      throw new ForbiddenError(
        "You are not authorized to delete this listing",
        "ACCOMMODATION_DELETE_FORBIDDEN",
      );
    }

    await this.propertyRepository.delete(propertyId);
    await this.roomRepository.deleteManyByProperty(propertyId);
  }

  async submitForReview(
    propertyId: string,
    caller: { id: string; role: string },
  ): Promise<IProperty> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Accommodation listing not found", "ACCOMMODATION_NOT_FOUND");
    }

    if (!this.isAuthorizedOwnerOrAdmin(property, caller)) {
      throw new ForbiddenError(
        "You are not authorized to submit this listing for review",
        "ACCOMMODATION_SUBMIT_FORBIDDEN",
      );
    }

    const updated = await this.propertyRepository.update(propertyId, {
      status: "pending_review",
    } as Partial<IProperty>);

    if (!updated) {
      throw new NotFoundError("Accommodation listing not found", "ACCOMMODATION_NOT_FOUND");
    }

    return updated;
  }
}
