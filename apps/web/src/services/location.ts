import { fetchApi } from "./api";
import type { GeocodeResultDTO, AreaSuggestionDTO } from "@studenthub/types";

export async function geocodeAddress(address: string, city = "Indore"): Promise<GeocodeResultDTO> {
  return fetchApi<GeocodeResultDTO>("/location/geocode", {
    method: "POST",
    data: { address, city },
  });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeocodeResultDTO> {
  return fetchApi<GeocodeResultDTO>("/location/reverse-geocode", {
    method: "POST",
    data: { latitude, longitude },
  });
}

export async function getNearbyListings(params: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  targetType?: string;
  distanceMode?: string;
  limit?: number;
}): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams();
  query.set("latitude", String(params.latitude));
  query.set("longitude", String(params.longitude));
  if (params.radiusMeters) query.set("radiusMeters", String(params.radiusMeters));
  if (params.targetType) query.set("targetType", params.targetType);
  if (params.distanceMode) query.set("distanceMode", params.distanceMode);
  if (params.limit) query.set("limit", String(params.limit));

  return fetchApi<Record<string, unknown>[]>(`/location/nearby-listings?${query.toString()}`);
}

export async function getAreaSuggestions(
  input: string,
  city = "Indore",
): Promise<AreaSuggestionDTO[]> {
  if (!input || !input.trim()) return [];
  const query = new URLSearchParams({ q: input, city });
  return fetchApi<AreaSuggestionDTO[]>(`/location/area-suggestions?${query.toString()}`);
}
