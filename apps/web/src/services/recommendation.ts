import { fetchApi } from "@/services/api";
import type {
  HomePageFeedDTO,
  RecommendationDTO,
  ViewHistoryDTO,
  StudentPreferenceDTO,
  SavedSearchDTO,
} from "@studenthub/types";

export async function getHomeFeed(): Promise<HomePageFeedDTO> {
  const res = await fetchApi<HomePageFeedDTO>("/recommendations/feed");
  return res;
}

export async function getForYou(
  type: "LIBRARY" | "ACCOMMODATION" | "ALL" = "ALL",
  limit = 10,
): Promise<RecommendationDTO[]> {
  return fetchApi<RecommendationDTO[]>(`/recommendations/for-you?type=${type}&limit=${limit}`);
}

export async function getTrending(
  type: "LIBRARY" | "ACCOMMODATION" = "LIBRARY",
  area?: string,
  limit = 10,
): Promise<RecommendationDTO[]> {
  const params = new URLSearchParams({ type, limit: String(limit) });
  if (area) params.append("area", area);
  return fetchApi<RecommendationDTO[]>(`/recommendations/trending?${params.toString()}`);
}

export async function getSimilarListings(
  targetType: string,
  targetId: string,
  limit = 6,
): Promise<RecommendationDTO[]> {
  return fetchApi<RecommendationDTO[]>(
    `/recommendations/similar/${targetType}/${targetId}?limit=${limit}`,
  );
}

export async function getRecentlyViewed(limit = 8): Promise<ViewHistoryDTO[]> {
  return fetchApi<ViewHistoryDTO[]>(`/recommendations/recently-viewed?limit=${limit}`);
}

export async function trackListingView(
  targetType: string,
  targetId: string,
  source = "DIRECT",
  durationSeconds?: number,
): Promise<void> {
  await fetchApi("/recommendations/track-view", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId, source, durationSeconds }),
  });
}

export async function getStudentPreferences(): Promise<StudentPreferenceDTO | null> {
  try {
    return await fetchApi<StudentPreferenceDTO>("/recommendations/preferences");
  } catch {
    return null;
  }
}

export async function updateStudentPreferences(
  data: Partial<StudentPreferenceDTO>,
): Promise<StudentPreferenceDTO> {
  return fetchApi<StudentPreferenceDTO>("/recommendations/preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getSavedSearches(): Promise<SavedSearchDTO[]> {
  return fetchApi<SavedSearchDTO[]>("/recommendations/saved-searches");
}

export async function saveSearch(data: {
  query?: string;
  filters?: Record<string, unknown>;
  targetType: string;
  label?: string;
}): Promise<SavedSearchDTO> {
  return fetchApi<SavedSearchDTO>("/recommendations/saved-searches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
