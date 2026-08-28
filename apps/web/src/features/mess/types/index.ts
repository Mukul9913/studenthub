import type { MessDayMenu, MessFilters, MessMealPlan, MessProvider } from "@studenthub/types";

export type {
  FoodPreference,
  MealPlanDuration,
  MealType,
  MessContact,
  MessDayMenu,
  MessFilters,
  MessLocation,
  MessMealPlan,
  MessMenuItem,
  MessOperatingHours,
  MessPricing,
  MessProvider,
  MessProviderType,
  MessSortBy,
  MessStatus,
  MessWeekDay,
  PaginatedMesses,
} from "@studenthub/types";

/** Filters sent to `GET /mess`. `area` also accepts the "all" sentinel used by the UI. */
export type MessListFilters = Omit<MessFilters, "area"> & {
  area?: string | "all";
};

/** A meal plan before it has been persisted (server assigns the embedded id). */
export type MessMealPlanInput = Omit<MessMealPlan, "id">;

/** A weekly menu day where menu items are still being edited by the owner. */
export type MessDayMenuInput = MessDayMenu;

export interface MessOwnerStats {
  total: number;
  published: number;
  pendingReview: number;
  draft: number;
  rejected?: number;
  archived?: number;
}

export interface MyMessesResponse {
  items: MessProvider[];
  stats: MessOwnerStats;
}
