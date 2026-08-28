import { useState, useEffect, useRef } from "react";
import { Search, MapPin, GraduationCap, Building2, Loader2 } from "lucide-react";
import { getAreaSuggestions } from "@/services/location";
import type { AreaSuggestionDTO } from "@studenthub/types";

interface PlacesAutocompleteProps {
  placeholder?: string;
  defaultValue?: string;
  city?: string;
  onSelect: (item: AreaSuggestionDTO) => void;
  className?: string;
}

export function PlacesAutocomplete({
  placeholder = "Search location, college, or coaching institute...",
  defaultValue = "",
  city = "Indore",
  onSelect,
  className = "",
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AreaSuggestionDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await getAreaSuggestions(query, city);
        setSuggestions(list);
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, city]);

  const handleSelect = (item: AreaSuggestionDTO) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelect(item);
  };

  const getIcon = (type: AreaSuggestionDTO["type"]) => {
    switch (type) {
      case "EDUCATION_CENTER":
        return <GraduationCap className="h-4 w-4 text-primary shrink-0" />;
      case "STUDY_ZONE":
        return <Building2 className="h-4 w-4 text-amber-600 shrink-0" />;
      default:
        return <MapPin className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-xl p-1.5 space-y-0.5">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs hover:bg-accent transition-colors"
            >
              {getIcon(item.type)}
              <div className="flex-1 truncate">
                <span className="font-semibold text-foreground">{item.name}</span>
                <span className="ml-2 text-[10px] text-muted-foreground">({item.city})</span>
              </div>
              <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
                {item.type.replace("_", " ")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
