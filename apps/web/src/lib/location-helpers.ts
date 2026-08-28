import { INDORE_AREAS } from "@/features/accommodation/mock-data/areas";
import type { GeocodeResultDTO } from "@studenthub/types";

export const DEFAULT_INDORE_LAT = 22.7196;
export const DEFAULT_INDORE_LNG = 75.8577;

/** Best-effort match of a geocoded address string to a known Indore locality. */
export function matchIndoreArea(...parts: Array<string | undefined | null>): string | undefined {
  const hay = parts.filter(Boolean).join(" ").toLowerCase();
  if (!hay) return undefined;

  const exact = INDORE_AREAS.find((a) => hay.includes(a.name.toLowerCase()));
  if (exact) return exact.name;

  return INDORE_AREAS.find((a) => {
    const tokens = a.slug.split("-").filter((t) => t.length >= 4);
    return tokens.length > 0 && tokens.every((t) => hay.includes(t));
  })?.name;
}

/** Apply geocode / pin result onto listing form location fields. */
export function patchFromGeocode(loc: GeocodeResultDTO): {
  address: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  formattedAddress?: string;
  area?: string;
} {
  const matchedArea = matchIndoreArea(loc.address, loc.formattedAddress, loc.city);
  return {
    address: loc.address || loc.formattedAddress,
    zipCode: loc.pincode || undefined,
    latitude: loc.latitude,
    longitude: loc.longitude,
    googlePlaceId: loc.googlePlaceId,
    formattedAddress: loc.formattedAddress,
    ...(matchedArea ? { area: matchedArea } : {}),
  };
}

export function buildGeoLocationPayload(input: {
  address: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  formattedAddress?: string;
}) {
  const lat = input.latitude ?? DEFAULT_INDORE_LAT;
  const lng = input.longitude ?? DEFAULT_INDORE_LNG;
  const zip = (input.zipCode || "452001").trim();

  return {
    address: input.address.trim(),
    city: "indore",
    state: "Madhya Pradesh",
    zipCode: zip,
    pincode: zip,
    latitude: lat,
    longitude: lng,
    ...(input.googlePlaceId ? { googlePlaceId: input.googlePlaceId } : {}),
    ...(input.formattedAddress ? { formattedAddress: input.formattedAddress } : {}),
    coordinates: {
      type: "Point" as const,
      coordinates: [lng, lat] as [number, number],
    },
  };
}
