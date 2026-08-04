import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/services/api";
import type { SearchResultItem } from "@studenthub/types";

interface RecommendationSectionProps {
  targetType?: string;
  targetId?: string;
  lat?: number;
  lng?: number;
  title?: string;
}

export function RecommendationSection({
  targetType,
  targetId,
  lat,
  lng,
  title = "Recommended for You",
}: RecommendationSectionProps) {
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (targetType) queryParams.append("targetType", targetType);
        if (targetId) queryParams.append("targetId", targetId);
        if (lat !== undefined) queryParams.append("lat", String(lat));
        if (lng !== undefined) queryParams.append("lng", String(lng));

        const res = await fetchApi<{
          similar: SearchResultItem[];
          nearby: SearchResultItem[];
          recentlyViewed: SearchResultItem[];
        }>(`/search/recommendations?${queryParams.toString()}`);

        const combined = [
          ...(res?.similar || []),
          ...(res?.nearby || []),
          ...(res?.recentlyViewed || []),
        ];

        // Deduplicate items by ID
        const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
        setItems(unique.slice(0, 4));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [targetType, targetId, lat, lng]);

  if (loading || items.length === 0) return null;

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" /> {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const detailUrl =
            item.targetType === "LIBRARY" ? `/libraries/${item.id}` : `/accommodations/${item.id}`;

          return (
            <Link
              key={item.id}
              to={detailUrl}
              className="group rounded-2xl border border-border bg-card p-3 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
                {item.isVerified && (
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" /> {item.area}, {item.city}
                </p>
                <div className="pt-1 flex items-baseline justify-between">
                  <span className="font-bold text-foreground text-sm">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    /{item.pricingLabel}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
