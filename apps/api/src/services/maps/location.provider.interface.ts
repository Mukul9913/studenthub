import type {
  GeocodeResultDTO,
  DistanceMatrixResultDTO,
  AreaSuggestionDTO,
} from "@studenthub/types";

export interface LatLngLocation {
  latitude: number;
  longitude: number;
}

export interface ILocationProvider {
  /**
   * Convert an address string to latitude, longitude, and place metadata.
   */
  geocode(address: string, city?: string): Promise<GeocodeResultDTO>;

  /**
   * Convert latitude and longitude to readable address components.
   */
  reverseGeocode(lat: number, lng: number): Promise<GeocodeResultDTO>;

  /**
   * Calculate travel distance and duration between multiple origins and destinations.
   */
  calculateDistanceMatrix(
    origins: LatLngLocation[],
    destinations: LatLngLocation[],
    mode?: "WALKING" | "CYCLING" | "DRIVING" | "STRAIGHT",
  ): Promise<DistanceMatrixResultDTO[]>;

  /**
   * Get autocomplete suggestions for areas, localities, landmarks, and education centers.
   */
  getPlaceSuggestions(input: string, city?: string): Promise<AreaSuggestionDTO[]>;
}
