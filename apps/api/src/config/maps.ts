import { env } from "./env.js";

/**
 * Maps Configuration & Fallback Key Resolution.
 * Allows using dedicated keys (e.g. GOOGLE_GEOCODING_API_KEY) or falling back to a single GOOGLE_MAPS_API_KEY.
 */
export interface MapsConfig {
  mapsApiKey: string;
  geocodingApiKey: string;
  placesApiKey: string;
  distanceMatrixApiKey: string;
  isConfigured: boolean;
}

export function getMapsConfig(): MapsConfig {
  const defaultKey = env.GOOGLE_MAPS_API_KEY || "";
  const geocodingApiKey = env.GOOGLE_GEOCODING_API_KEY || defaultKey;
  const placesApiKey = env.GOOGLE_PLACES_API_KEY || defaultKey;
  const distanceMatrixApiKey = env.GOOGLE_DISTANCE_MATRIX_API_KEY || defaultKey;

  const isConfigured = Boolean(
    defaultKey || geocodingApiKey || placesApiKey || distanceMatrixApiKey,
  );

  return {
    mapsApiKey: defaultKey,
    geocodingApiKey,
    placesApiKey,
    distanceMatrixApiKey,
    isConfigured,
  };
}

export const mapsConfig = getMapsConfig();
