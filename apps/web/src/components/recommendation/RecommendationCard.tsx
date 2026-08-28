import { Link } from "react-router-dom";
import { Star, MapPin, BadgeCheck, Sparkles } from "lucide-react";
import type { RecommendationDTO } from "@studenthub/types";
import { Badge } from "../ui/badge";

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  LOCATION_MATCH: { label: "Near You", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  BUDGET_MATCH: { label: "Budget Fit", color: "bg-green-500/10 text-green-600 border-green-200" },
  HIGH_RATED: { label: "Top Rated", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  NEW_LISTING: { label: "Just Added", color: "bg-primary/10 text-primary border-primary/20" },
  TRENDING: { label: "Trending", color: "bg-rose-500/10 text-rose-600 border-rose-200" },
  INTEREST_MATCH: {
    label: "Your Style",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  FEATURED: { label: "Featured", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  VERIFIED_OWNER: {
    label: "Verified",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  },
  POPULAR_NEAR_YOU: {
    label: "Popular Here",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  },
};

const PLACEHOLDER_IMAGES = {
  LIBRARY: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&q=80",
  ACCOMMODATION: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80",
} as const;

interface RecommendationCardProps {
  rec: RecommendationDTO;
}

export function RecommendationCard({ rec }: RecommendationCardProps) {
  const href =
    rec.targetType === "LIBRARY" ? `/libraries/${rec.targetId}` : `/accommodations/${rec.targetId}`;

  const primaryReason = rec.reasons[0];
  const reasonMeta = primaryReason ? REASON_LABELS[primaryReason] : null;
  const fallbackImg =
    PLACEHOLDER_IMAGES[rec.targetType as keyof typeof PLACEHOLDER_IMAGES] ??
    PLACEHOLDER_IMAGES.LIBRARY;
  const img = rec.listing.images?.[0] || fallbackImg;

  return (
    <Link
      to={href}
      className="group snap-start shrink-0 w-68 rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-muted">
        <img
          src={img}
          alt={rec.listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.LIBRARY;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Reason badge */}
        {reasonMeta && (
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${reasonMeta.color}`}
            >
              <Sparkles className="h-2.5 w-2.5" />
              {reasonMeta.label}
            </span>
          </div>
        )}

        {/* Score chip */}
        <div className="absolute bottom-2 right-2">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
            {rec.score}% match
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {rec.listing.title}
          </h3>
          {rec.listing.isVerified && (
            <BadgeCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{rec.listing.area}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {rec.listing.rating ? (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{rec.listing.rating.toFixed(1)}</span>
              {rec.listing.reviewsCount ? (
                <span className="text-[10px] text-muted-foreground">
                  ({rec.listing.reviewsCount})
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">No reviews yet</span>
          )}
          {rec.listing.price ? (
            <span className="text-xs font-semibold text-foreground">
              ₹{rec.listing.price.toLocaleString("en-IN")}
              <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// A compact card for recently viewed
interface ViewHistoryCardProps {
  targetType: string;
  targetId: string;
  title: string;
  area?: string;
  rating?: number;
  price?: number;
  image?: string;
  viewedAt: string;
}

export function RecentlyViewedCard({
  targetType,
  targetId,
  title,
  area,
  rating,
  price,
  image,
  viewedAt,
}: ViewHistoryCardProps) {
  const href = targetType === "LIBRARY" ? `/libraries/${targetId}` : `/accommodations/${targetId}`;
  const fallbackImg =
    PLACEHOLDER_IMAGES[targetType as keyof typeof PLACEHOLDER_IMAGES] ?? PLACEHOLDER_IMAGES.LIBRARY;
  const img = image || fallbackImg;

  const timeAgo = () => {
    const diff = Date.now() - new Date(viewedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Link
      to={href}
      className="group snap-start shrink-0 w-56 rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-32 overflow-hidden bg-muted">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.LIBRARY;
          }}
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
            {timeAgo()}
          </Badge>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground line-clamp-1">{title}</p>
        {area && (
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5" />
            {area}
          </p>
        )}
        <div className="mt-1.5 flex items-center justify-between">
          {rating ? (
            <div className="flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-medium">{rating.toFixed(1)}</span>
            </div>
          ) : (
            <span />
          )}
          {price ? (
            <span className="text-[10px] font-semibold text-foreground">
              ₹{price.toLocaleString("en-IN")}/mo
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
