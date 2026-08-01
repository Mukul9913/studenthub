/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserModel } from "../models/user.model.js";
import { PropertyModel } from "../models/property.model.js";
import { LibraryModel } from "../models/library.model.js";
import { EnquiryModel } from "../models/enquiry.model.js";
import { NotFoundError, BadRequestError } from "../errors/index.js";

export interface AdminOverviewStats {
  users: {
    total: number;
    students: number;
    professionals: number;
    owners: number;
    admins: number;
  };
  listings: {
    total: number;
    accommodation: number;
    library: number;
    mess: number;
    serviceProvider: number;
  };
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  enquiries: {
    total: number;
  };
  recentRegistrations: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    ownerType?: string;
    createdAt: string;
  }>;
  recentListings: Array<{
    id: string;
    name: string;
    domain: "accommodation" | "library";
    area: string;
    status: string;
    createdAt: string;
    ownerName: string;
  }>;
}

export interface AdminListingItem {
  id: string;
  name: string;
  domain: "accommodation" | "library" | "mess" | "service_provider";
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    ownerType?: string;
  };
  area: string;
  status: "draft" | "pending_review" | "published" | "rejected" | "suspended";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  specs: Record<string, unknown>;
}

export class AdminService {
  async getOverview(): Promise<AdminOverviewStats> {
    const [
      totalUsers,
      studentsCount,
      professionalsCount,
      ownersCount,
      adminsCount,
      accommodationsCount,
      librariesCount,
      accPending,
      accPublished,
      accRejected,
      accDraft,
      libPending,
      libPublished,
      libRejected,
      libDraft,
      totalEnquiries,
      recentUsers,
      recentProps,
      recentLibs,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: "student" }),
      UserModel.countDocuments({ role: "professional" }),
      UserModel.countDocuments({ role: "owner" }),
      UserModel.countDocuments({ role: "admin" }),
      PropertyModel.countDocuments(),
      LibraryModel.countDocuments(),
      PropertyModel.countDocuments({ status: "pending_review" }),
      PropertyModel.countDocuments({ status: "published" }),
      PropertyModel.countDocuments({ status: "rejected" }),
      PropertyModel.countDocuments({ status: "draft" }),
      LibraryModel.countDocuments({ status: "pending_review" }),
      LibraryModel.countDocuments({ status: "published" }),
      LibraryModel.countDocuments({ status: "rejected" }),
      LibraryModel.countDocuments({ status: "draft" }),
      EnquiryModel.countDocuments(),
      UserModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      PropertyModel.find()
        .populate("ownerId", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      LibraryModel.find()
        .populate("ownerId", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const formattedRecentUsers = recentUsers.map((u: any) => ({
      id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      ownerType: u.ownerType || undefined,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    }));

    const formattedProps = recentProps.map((p: any) => {
      const ownerObj = p.ownerId as { firstName?: string; lastName?: string } | null;
      return {
        id: p._id.toString(),
        name: p.title,
        domain: "accommodation" as const,
        area: p.area,
        status: p.status,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        ownerName: ownerObj?.firstName
          ? `${ownerObj.firstName} ${ownerObj.lastName || ""}`.trim()
          : "Owner",
      };
    });

    const formattedLibs = recentLibs.map((l: any) => {
      const ownerObj = l.ownerId as { firstName?: string; lastName?: string } | null;
      return {
        id: l._id.toString(),
        name: l.name,
        domain: "library" as const,
        area: l.area,
        status: l.status,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        ownerName: ownerObj?.firstName
          ? `${ownerObj.firstName} ${ownerObj.lastName || ""}`.trim()
          : "Owner",
      };
    });

    const recentListings = [...formattedProps, ...formattedLibs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      users: {
        total: totalUsers,
        students: studentsCount,
        professionals: professionalsCount,
        owners: ownersCount,
        admins: adminsCount,
      },
      listings: {
        total: accommodationsCount + librariesCount,
        accommodation: accommodationsCount,
        library: librariesCount,
        mess: 0,
        serviceProvider: 0,
      },
      approvals: {
        pending: accPending + libPending,
        approved: accPublished + libPublished,
        rejected: accRejected + libRejected,
        draft: accDraft + libDraft,
      },
      enquiries: {
        total: totalEnquiries,
      },
      recentRegistrations: formattedRecentUsers,
      recentListings,
    };
  }

  async getListings(filters: {
    domain?: string;
    status?: string;
    search?: string;
    area?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: AdminListingItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const includeAcc =
      !filters.domain || filters.domain === "all" || filters.domain === "accommodation";
    const includeLib = !filters.domain || filters.domain === "all" || filters.domain === "library";

    let accItems: any[] = [];
    let libItems: any[] = [];

    const accFilter: Record<string, unknown> = {};
    const libFilter: Record<string, unknown> = {};

    if (filters.status && filters.status !== "all") {
      accFilter.status = filters.status;
      libFilter.status = filters.status;
    }

    if (filters.area && filters.area !== "all") {
      accFilter.area = filters.area;
      libFilter.area = filters.area;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      accFilter.$or = [{ title: searchRegex }, { area: searchRegex }];
      libFilter.$or = [{ name: searchRegex }, { area: searchRegex }];
    }

    if (includeAcc) {
      accItems = await PropertyModel.find(accFilter)
        .populate("ownerId", "firstName lastName email phone ownerType")
        .lean();
    }
    if (includeLib) {
      libItems = await LibraryModel.find(libFilter)
        .populate("ownerId", "firstName lastName email phone ownerType")
        .lean();
    }

    const formattedAcc: AdminListingItem[] = accItems.map((p: any) => {
      const ownerObj = p.ownerId as {
        _id?: any;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        ownerType?: string;
      } | null;
      return {
        id: p._id.toString(),
        name: p.title,
        domain: "accommodation",
        owner: {
          id: ownerObj?._id ? ownerObj._id.toString() : p.ownerId?.toString() || "",
          firstName: ownerObj?.firstName || "Unknown",
          lastName: ownerObj?.lastName || "",
          email: ownerObj?.email || "",
          phone: ownerObj?.phone || "",
          ownerType: ownerObj?.ownerType || "accommodation",
        },
        area: p.area,
        status: p.status as AdminListingItem["status"],
        rejectionReason: p.rejectionReason,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        specs: {
          propertyType: p.propertyType,
          amenities: p.amenities,
          images: p.images,
          location: p.location,
        },
      };
    });

    const formattedLib: AdminListingItem[] = libItems.map((l: any) => {
      const ownerObj = l.ownerId as {
        _id?: any;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        ownerType?: string;
      } | null;
      return {
        id: l._id.toString(),
        name: l.name,
        domain: "library",
        owner: {
          id: ownerObj?._id ? ownerObj._id.toString() : l.ownerId?.toString() || "",
          firstName: ownerObj?.firstName || "Unknown",
          lastName: ownerObj?.lastName || "",
          email: ownerObj?.email || "",
          phone: ownerObj?.phone || "",
          ownerType: ownerObj?.ownerType || "library",
        },
        area: l.area,
        status: l.status as AdminListingItem["status"],
        rejectionReason: l.rejectionReason,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : new Date().toISOString(),
        specs: {
          pricing: l.pricing,
          seatCapacity: l.seatCapacity,
          availableSeats: l.availableSeats,
          operatingHours: l.operatingHours,
          facilities: l.facilities,
          images: l.images,
          location: l.location,
        },
      };
    });

    const allListings = [...formattedAcc, ...formattedLib].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = allListings.length;
    const items = allListings.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getListingDetails(domain: string, id: string): Promise<Record<string, unknown>> {
    if (domain === "accommodation") {
      const property = await PropertyModel.findById(id)
        .populate("ownerId", "firstName lastName email phone ownerType")
        .lean();
      if (!property) throw new NotFoundError("Accommodation listing not found", "NOT_FOUND");
      return property as unknown as Record<string, unknown>;
    } else if (domain === "library") {
      const library = await LibraryModel.findById(id)
        .populate("ownerId", "firstName lastName email phone ownerType")
        .lean();
      if (!library) throw new NotFoundError("Library listing not found", "NOT_FOUND");
      return library as unknown as Record<string, unknown>;
    } else {
      throw new BadRequestError("Unsupported listing domain", "INVALID_DOMAIN");
    }
  }

  async updateListingStatus(
    domain: string,
    id: string,
    status: "published" | "rejected" | "suspended" | "pending_review",
    rejectionReason?: string,
  ): Promise<Record<string, unknown>> {
    const updateData: Record<string, unknown> = { status };
    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (domain === "accommodation") {
      const updated = await PropertyModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updated) throw new NotFoundError("Accommodation listing not found", "NOT_FOUND");
      return updated as unknown as Record<string, unknown>;
    } else if (domain === "library") {
      const updated = await LibraryModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updated) throw new NotFoundError("Library listing not found", "NOT_FOUND");
      return updated as unknown as Record<string, unknown>;
    } else {
      throw new BadRequestError("Unsupported listing domain", "INVALID_DOMAIN");
    }
  }

  async getUsers(filters: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role: string;
      ownerType?: string;
      isVerified?: boolean;
      isActive?: boolean;
      createdAt: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters.role && filters.role !== "all") {
      query.role = filters.role;
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(query),
    ]);

