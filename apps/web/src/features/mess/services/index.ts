import { fetchApi } from "@/services/api";
import type { MessDayMenu, MessProvider, PaginatedMesses } from "@studenthub/types";
import type { MessListFilters, MessMealPlanInput, MyMessesResponse } from "../types";

export async function getMesses(filters?: MessListFilters): Promise<PaginatedMesses> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.area && filters.area !== "all") {
      params.append("area", filters.area);
    }
    if (filters.providerType) {
      params.append("providerType", filters.providerType);
    }
    if (filters.foodPreference) {
      params.append("foodPreference", filters.foodPreference);
    }
    if (filters.mealType) {
      params.append("mealType", filters.mealType);
    }
    if (filters.minPrice) {
      params.append("minPrice", filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append("maxPrice", filters.maxPrice.toString());
    }
    if (filters.delivery) {
      params.append("delivery", "true");
    }
    if (filters.pickup) {
      params.append("pickup", "true");
    }
    if (filters.subscription) {
      params.append("subscription", "true");
    }
    if (filters.page) {
      params.append("page", filters.page.toString());
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }
    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
    }
  }

  const queryString = params.toString();
  const response = await fetchApi<PaginatedMesses>(`/mess${queryString ? `?${queryString}` : ""}`);

  return {
    items: response.items || [],
    total: response.total || 0,
    page: response.page || 1,
    pageSize: response.pageSize || 10,
    totalPages: response.totalPages || 1,
  };
}

export async function getMessByIdOrSlug(idOrSlug: string): Promise<MessProvider> {
  return fetchApi<MessProvider>(`/mess/${idOrSlug}`);
}

export async function getMyMesses(): Promise<MyMessesResponse> {
  const response = await fetchApi<MyMessesResponse>("/mess/owner/my-messes");

  return {
    items: response.items || [],
    stats: response.stats || {
      total: 0,
      published: 0,
      pendingReview: 0,
      draft: 0,
    },
  };
}

export async function createMess(data: unknown): Promise<MessProvider> {
  return fetchApi<MessProvider>("/mess", {
    method: "POST",
    data,
  });
}

export async function updateMess(id: string, data: unknown): Promise<MessProvider> {
  return fetchApi<MessProvider>(`/mess/${id}`, {
    method: "PATCH",
    data,
  });
}

export async function deleteMess(id: string): Promise<void> {
  return fetchApi<void>(`/mess/${id}`, {
    method: "DELETE",
  });
}

export async function replaceMessMenu(
  id: string,
  weeklyMenu: MessDayMenu[],
): Promise<MessProvider> {
  return fetchApi<MessProvider>(`/mess/${id}/menu`, {
    method: "PUT",
    data: { weeklyMenu },
  });
}

export async function replaceMessPlans(
  id: string,
  mealPlans: MessMealPlanInput[],
): Promise<MessProvider> {
  return fetchApi<MessProvider>(`/mess/${id}/plans`, {
    method: "PUT",
    data: { mealPlans },
  });
}
