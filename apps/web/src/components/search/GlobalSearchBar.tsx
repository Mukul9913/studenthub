import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Building2, BookOpen, TrendingUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/services/api";

interface SuggestionItem {
  title: string;
  type: string;
  category: string;
  id?: string;
  area?: string;
  city?: string;
}

interface GlobalSearchBarProps {
  className?: string;
  initialQuery?: string;
  initialCategory?: string;
}

export function GlobalSearchBar({
  className = "",
  initialQuery = "",
  initialCategory = "ALL",
}: GlobalSearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [targetType, setTargetType] = useState(initialCategory);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [trendingAreas, setTrendingAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Autocomplete Suggestions (Debounced)
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetchApi<{
          suggestions: SuggestionItem[];
          trendingAreas: string[];
          popularSearches: string[];
        }>(`/search/suggestions?q=${encodeURIComponent(query)}`);

        setSuggestions(res?.suggestions || []);
        if (res?.trendingAreas) setTrendingAreas(res.trendingAreas);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (searchTerm?: string, category = targetType) => {
    const q = searchTerm !== undefined ? searchTerm : query;
    setIsOpen(false);

    const queryParams = new URLSearchParams();
    if (q.trim()) queryParams.append("q", q.trim());
    if (category !== "ALL") queryParams.append("targetType", category);

    if (category === "LIBRARY") {
      navigate(`/libraries?${queryParams.toString()}`);
    } else {
      navigate(`/accommodations?${queryParams.toString()}`);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl ${className}`}>
      <div className="flex items-center rounded-2xl border border-border bg-card shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition">
        {/* Category Dropdown */}
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="h-10 rounded-xl bg-muted/60 px-3 text-xs font-bold text-foreground border-0 focus:ring-0 cursor-pointer hidden sm:block"
        >
          <option value="ALL">All Categories</option>
          <option value="ACCOMMODATION">Properties / PGs</option>
          <option value="LIBRARY">Libraries</option>
        </select>

        {/* Query Input */}
        <div className="relative flex-1 flex items-center px-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="text"
            placeholder="Search by area, PG name, library, college..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-2.5 h-10 w-full"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={() => handleSearchSubmit()}
          className="h-10 px-5 rounded-xl text-xs font-bold gap-1.5 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Search className="h-3.5 w-3.5" /> Search
        </Button>
      </div>

      {/* Autocomplete Dropdown Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-card p-4 shadow-xl z-50 space-y-4 max-h-[380px] overflow-y-auto">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              Searching StudentHub marketplace...
            </p>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 pb-1">
                Matching Search Results
              </p>
              {suggestions.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (item.id) {
                      navigate(
                        item.category === "LIBRARY"
                          ? `/libraries/${item.id}`
                          : `/accommodations/${item.id}`,
                      );
                    } else {
                      handleSearchSubmit(item.title);
                    }
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 cursor-pointer text-xs transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.category === "LIBRARY" ? (
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="font-semibold text-foreground truncate">{item.title}</span>
                  </div>
                  {item.area && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground gap-0.5">
                      <MapPin className="h-3 w-3" /> {item.area}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : query.trim().length > 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No matching listings for "{query}". Press Enter to view all marketplace listings.
            </p>
          ) : null}

          {/* Trending Areas */}
          {trendingAreas.length > 0 && (
            <div className="pt-2 border-t border-border space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Trending Localities in Indore
              </p>
              <div className="flex flex-wrap gap-1.5">
                {trendingAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    onClick={() => handleSearchSubmit(area)}
                    className="cursor-pointer hover:bg-primary/20 text-xs py-1 px-2.5 gap-1 font-medium"
                  >
                    <MapPin className="h-3 w-3" /> {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
