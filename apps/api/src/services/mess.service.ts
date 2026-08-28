import mongoose from "mongoose";
import { ForbiddenError, NotFoundError } from "../errors/index.js";
import type { IMess } from "../models/mess.model.js";
import type { MessRepository, MessSearchFilters } from "../repositories/mess.repository.js";

export interface MessMenuItemPayload {
  name: string;
  description?: string;
}

export interface MessDayMenuPayload {
  day: string;
  breakfast?: MessMenuItemPayload[];
  lunch?: MessMenuItemPayload[];
  dinner?: MessMenuItemPayload[];
}

export interface MessMealPlanPayload {
  name: string;
  description?: string;
  duration: string;
  includedMeals: string[];
  price: number;
  deliveryIncluded?: boolean;
  pauseAllowed?: boolean;
  isActive?: boolean;
}

export interface CreateMessPayload {
  name: string;
  description: string;
  providerType?: string;
  location: {
    address: string;
    city?: string;
    state: string;
    zipCode?: string;
    pincode?: string;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
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
  foodPreferences?: string[];
  mealTypes?: string[];
  pricing: {
    startingMealPrice: number;
    currency?: string;
  };
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  subscriptionAvailable?: boolean;
  deliveryRadiusKm?: number;
  operatingHours?: {
    openingTime?: string;
    closingTime?: string;
    openDays?: string[];
    is24x7?: boolean;
  };
  images?: string[];
  mealPlans?: MessMealPlanPayload[];
  weeklyMenu?: MessDayMenuPayload[];
  status?: string;
}

export interface ListMessFilters {
  search?: string;
  area?: string;
  providerType?: string;
  foodPreference?: string;
  mealType?: string;
  minPrice?: number;
  maxPrice?: number;
  delivery?: boolean;
  pickup?: boolean;
  subscription?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}

const ALL_WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Serializes a Mess document into an API response object, exposing `id`
 * instead of `_id` on the document itself and on each embedded meal plan.
 */
export function toMessDTO(mess: IMess): Record<string, unknown> {
  const raw = (
    typeof mess.toObject === "function" ? mess.toObject() : mess
  ) as unknown as Record<string, unknown>;

  const mealPlans = Array.isArray(raw.mealPlans)
    ? (raw.mealPlans as Record<string, unknown>[]).map((plan) => {
        const { _id, ...rest } = plan;
        return { ...rest, id: _id ? String(_id) : undefined };
      })
    : [];

  const { _id, __v, ...rest } = raw;

  return {
    ...rest,
    id: _id ? String(_id) : String(raw.id || ""),
    mealPlans,
  };
}

export class MessService {
  private seedChecked = false;

  constructor(private messRepository: MessRepository) {}

  /**
   * Seeds a few real Indore mess/tiffin providers the first time the public
   * listing endpoint is hit, so the marketplace is never empty.
   * Demo listings are owned by the platform admin (or first owner) so leads
   * resolve to a real user in admin/owner CRM.
   */
  async ensureInitialSeed(): Promise<void> {
    if (this.seedChecked) return;

    try {
      const { UserModel } = await import("../models/user.model.js");
      const { MessModel } = await import("../models/mess.model.js");

      const seedOwner =
        (await UserModel.findOne({ role: "owner", ownerType: "mess", isActive: true }).exec()) ||
        (await UserModel.findOne({ role: "owner", isActive: true }).exec()) ||
        (await UserModel.findOne({ role: "admin", isActive: true }).exec());
      const ownerId = seedOwner?._id ?? new mongoose.Types.ObjectId();

      const DEMO_SLUGS = [
        "sharma-student-mess",
        "annapurna-tiffin-service",
        "maa-ki-rasoi-home-kitchen",
      ] as const;

      const existing = await this.messRepository.findBySlug(DEMO_SLUGS[0]);
      if (!existing) {
        for (const seed of buildSeedMesses(ownerId)) {
          await this.messRepository.create(seed);
        }
      } else if (seedOwner) {
        const ownerExists = await UserModel.exists({ _id: existing.ownerId }).exec();
        if (!ownerExists) {
          await MessModel.updateMany(
            { slug: { $in: [...DEMO_SLUGS] } },
            { $set: { ownerId: seedOwner._id } },
          ).exec();
        }
      }

      this.seedChecked = true;
    } catch {
      // Ignore seed errors if the database is unreachable during startup
    }
  }

