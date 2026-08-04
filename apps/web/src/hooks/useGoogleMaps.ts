import { useState, useEffect } from "react";

declare global {
  interface Window {
    google?: Record<string, unknown> & { maps?: unknown };
  }
}

/**
 * Reusable Custom Hook to load Google Maps JavaScript API script safely.
 */
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return undefined;
    }

    if (!apiKey) {
      setIsLoaded(false);
      return undefined;
    }

    const scriptId = "google-maps-js-sdk";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      const handleLoad = () => setIsLoaded(true);
      const handleError = () => setLoadError(new Error("Failed to load Google Maps script"));
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setLoadError(new Error("Failed to load Google Maps API script"));
    };

    document.head.appendChild(script);
    return undefined;
  }, [apiKey]);

  return { isLoaded, loadError, apiKey };
}
