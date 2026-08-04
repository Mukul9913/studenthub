import { useState, useEffect } from "react";
import { getAreaSuggestions, geocodeAddress } from "@/services/location";
import type { AreaSuggestionDTO, GeocodeResultDTO } from "@studenthub/types";

/**
 * Reusable Custom Hook for Places Autocomplete with geocode resolution.
 */
export function usePlacesAutocomplete(city = "Indore") {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AreaSuggestionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResultDTO | null>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await getAreaSuggestions(query, city);
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, city]);

  const selectPlace = async (suggestion: AreaSuggestionDTO): Promise<GeocodeResultDTO> => {
    setLoading(true);
    try {
      const result = await geocodeAddress(suggestion.name, city);
      setSelectedPlace(result);
      setSuggestions([]);
      setQuery(suggestion.name);
      return result;
    } catch {
      const fallback: GeocodeResultDTO = {
        formattedAddress: `${suggestion.name}, ${city}, Madhya Pradesh, India`,
        address: suggestion.name,
        city,
        state: "Madhya Pradesh",
        country: "India",
        pincode: "452001",
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      };
      setSelectedPlace(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    setQuery,
    suggestions,
    loading,
    selectedPlace,
    selectPlace,
  };
}
