import { useState, useEffect } from "react";
import { Navigation, Compass, Loader2 } from "lucide-react";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { geocodeAddress, reverseGeocode } from "@/services/location";
import type { AreaSuggestionDTO, GeocodeResultDTO } from "@studenthub/types";

interface DraggableMapPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  initialCity?: string;
  onLocationChange: (location: GeocodeResultDTO) => void;
  className?: string;
}

export function DraggableMapPicker({
  initialLatitude = 22.7196,
  initialLongitude = 75.8577,
  initialAddress = "",
  initialCity = "Indore",
  onLocationChange,
  className = "",
}: DraggableMapPickerProps) {
  const [lat, setLat] = useState(initialLatitude);
  const [lng, setLng] = useState(initialLongitude);
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [stateName, setStateName] = useState("Madhya Pradesh");
  const [pincode, setPincode] = useState("452001");
  const [isResolving, setIsResolving] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setLat(initialLatitude);
      setLng(initialLongitude);
    }
  }, [initialLatitude, initialLongitude]);

  const handlePlaceSelect = async (item: AreaSuggestionDTO) => {
    setIsResolving(true);
    try {
      const result = await geocodeAddress(item.name, item.city || city);
      setLat(result.latitude);
      setLng(result.longitude);
      setAddress(result.address || item.name);
      setCity(result.city || item.city || city);
      setStateName(result.state || "Madhya Pradesh");
      setPincode(result.pincode || "452001");
      onLocationChange(result);
    } catch {
      const fallback: GeocodeResultDTO = {
        formattedAddress: `${item.name}, ${city}, Madhya Pradesh`,
        address: item.name,
        city: item.city || city,
        state: "Madhya Pradesh",
        country: "India",
        pincode: "452001",
        latitude: item.latitude,
        longitude: item.longitude,
      };
      setLat(item.latitude);
      setLng(item.longitude);
      onLocationChange(fallback);
    } finally {
      setIsResolving(false);
    }
  };

  const handleManualCoordChange = async (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setIsResolving(true);
    try {
      const result = await reverseGeocode(newLat, newLng);
      setAddress(result.address || address);
      setCity(result.city || city);
      setStateName(result.state || stateName);
      setPincode(result.pincode || pincode);
      onLocationChange(result);
    } catch {
      onLocationChange({
        formattedAddress: `${address}, ${city}`,
        address,
        city,
        state: stateName,
        country: "India",
        pincode,
        latitude: newLat,
        longitude: newLng,
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleManualCoordChange(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          alert("Could not access location. Please check browser permissions.");
        },
      );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Autocomplete Search Bar */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-foreground">
          Search Location / College / Coaching Institute
        </label>
        <PlacesAutocomplete
          onSelect={handlePlaceSelect}
          city={city}
          placeholder="Type area, landmark, college (e.g., Bhawarkua, Physics Wallah, DAVV)..."
        />
      </div>

      {/* Map Preview Engine */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm h-64">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-2.5 py-1 backdrop-blur-md shadow-sm">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Pin Property Location</span>
          {isResolving && <Loader2 className="h-3 w-3 animate-spin text-primary ml-1" />}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card/90 text-foreground shadow-md backdrop-blur-md hover:bg-accent hover:text-primary transition-colors"
          title="Set Pin to My Current Location"
        >
          <Navigation className="h-4 w-4" />
        </button>

        {apiKey ? (
          <iframe
            title="Location Picker Engine"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`}
          />
        ) : (
          <iframe
            title="OpenStreetMap Fallback Picker"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${
              lat - 0.01
            },${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
          />
        )}
      </div>

      {/* Auto-filled Coordinate Badges */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border bg-muted/30 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block font-medium">Latitude</span>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => handleManualCoordChange(Number(e.target.value), lng)}
            className="w-full bg-transparent font-mono font-bold text-foreground focus:outline-none"
          />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block font-medium">Longitude</span>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => handleManualCoordChange(lat, Number(e.target.value))}
            className="w-full bg-transparent font-mono font-bold text-foreground focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
