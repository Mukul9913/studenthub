import { List, Map } from "lucide-react";

interface MapViewToggleProps {
  view: "list" | "map";
  onToggle: (view: "list" | "map") => void;
  className?: string;
}

export function MapViewToggle({ view, onToggle, className = "" }: MapViewToggleProps) {
  return (
    <div
      className={`inline-flex rounded-xl border border-border bg-card p-1 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => onToggle("list")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          view === "list"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <List className="h-3.5 w-3.5" />
        List View
      </button>

      <button
        type="button"
        onClick={() => onToggle("map")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          view === "map"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Map className="h-3.5 w-3.5" />
        Map View
      </button>
    </div>
  );
}