  async listMesses(filters: ListMessFilters): Promise<{
    items: Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    await this.ensureInitialSeed();

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const searchFilters: MessSearchFilters = {
      area: filters.area,
      search: filters.search,
      providerType: filters.providerType,
      foodPreference: filters.foodPreference,
      mealType: filters.mealType,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      delivery: filters.delivery,
      pickup: filters.pickup,
      subscription: filters.subscription,
      publicOnly: true,
      skip,
      limit,
      sortBy: filters.sortBy,
    };

    const { items, total } = await this.messRepository.searchPaginated(searchFilters);

    return {
      items: items.map(toMessDTO),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getMessByIdOrSlug(idOrSlug: string): Promise<Record<string, unknown>> {
    const mess = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? ((await this.messRepository.findById(idOrSlug)) ??
        (await this.messRepository.findBySlug(idOrSlug)))
      : await this.messRepository.findBySlug(idOrSlug);

    if (!mess) {
      throw new NotFoundError("Mess listing not found", "MESS_NOT_FOUND");
    }

    return toMessDTO(mess);
  }

  async getMyMesses(
    ownerId: string,
  ): Promise<{ items: Record<string, unknown>[]; stats: Record<string, number> }> {
    const items = await this.messRepository.findByOwner(ownerId);

    const countByStatus = (...statuses: string[]): number =>
      items.filter((item) => statuses.includes(String(item.status).toUpperCase())).length;

    return {
      items: items.map(toMessDTO),
      stats: {
        total: items.length,
        published: countByStatus("APPROVED", "PUBLISHED"),
        pendingReview: countByStatus("PENDING_REVIEW", "UNDER_REVIEW"),
        draft: countByStatus("DRAFT"),
        rejected: countByStatus("REJECTED"),
      },
    };
  }

  async createMess(
    caller: { id: string; role: string; ownerType?: string | null },
    payload: CreateMessPayload,
  ): Promise<Record<string, unknown>> {
    if (caller.role !== "admin" && caller.ownerType && caller.ownerType !== "mess") {
      throw new ForbiddenError(
        `Your owner business account is registered as '${caller.ownerType}'. You cannot manage mess listings.`,
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

    const defaultCoords: [number, number] = [75.8577, 22.7196]; // Indore

    const messData = {
      ...payload,
      ownerId: new mongoose.Types.ObjectId(caller.id),
      slug,
      providerType: payload.providerType || "mess",
      location: {
        ...payload.location,
        city: payload.location.city || "indore",
        coordinates: payload.location.coordinates || {
          type: "Point" as const,
          coordinates: defaultCoords,
        },
      },
      pricing: {
        startingMealPrice: payload.pricing.startingMealPrice,
        currency: payload.pricing.currency || "INR",
      },
      operatingHours: {
        openingTime: payload.operatingHours?.openingTime || "07:00",
        closingTime: payload.operatingHours?.closingTime || "22:00",
        openDays: payload.operatingHours?.openDays || ALL_WEEK_DAYS,
        is24x7: payload.operatingHours?.is24x7 || false,
      },
      status: payload.status || "PENDING_REVIEW",
      submittedAt: new Date(),
      isVerified: false,
      avgRating: 0,
      reviewsCount: 0,
    } as unknown as Partial<IMess>;

    const created = await this.messRepository.create(messData);
    return toMessDTO(created);
  }

  async updateMess(
    id: string,
    caller: { id: string; role: string },
    payload: Partial<CreateMessPayload>,
  ): Promise<Record<string, unknown>> {
    await this.assertCanManage(id, caller, "MESS_UPDATE_FORBIDDEN");

    const updated = await this.messRepository.update(id, payload as unknown as Partial<IMess>);
    if (!updated) {
      throw new NotFoundError("Mess listing not found", "MESS_NOT_FOUND");
    }

    return toMessDTO(updated);
  }

  async deleteMess(id: string, caller: { id: string; role: string }): Promise<void> {
    await this.assertCanManage(id, caller, "MESS_DELETE_FORBIDDEN");
    await this.messRepository.delete(id);
  }

  async replaceWeeklyMenu(
    id: string,
    caller: { id: string; role: string },
    weeklyMenu: MessDayMenuPayload[],
  ): Promise<Record<string, unknown>> {
    await this.assertCanManage(id, caller, "MESS_MENU_UPDATE_FORBIDDEN");

    const normalized = weeklyMenu.map((day) => ({
      day: day.day,
      breakfast: day.breakfast || [],
      lunch: day.lunch || [],
      dinner: day.dinner || [],
    }));

    const updated = await this.messRepository.update(id, {
      weeklyMenu: normalized,
    } as unknown as Partial<IMess>);

    if (!updated) {
      throw new NotFoundError("Mess listing not found", "MESS_NOT_FOUND");
    }

    return toMessDTO(updated);
  }

  async replaceMealPlans(
    id: string,
    caller: { id: string; role: string },
    mealPlans: MessMealPlanPayload[],
  ): Promise<Record<string, unknown>> {
    await this.assertCanManage(id, caller, "MESS_PLANS_UPDATE_FORBIDDEN");

    const normalized = mealPlans.map((plan) => ({
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      includedMeals: plan.includedMeals,
      price: plan.price,
      deliveryIncluded: plan.deliveryIncluded ?? false,
      pauseAllowed: plan.pauseAllowed ?? false,
      isActive: plan.isActive ?? true,
    }));

    const updated = await this.messRepository.update(id, {
      mealPlans: normalized,
    } as unknown as Partial<IMess>);

    if (!updated) {
      throw new NotFoundError("Mess listing not found", "MESS_NOT_FOUND");
    }

    return toMessDTO(updated);
  }

  private async assertCanManage(
    id: string,
    caller: { id: string; role: string },
    errorCode: string,
  ): Promise<IMess> {
    const mess = await this.messRepository.findById(id);
    if (!mess) {
      throw new NotFoundError("Mess listing not found", "MESS_NOT_FOUND");
    }

    const ownerIdStr = String(
      (mess.ownerId as unknown as { _id?: { toString(): string } })?._id ?? mess.ownerId ?? "",
    );

    if (caller.role !== "admin" && ownerIdStr !== caller.id) {
      throw new ForbiddenError("You are not authorized to manage this mess listing", errorCode);
    }

    return mess;
  }
}

function buildSeedMesses(ownerId: mongoose.Types.ObjectId): Partial<IMess>[] {
  const weeklyMenu = (
    lunchMains: [string, string],
    dinnerMains: [string, string],
  ): Record<string, unknown>[] =>
    ALL_WEEK_DAYS.map((day) => ({
      day,
      breakfast: [
        { name: "Poha & Jalebi", description: "Indori style poha with sev" },
        { name: "Masala Chai" },
      ],
      lunch: [
        { name: lunchMains[0] },
        { name: lunchMains[1] },
        { name: "Roti / Rice" },
        { name: "Salad & Papad" },
      ],
      dinner: [{ name: dinnerMains[0] }, { name: dinnerMains[1] }, { name: "Roti / Jeera Rice" }],
    }));

  const base = {
    ownerId,
    location: {
      city: "indore",
      state: "Madhya Pradesh",
      country: "India",
    },
    operatingHours: {
      openingTime: "07:00",
      closingTime: "22:30",
      openDays: ALL_WEEK_DAYS,
      is24x7: false,
    },
    mealTypes: ["breakfast", "lunch", "dinner"],
    status: "APPROVED",
    isVerified: true,
  };

  return [
    {
      ...base,
      name: "Sharma Student Mess",
      slug: "sharma-student-mess",
      description:
        "Home-style pure vegetarian mess serving Indore students near Bhawarkua for over 12 years. Unlimited roti-sabzi thali, weekly rotating menu and monthly subscription plans with pause support.",
      providerType: "mess",
      location: {
        ...base.location,
        address: "24, Bhawarkua Main Road, Near Medical College Square",
        formattedAddress: "24, Bhawarkua Main Road, Indore, Madhya Pradesh 452001",
        zipCode: "452001",
        pincode: "452001",
        latitude: 22.6926,
        longitude: 75.8677,
        coordinates: { type: "Point" as const, coordinates: [75.8677, 22.6926] },
      },
      area: "Bhawarkua",
      contact: {
        phone: "+91 98260 11223",
        email: "hello@sharmastudentmess.in",
      },
      foodPreferences: ["vegetarian", "jain"],
      pricing: { startingMealPrice: 70, currency: "INR" },
      deliveryAvailable: true,
      pickupAvailable: true,
      subscriptionAvailable: true,
      deliveryRadiusKm: 4,
      images: [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1200&q=80",
      ],
      mealPlans: [
        {
          name: "Daily Thali",
          description: "Single unlimited veg thali, dine-in or pickup",
          duration: "daily",
          includedMeals: ["lunch"],
          price: 70,
          deliveryIncluded: false,
          pauseAllowed: false,
          isActive: true,
        },
        {
          name: "Monthly Two Meals",
          description: "Lunch + dinner for 30 days with free delivery within 4 km",
          duration: "monthly",
          includedMeals: ["lunch", "dinner"],
          price: 3400,
          deliveryIncluded: true,
          pauseAllowed: true,
          isActive: true,
        },
      ],
      weeklyMenu: weeklyMenu(
        ["Aloo Gobhi", "Dal Tadka"],
        ["Paneer Bhurji", "Dal Fry"],
      ) as unknown as IMess["weeklyMenu"],
      avgRating: 4.6,
      reviewsCount: 128,
    },
    {
      ...base,
      name: "Annapurna Tiffin Service",
      slug: "annapurna-tiffin-service",
      description:
        "Vijay Nagar based tiffin service delivering fresh, hygienic North Indian meals to students and working professionals. Veg and egg options with flexible 15-day and monthly plans.",
      providerType: "tiffin",
      location: {
        ...base.location,
        address: "C-14, Scheme No. 54, Near Satya Sai Square, Vijay Nagar",
        formattedAddress: "C-14, Scheme No. 54, Vijay Nagar, Indore, Madhya Pradesh 452010",
        zipCode: "452010",
        pincode: "452010",
        latitude: 22.7533,
        longitude: 75.8937,
        coordinates: { type: "Point" as const, coordinates: [75.8937, 22.7533] },
      },
      area: "Vijay Nagar",
      contact: {
        phone: "+91 90090 44556",
        email: "orders@annapurnatiffin.in",
        website: "https://annapurnatiffin.in",
      },
      foodPreferences: ["vegetarian", "eggetarian"],
      pricing: { startingMealPrice: 85, currency: "INR" },
      deliveryAvailable: true,
      pickupAvailable: false,
      subscriptionAvailable: true,
      deliveryRadiusKm: 7,
      images: [
        "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80",
      ],
      mealPlans: [
        {
          name: "15-Day Lunch Box",
          description: "Lunch tiffin delivered to your door for 15 days",
          duration: "15_day",
          includedMeals: ["lunch"],
          price: 1250,
          deliveryIncluded: true,
          pauseAllowed: true,
          isActive: true,
        },
        {
          name: "Monthly Full Plan",
          description: "Breakfast, lunch and dinner delivered every day",
          duration: "monthly",
          includedMeals: ["breakfast", "lunch", "dinner"],
          price: 4800,
          deliveryIncluded: true,
          pauseAllowed: true,
          isActive: true,
        },
      ],
      weeklyMenu: weeklyMenu(
        ["Rajma Masala", "Mix Veg"],
        ["Chole", "Aloo Matar"],
      ) as unknown as IMess["weeklyMenu"],
      avgRating: 4.4,
      reviewsCount: 96,
    },
    {
      ...base,
      name: "Maa Ki Rasoi Home Kitchen",
      slug: "maa-ki-rasoi-home-kitchen",
      description:
        "A small home kitchen in Palasia cooking limited daily batches of ghar-jaisa khana. Jain and pure veg thalis, low oil cooking, pickup or short-radius delivery.",
      providerType: "home_kitchen",
      location: {
        ...base.location,
        address: "8, Old Palasia, Near Greater Kailash Road",
        formattedAddress: "8, Old Palasia, Indore, Madhya Pradesh 452018",
        zipCode: "452018",
        pincode: "452018",
        latitude: 22.7244,
        longitude: 75.8839,
        coordinates: { type: "Point" as const, coordinates: [75.8839, 22.7244] },
      },
      area: "Palasia",
      contact: {
        phone: "+91 94250 77889",
      },
      foodPreferences: ["vegetarian", "jain"],
      pricing: { startingMealPrice: 95, currency: "INR" },
      deliveryAvailable: true,
      pickupAvailable: true,
      subscriptionAvailable: true,
      deliveryRadiusKm: 3,
      images: [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80",
      ],
      mealPlans: [
        {
          name: "Weekly Dinner Plan",
          description: "7 home-cooked dinners, pickup only",
          duration: "weekly",
          includedMeals: ["dinner"],
          price: 630,
          deliveryIncluded: false,
          pauseAllowed: false,
          isActive: true,
        },
        {
          name: "Monthly Jain Thali",
          description: "Lunch thali cooked without onion and garlic",
          duration: "monthly",
          includedMeals: ["lunch"],
          price: 2700,
          deliveryIncluded: true,
          pauseAllowed: true,
          isActive: true,
        },
      ],
      weeklyMenu: weeklyMenu(
        ["Lauki Chana Dal", "Bhindi Masala"],
        ["Paneer Butter Masala", "Moong Dal"],
      ) as unknown as IMess["weeklyMenu"],
      avgRating: 4.8,
      reviewsCount: 41,
    },
  ] as unknown as Partial<IMess>[];
}