    const formattedItems = items.map((u: Record<string, unknown>) => ({
      id: String(u._id),
      firstName: String(u.firstName || ""),
      lastName: String(u.lastName || ""),
      email: String(u.email || ""),
      phone: String(u.phone || ""),
      role: String(u.role || ""),
      ownerType: u.ownerType ? String(u.ownerType) : undefined,
      isVerified: Boolean(u.isVerified),
      isActive: Boolean(u.isActive),
      createdAt: u.createdAt
        ? new Date(u.createdAt as string).toISOString()
        : new Date().toISOString(),
    }));

    return {
      items: formattedItems,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getOwners(filters: {
    ownerType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Array<Record<string, unknown>>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { role: "owner" };
    if (filters.ownerType && filters.ownerType !== "all") {
      query.ownerType = filters.ownerType;
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [owners, total] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(query),
    ]);

    const formattedOwners = await Promise.all(
      owners.map(async (o: any) => {
        const ownerId = o._id;
        const [accCount, libCount] = await Promise.all([
          PropertyModel.countDocuments({ ownerId }),
          LibraryModel.countDocuments({ ownerId }),
        ]);

        return {
          id: ownerId.toString(),
          firstName: o.firstName,
          lastName: o.lastName,
          email: o.email,
          phone: o.phone,
          ownerType: o.ownerType || "accommodation",
          listingsCount: accCount + libCount,
          isVerified: o.isVerified,
          isActive: o.isActive,
          createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        };
      }),
    );

    return {
      items: formattedOwners,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
