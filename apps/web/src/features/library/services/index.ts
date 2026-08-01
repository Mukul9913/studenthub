import { fetchApi } from "@/services/api";
import type { Library } from "@studenthub/types";
import type { LibraryFilters, PaginatedLibraries } from "../types";

export async function getLibraries(
  filters?: Partial<LibraryFilters & { page?: number; limit?: number }>,
): Promise<PaginatedLibraries> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.area && filters.area !== "all") {
      params.append("area", filters.area);
    }
    if (filters.query) {
      params.append("search", filters.query);
    }
    if (filters.minFee) {
      params.append("minFee", filters.minFee.toString());
    }
    if (filters.maxFee) {
      params.append("maxFee", filters.maxFee.toString());
    }
    if (filters.ac) {
      params.append("ac", "true");
    }
    if (filters.wifi) {
      params.append("wifi", "true");
    }
    if (filters.powerBackup) {
      params.append("powerBackup", "true");
    }
    if (filters.is24x7) {
      params.append("is24x7", "true");
    }
    if (filters.page) {
      params.append("page", filters.page.toString());
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }
    if (filters.sort) {
      params.append("sortBy", filters.sort);
    }
  }

  const queryString = params.toString();
  const response = await fetchApi<PaginatedLibraries>(
    `/libraries${queryString ? `?${queryString}` : ""}`,
  );

  return {
    items: response.items || [],
    total: response.total || 0,
    page: response.page || 1,
    pageSize: response.pageSize || 10,
    totalPages: response.totalPages || 1,
  };
}

export async function getLibraryById(id: string): Promise<Library | undefined> {
  return fetchApi<Library>(`/libraries/${id}`);
}

export async function getMyLibraries(): Promise<{
  items: (Library & { status?: string; rejectionReason?: string })[];
  stats: {
    total: number;
    published: number;
    pendingReview: number;
    draft: number;
    rejected?: number;
    archived?: number;
  };
}> {
  const response = await fetchApi<{
    items: (Library & { status?: string; rejectionReason?: string })[];
    stats: {
      total: number;
      published: number;
      pendingReview: number;
      draft: number;
      rejected?: number;
      archived?: number;
    };
  }>("/libraries/owner/my-libraries");

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

export async function createLibrary(data: unknown): Promise<Library> {
  return fetchApi<Library>("/libraries", {
    method: "POST",
    data,
  });
}

export async function updateLibrary(id: string, data: unknown): Promise<Library> {
  return fetchApi<Library>(`/libraries/${id}`, {
    method: "PATCH",
    data,
  });
}

export async function deleteLibrary(id: string): Promise<void> {
  return fetchApi<void>(`/libraries/${id}`, {
    method: "DELETE",
  });
}

export async function submitLibraryForReview(id: string): Promise<Library> {
  return fetchApi<Library>(`/libraries/${id}`, {
    method: "PATCH",
    data: { status: "pending_review" },
  });
}
