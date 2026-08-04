import { useState, useRef } from "react";
import {
  MapPin,
  Navigation,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Star,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { Button } from "../ui/button";

export interface MapMarkerItem {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price?: number;
  rating?: number;
  type?: "LIBRARY" | "ACCOMMODATION" | "EDUCATION_CENTER" | "STUDY_ZONE";
  address?: string;
  image?: string;
  link?: string;
}

interface GoogleMapContainerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerItem[];
  height?: string;
  onMarkerSelect?: (marker: MapMarkerItem) => void;
  className?: string;
}

export function GoogleMapContainer({
  center = { lat: 22.7196, lng: 75.8577 }, // Default Indore Center
  zoom = 13,
  markers = [],
  height = "450px",
  onMarkerSelect,
  className = "",
}: GoogleMapContainerProps) {
  const [activeMarker, setActiveMarker] = useState<MapMarkerItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const containerRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        () => {
          alert("Could not access your location. Please enable location permissions.");
        },
      );
    }
  };

  const handleOpenDirections = (destLat: number, destLng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    window.open(url, "_blank");
  };

  const activeCenter = userLocation || center;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
      } ${className}`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Map Header Controls */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-border bg-card/90 backdrop-blur-md px-3 py-1.5 shadow-md">
        <Compass className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">StudentHub Map Engine</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          Indore
        </span>
      </div>

      {/* Control Buttons (Right Top) */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setIsFullscreen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/90 text-foreground shadow-md backdrop-blur-md hover:bg-accent"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/90 text-foreground shadow-md backdrop-blur-md hover:bg-accent hover:text-primary"
          title="My Location"
        >
          <Navigation className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentZoom((z) => Math.min(z + 1, 18))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-sm backdrop-blur-md hover:bg-accent"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentZoom((z) => Math.max(z - 1, 8))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-sm backdrop-blur-md hover:bg-accent"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* MAP CANVAS / EMBEDDED ENGINE */}
      {apiKey ? (
        <iframe
          title="Google Maps Location Engine"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${activeCenter.lat},${activeCenter.lng}&zoom=${currentZoom}`}
        />
      ) : (
        /* OpenStreetMap Embed Engine fallback when API Key is pending */
        <iframe
          title="OpenStreetMap Location Engine"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeCenter.lng - 0.05},${
            activeCenter.lat - 0.05
          },${activeCenter.lng + 0.05},${activeCenter.lat + 0.05}&layer=mapnik&marker=${
            activeCenter.lat
          },${activeCenter.lng}`}
        />
      )}

      {/* OVERLAY MARKERS LIST / CARDS */}
      {markers.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-2 overflow-x-auto pb-1">
          {markers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setActiveMarker(m);
                if (onMarkerSelect) onMarkerSelect(m);
              }}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl border p-2.5 shadow-md backdrop-blur-md transition-all ${
                activeMarker?.id === m.id
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                  : "border-border bg-card/95 text-foreground hover:border-primary/40"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                {m.type === "EDUCATION_CENTER" ? (
                  <GraduationCap className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold max-w-[130px] truncate">{m.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  {m.price != null && (
                    <span className="font-semibold text-emerald-600">
                      ₹{m.price.toLocaleString("en-IN")}
                    </span>
                  )}
                  {m.rating != null && m.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {m.rating}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active Marker Info Card Popover */}
      {activeMarker && (
        <div className="absolute left-4 top-16 z-20 w-72 rounded-2xl border border-border bg-card p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wide">
                {activeMarker.type || "Listing"}
              </span>
              <h4 className="font-semibold text-foreground text-sm mt-1">{activeMarker.title}</h4>
            </div>
            <button
              onClick={() => setActiveMarker(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {activeMarker.address && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {activeMarker.address}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1"
              onClick={() => handleOpenDirections(activeMarker.latitude, activeMarker.longitude)}
            >
              <Navigation className="h-3 w-3" /> Get Directions
            </Button>
            {activeMarker.link && (
              <Button size="sm" className="text-xs h-7 gap-1" asChild>
                <a href={activeMarker.link}>
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
