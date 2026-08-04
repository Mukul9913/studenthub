import { useState, useCallback } from "react";

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Reusable Custom Hook to request and track live browser Geolocation.
 */
export function useLocation() {
  const [coordinates, setCoordinates] = useState<UserCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to retrieve location");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }, []);

  return {
    coordinates,
    loading,
    error,
    getCurrentLocation,
  };
}
