import mongoose from "mongoose";
import { NotFoundError, ForbiddenError } from "../errors/index.js";
import type { ILibrary } from "../models/library.model.js";
import type {
  LibraryRepository,
  LibrarySearchFilters,
} from "../repositories/library.repository.js";

export interface CreateLibraryPayload {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  area: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  pricing: {
    monthlyFee: number;
    weeklyFee?: number;
    dailyFee?: number;
    registrationFee?: number;
  };
  facilities?: string[];
  operatingHours?: {
    openingTime?: string;
    closingTime?: string;
    openDays?: string[];
    is24x7?: boolean;
  };
  seatCapacity?: number;
  availableSeats?: number;
  images?: string[];
  status?: "draft" | "pending_review" | "published";
}

export class LibraryService {
  constructor(private libraryRepository: LibraryRepository) {}

  /**
   * Automatically seeds initial real libraries if none exist in database.
   */
  async ensureInitialSeed(): Promise<void> {
    try {
      const existing = await this.libraryRepository.findBySlug("saarthi-student-hub");
      if (!existing) {
        const adminId = new mongoose.Types.ObjectId();
        await this.libraryRepository.create({
          ownerId: adminId,
          name: "Saarthi Student Hub",
          slug: "saarthi-student-hub",
          description:
            "Saarthi Student Hub is Indore's premier self-study library and learning space located in Bhawarkua. Features AC halls, ultra-fast Wi-Fi, personal charging slots, ergonomic study desks, 24x7 access, and a quiet academic environment.",
          location: {
            address: "12, IT Park Road, Near Bhawarkua Square",
            city: "indore",
            state: "Madhya Pradesh",
            zipCode: "452001",
            coordinates: {
              type: "Point",
              coordinates: [75.8677, 22.6926],
            },
          },
          area: "Bhawarkua",
          contact: {
            phone: "+91 98765 43210",
            email: "contact@saarthistudenthub.in",
            website: "https://saarthistudenthub.in",
          },
          pricing: {
            monthlyFee: 1200,
            weeklyFee: 400,
            dailyFee: 100,
            registrationFee: 200,
          },
          facilities: [
            "ac",
            "wifi",
            "power_backup",
            "drinking_water",
            "cctv",
            "parking",
            "individual_desk",
            "ergonomic_chair",
            "charging_point",
            "locker",
            "washroom",
            "newspaper",
            "twenty_four_seven_access",
          ],
          operatingHours: {
            openingTime: "00:00",
            closingTime: "23:59",
            openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            is24x7: true,
          },
          seatCapacity: 120,
          availableSeats: 25,
          images: [
            "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
          ],
          isVerified: true,
          status: "published",
          avgRating: 4.8,
          reviewsCount: 34,
        } as unknown as Partial<ILibrary>);
      }
    } catch {
      // Ignore seed error if DB is unreachable during startup
    }
  }

  async listLibraries(filters: {
    area?: string;
    search?: string;
    minFee?: number;
    maxFee?: number;
    ac?: boolean;
    wifi?: boolean;
    powerBackup?: boolean;
    is24x7?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<{
    items: ILibrary[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    // await this.ensureInitialSeed();

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const searchFilters: LibrarySearchFilters = {
      city: "indore",
      area: filters.area,
      search: filters.search,
      minFee: filters.minFee,
      maxFee: filters.maxFee,
      ac: filters.ac,
      wifi: filters.wifi,
      powerBackup: filters.powerBackup,
      is24x7: filters.is24x7,
      status: "published",
      skip,
      limit,
      sortBy: filters.sortBy,
    };

    const { items, total } = await this.libraryRepository.searchPaginated(searchFilters);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getLibraryById(id: string): Promise<ILibrary> {
    const library = await this.libraryRepository.findById(id);
    if (!library) {
      throw new NotFoundError("Library listing not found", "LIBRARY_NOT_FOUND");
    }
    return library;
  }

  async getMyLibraries(
    ownerId: string,
  ): Promise<{ items: ILibrary[]; stats: Record<string, number> }> {
    const items = await this.libraryRepository.findByOwner(ownerId);
    const stats = {
      total: items.length,
      published: items.filter((i) => i.status === "published").length,
      pendingReview: items.filter((i) => i.status === "pending_review").length,
      draft: items.filter((i) => i.status === "draft").length,
    };
    return { items, stats };
  }

  async createLibrary(
    caller: { id: string; role: string; ownerType?: string | null },
    payload: CreateLibraryPayload,
  ): Promise<ILibrary> {
    if (caller.role !== "admin" && caller.ownerType && caller.ownerType !== "library") {
      throw new ForbiddenError(
        `Your owner business account is registered as '${caller.ownerType}'. You cannot manage library listings.`,
        "DOMAIN_BUSINESS_TYPE_MISMATCH",
      );
    }

    const slug =
      payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 6);

    const defaultCoords: [number, number] = [75.8577, 22.7196]; // Indore coordinates

    const libraryData: Partial<ILibrary> = {
      ...payload,
      ownerId: new mongoose.Types.ObjectId(caller.id) as unknown as mongoose.Types.ObjectId,
      slug,
      location: {
        ...payload.location,
        city: "indore",
        coordinates: payload.location.coordinates || {
          type: "Point",
          coordinates: defaultCoords,
        },
      },
      operatingHours: {
        openingTime: payload.operatingHours?.openingTime || "06:00",
        closingTime: payload.operatingHours?.closingTime || "23:00",
        openDays: payload.operatingHours?.openDays || [
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ],
        is24x7: payload.operatingHours?.is24x7 || false,
      },
      status: payload.status || "pending_review",
      isVerified: false,
      avgRating: 0,
      reviewsCount: 0,
    } as unknown as Partial<ILibrary>;

    return await this.libraryRepository.create(libraryData);
  }

  async updateLibrary(
    id: string,
    caller: { id: string; role: string },
    payload: Partial<CreateLibraryPayload>,
  ): Promise<ILibrary> {
    const library = await this.libraryRepository.findById(id);
    if (!library) {
      throw new NotFoundError("Library listing not found", "LIBRARY_NOT_FOUND");
    }

    const ownerIdStr =
      typeof library.ownerId === "object" && library.ownerId
        ? (library.ownerId as unknown as { _id?: { toString(): string } })._id?.toString() ||
          String(library.ownerId)
        : String(library.ownerId || "");

    if (caller.role !== "admin" && ownerIdStr !== caller.id) {
      throw new ForbiddenError(
        "You are not authorized to update this library listing",
        "LIBRARY_UPDATE_FORBIDDEN",
      );
    }

    const updated = await this.libraryRepository.update(
      id,
      payload as unknown as Partial<ILibrary>,
    );
    if (!updated) {
      throw new NotFoundError("Library listing not found", "LIBRARY_NOT_FOUND");
    }

    return updated;
  }

  async deleteLibrary(id: string, caller: { id: string; role: string }): Promise<void> {
    const library = await this.libraryRepository.findById(id);
    if (!library) {
      throw new NotFoundError("Library listing not found", "LIBRARY_NOT_FOUND");
    }

    const ownerIdStr =
      typeof library.ownerId === "object" && library.ownerId
        ? (library.ownerId as unknown as { _id?: { toString(): string } })._id?.toString() ||
          String(library.ownerId)
        : String(library.ownerId || "");

    if (caller.role !== "admin" && ownerIdStr !== caller.id) {
      throw new ForbiddenError(
        "You are not authorized to delete this library listing",
        "LIBRARY_DELETE_FORBIDDEN",
      );
    }

    await this.libraryRepository.delete(id);
  }
}
