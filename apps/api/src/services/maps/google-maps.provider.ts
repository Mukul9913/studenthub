import type { ILocationProvider, LatLngLocation } from "./location.provider.interface.js";
import type {
  GeocodeResultDTO,
  DistanceMatrixResultDTO,
  AreaSuggestionDTO,
} from "@studenthub/types";
import { mapsConfig } from "../../config/maps.js";
import { pinoLogger } from "../../utils/logger.js";

/**
 * Haversine formula for straight-line distance fallback (in meters).
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Google Maps API Implementation of ILocationProvider.
 */
export class GoogleMapsProvider implements ILocationProvider {
  public async geocode(address: string, city = "Indore"): Promise<GeocodeResultDTO> {
    const apiKey = mapsConfig.geocodingApiKey;
    const query = `${address}, ${city}, Madhya Pradesh, India`;

    if (!apiKey) {
      pinoLogger.warn(
        { query },
        "GOOGLE_MAPS_API_KEY omitted; using default Indore fallback coordinates",
      );
      return this.getIndoreDefaultGeocode(address, city);
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query,
      )}&key=${apiKey}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        status: string;
        results: Array<{
          formatted_address: string;
          place_id: string;
          geometry: { location: { lat: number; lng: number } };
          address_components: Array<{ types: string[]; long_name: string; short_name: string }>;
        }>;
      };

      if (data.status === "OK" && data.results[0]) {
        const first = data.results[0];
        const comps = first.address_components;

        const getComp = (type: string) =>
          comps.find((c) => c.types.includes(type))?.long_name || "";

        return {
          formattedAddress: first.formatted_address,
          address: getComp("route") || getComp("sublocality") || address,
          city: getComp("locality") || city,
          state: getComp("administrative_area_level_1") || "Madhya Pradesh",
          country: getComp("country") || "India",
          pincode: getComp("postal_code") || "452001",
          latitude: first.geometry.location.lat,
          longitude: first.geometry.location.lng,
          googlePlaceId: first.place_id,
        };
      }
    } catch (err) {
      pinoLogger.error(
        { address, error: err },
        "Failed to call Google Geocoding API; falling back to default",
      );
    }

    return this.getIndoreDefaultGeocode(address, city);
  }

  public async reverseGeocode(lat: number, lng: number): Promise<GeocodeResultDTO> {
    const apiKey = mapsConfig.geocodingApiKey;

    if (!apiKey) {
      return {
        formattedAddress: `Indore, Madhya Pradesh (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        address: "Indore Locality",
        city: "Indore",
        state: "Madhya Pradesh",
        country: "India",
        pincode: "452001",
        latitude: lat,
        longitude: lng,
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        status: string;
        results: Array<{
          formatted_address: string;
          place_id: string;
          address_components: Array<{ types: string[]; long_name: string }>;
        }>;
      };

      if (data.status === "OK" && data.results[0]) {
        const first = data.results[0];
        const comps = first.address_components;
        const getComp = (type: string) =>
          comps.find((c) => c.types.includes(type))?.long_name || "";

        return {
          formattedAddress: first.formatted_address,
          address: getComp("route") || getComp("sublocality") || "Locality",
          city: getComp("locality") || "Indore",
          state: getComp("administrative_area_level_1") || "Madhya Pradesh",
          country: getComp("country") || "India",
          pincode: getComp("postal_code") || "452001",
          latitude: lat,
          longitude: lng,
          googlePlaceId: first.place_id,
        };
      }
    } catch (err) {
      pinoLogger.error({ lat, lng, error: err }, "Reverse geocode failed");
    }

    return {
      formattedAddress: `Indore, Madhya Pradesh (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      address: "Indore Area",
      city: "Indore",
      state: "Madhya Pradesh",
      country: "India",
      pincode: "452001",
      latitude: lat,
      longitude: lng,
    };
  }

  public async calculateDistanceMatrix(
    origins: LatLngLocation[],
    destinations: LatLngLocation[],
    mode: "WALKING" | "CYCLING" | "DRIVING" | "STRAIGHT" = "WALKING",
  ): Promise<DistanceMatrixResultDTO[]> {
    const results: DistanceMatrixResultDTO[] = [];
    const apiKey = mapsConfig.distanceMatrixApiKey;

    // Use straight-line calculation if STRAIGHT mode or API key absent
    if (mode === "STRAIGHT" || !apiKey) {
      for (const origin of origins) {
        for (const dest of destinations) {
          const meters = calculateHaversineDistance(
            origin.latitude,
            origin.longitude,
            dest.latitude,
            dest.longitude,
          );
          const km = Math.round((meters / 1000) * 10) / 10;
          // Approx walking speed: 80m/min = 1.33m/s
          const walkSeconds = Math.round(meters / 1.33);

          results.push({
            origin,
            destination: dest,
            distanceMeters: meters,
            distanceKm: km,
            durationSeconds: walkSeconds,
            durationText: `${Math.round(walkSeconds / 60)} mins`,
            distanceText: `${km} km`,
            mode,
          });
        }
      }
      return results;
    }

    try {
      const origStr = origins.map((o) => `${o.latitude},${o.longitude}`).join("|");
      const destStr = destinations.map((d) => `${d.latitude},${d.longitude}`).join("|");
      const modeParam = mode === "CYCLING" ? "bicycling" : mode.toLowerCase();

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origStr}&destinations=${destStr}&mode=${modeParam}&key=${apiKey}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        status: string;
        rows: Array<{
          elements: Array<{
            status: string;
            distance?: { value: number; text: string };
            duration?: { value: number; text: string };
          }>;
        }>;
      };

      if (data.status === "OK" && data.rows) {
        for (let i = 0; i < origins.length; i++) {
          for (let j = 0; j < destinations.length; j++) {
            const origin = origins[i]!;
            const dest = destinations[j]!;
            const elem = data.rows[i]?.elements[j];

            if (elem && elem.status === "OK" && elem.distance && elem.duration) {
              results.push({
                origin,
                destination: dest,
                distanceMeters: elem.distance.value,
                distanceKm: Math.round((elem.distance.value / 1000) * 10) / 10,
                durationSeconds: elem.duration.value,
                durationText: elem.duration.text,
                distanceText: elem.distance.text,
                mode,
              });
            } else {
              // Fallback for missing element
              const meters = calculateHaversineDistance(
                origin.latitude,
                origin.longitude,
                dest.latitude,
                dest.longitude,
              );
              results.push({
                origin,
                destination: dest,
                distanceMeters: meters,
                distanceKm: Math.round((meters / 1000) * 10) / 10,
                durationSeconds: Math.round(meters / 1.33),
                durationText: `${Math.round(meters / 80)} mins`,
                distanceText: `${Math.round((meters / 1000) * 10) / 10} km`,
                mode,
              });
            }
          }
        }
        return results;
      }
    } catch (err) {
      pinoLogger.error(
        { error: err },
        "Google Distance Matrix API failed; using Haversine calculation",
      );
    }

    // Fallback to Haversine if API call fails
    return this.calculateDistanceMatrix(origins, destinations, "STRAIGHT");
  }

  public async getPlaceSuggestions(input: string, city = "Indore"): Promise<AreaSuggestionDTO[]> {
    const apiKey = mapsConfig.placesApiKey;

    if (!apiKey) {
      return [
        {
          id: "bhawarkua-indore",
          name: "Bhawarkua",
          type: "STUDY_ZONE",
          city: "Indore",
          latitude: 22.6926,
          longitude: 75.8676,
        },
        {
          id: "vijay-nagar-indore",
          name: "Vijay Nagar",
          type: "STUDY_ZONE",
          city: "Indore",
          latitude: 22.7533,
          longitude: 75.8937,
        },
        {
          id: "palasia-indore",
          name: "Palasia",
          type: "STUDY_ZONE",
          city: "Indore",
          latitude: 22.7244,
          longitude: 75.8839,
        },
      ];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&components=country:in&key=${apiKey}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        status: string;
        predictions: Array<{
          place_id: string;
          description: string;
          structured_formatting: { main_text: string };
        }>;
      };

      if (data.status === "OK" && data.predictions) {
        return data.predictions.map((p) => ({
          id: p.place_id,
          name: p.structured_formatting.main_text || p.description,
          type: "AREA",
          city,
          latitude: 22.7196,
          longitude: 75.8577,
          googlePlaceId: p.place_id,
        }));
      }
    } catch (err) {
      pinoLogger.error({ input, error: err }, "Google Places Autocomplete failed");
    }

    return [];
  }

  private getIndoreDefaultGeocode(address: string, city: string): GeocodeResultDTO {
    // Standard coordinates for major Indore hubs
    const addr = address.toLowerCase();
    let lat = 22.7196;
    let lng = 75.8577;

    if (addr.includes("bhawarkua") || addr.includes("bhawar kuam")) {
      lat = 22.6926;
      lng = 75.8676;
    } else if (addr.includes("vijay nagar") || addr.includes("vijaynagar")) {
      lat = 22.7533;
      lng = 75.8937;
    } else if (addr.includes("palasia") || addr.includes("old palasia")) {
      lat = 22.7244;
      lng = 75.8839;
    } else if (addr.includes("lig")) {
      lat = 22.7381;
      lng = 75.8885;
    } else if (addr.includes("geeta bhawan")) {
      lat = 22.7161;
      lng = 75.8821;
    } else if (addr.includes("rau")) {
      lat = 22.6341;
      lng = 75.8031;
    }

    return {
      formattedAddress: `${address}, ${city}, Madhya Pradesh 452001, India`,
      address,
      city,
      state: "Madhya Pradesh",
      country: "India",
      pincode: "452001",
      latitude: lat,
      longitude: lng,
    };
  }
}

export const locationProvider: ILocationProvider = new GoogleMapsProvider();
