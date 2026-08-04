import type { FilterQuery } from "mongoose";
import { locationProvider } from "./maps/google-maps.provider.js";
import { LibraryModel } from "../models/library.model.js";
import { PropertyModel } from "../models/property.model.js";
import type {
  GeocodeResultDTO,
  DistanceMatrixResultDTO,
  AreaSuggestionDTO,
} from "@studenthub/types";

/**
 * Convert address string to geocoded coordinates & place details using Google Maps.
 */
export async function geocodeAddress(address: string, city = "Indore"): Promise<GeocodeResultDTO> {
  return locationProvider.geocode(address, city);
}

/**
 * Convert lat/lng to human-readable address using Google Maps.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeocodeResultDTO> {
  return locationProvider.reverseGeocode(latitude, longitude);
}

/**
 * Search nearby libraries & properties within given radius (meters) using MongoDB $near 2dsphere.
 */
export async function getNearbyListings(
  latitude: number,
  longitude: number,
  radiusMeters = 5000,
  targetType = "ALL",
  distanceMode: "WALKING" | "CYCLING" | "DRIVING" | "STRAIGHT" = "STRAIGHT",
  limit = 20,
) {
  const geoNearQuery: FilterQuery<unknown> = {
    status: "APPROVED",
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusMeters,
      },
    },
  };

  const results: Array<Record<string, unknown>> = [];

  if (targetType === "LIBRARY" || targetType === "ALL") {
    const libs = await LibraryModel.find(geoNearQuery).limit(limit).lean();
    for (const lib of libs) {
      results.push({ ...lib, targetType: "LIBRARY" });
    }
  }

  if (targetType === "ACCOMMODATION" || targetType === "ALL") {
    const props = await PropertyModel.find(geoNearQuery).limit(limit).lean();
    for (const prop of props) {
      results.push({ ...prop, targetType: "ACCOMMODATION" });
    }
  }

  // Calculate distance matrix details for nearby listings
  if (results.length > 0) {
    const origins = [{ latitude, longitude }];
    const destinations = results.map((r) => {
      const loc = (r.location as Record<string, unknown>) || {};
      const coords = (loc.coordinates as { coordinates: [number, number] })?.coordinates || [
        longitude,
        latitude,
      ];
      return { latitude: coords[1] || latitude, longitude: coords[0] || longitude };
    });

    const distanceMatrix = await locationProvider.calculateDistanceMatrix(
      origins,
      destinations,
      distanceMode,
    );

    return results
      .map((item, idx) => {
        const matrixInfo = distanceMatrix[idx];
        return {
          ...item,
          id: String(item._id),
          distanceKm: matrixInfo ? matrixInfo.distanceKm : 0,
          distanceMeters: matrixInfo ? matrixInfo.distanceMeters : 0,
          durationText: matrixInfo ? matrixInfo.durationText : "N/A",
          durationSeconds: matrixInfo ? matrixInfo.durationSeconds : 0,
          distanceMode,
        };
      })
      .sort((a, b) => (a.distanceMeters as number) - (b.distanceMeters as number))
      .slice(0, limit);
  }

  return [];
}

/**
 * Calculate distance & travel duration between multiple points using Google Distance Matrix API.
 */
export async function getDistanceMatrix(
  origins: Array<{ latitude: number; longitude: number }>,
  destinations: Array<{ latitude: number; longitude: number }>,
  mode: "WALKING" | "CYCLING" | "DRIVING" | "STRAIGHT" = "WALKING",
): Promise<DistanceMatrixResultDTO[]> {
  return locationProvider.calculateDistanceMatrix(origins, destinations, mode);
}

/**
 * Get place & area autocomplete suggestions directly from Google Places API.
 */
export async function getAreaSuggestions(
  input: string,
  city = "Indore",
): Promise<AreaSuggestionDTO[]> {
  if (!input || input.trim().length < 2) return [];
  return locationProvider.getPlaceSuggestions(input, city);
}
