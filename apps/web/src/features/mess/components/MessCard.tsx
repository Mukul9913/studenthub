import { Link } from "react-router-dom";
import { MapPin, CheckCircle2, Star, Truck, ShoppingBag, Utensils, Leaf } from "lucide-react";
import type { MessProvider } from "@studenthub/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FOOD_PREFERENCE_LABELS,
  MEAL_TYPE_LABELS,
  PROVIDER_TYPE_LABELS,
} from "@/features/mess/labels";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80";

export function MessCard({ item }: { item: MessProvider }) {
  const coverImage = item.images && item.images.length > 0 ? item.images[0] : DEFAULT_COVER;
  const foodPreferences = item.foodPreferences || [];
  const mealTypes = item.mealTypes || [];

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-primary/40 hover:shadow-md">
      {/* Cover image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={coverImage}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {item.isVerified && (
          <Badge className="absolute left-3 top-3 bg-emerald-500 text-white flex items-center gap-1 shadow">
            <CheckCircle2 className="h-3 w-3" /> Verified Kitchen
          </Badge>
        )}
        <div className="absolute right-3 top-3 rounded-lg bg-background/90 px-2.5 py-1 backdrop-blur font-semibold text-xs shadow">
          from ₹{item.pricing?.startingMealPrice?.toLocaleString("en-IN") || 0} / meal
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition">
              {item.name}
            </h3>
            {item.reviewsCount > 0 && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {item.avgRating.toFixed(1)}
                <span className="font-normal text-muted-foreground">({item.reviewsCount})</span>
              </span>
            )}
          </div>

          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">
              {item.area}, Indore · {PROVIDER_TYPE_LABELS[item.providerType] || item.providerType}
            </span>
          </p>

          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>

          {/* Food preferences & meal types */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {foodPreferences.map((pref) => (
              <Badge
                key={pref}
                variant="secondary"
                className="gap-1 font-normal text-[11px] bg-primary/10 text-primary"
              >
                <Leaf className="h-3 w-3" /> {FOOD_PREFERENCE_LABELS[pref] || pref}
              </Badge>
            ))}
            {mealTypes.map((meal) => (
              <Badge key={meal} variant="outline" className="gap-1 font-normal text-[11px]">
                <Utensils className="h-3 w-3" /> {MEAL_TYPE_LABELS[meal] || meal}
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.deliveryAvailable && (
              <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                <Truck className="h-3 w-3" /> Delivery
              </Badge>
            )}
            {item.pickupAvailable && (
              <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                <ShoppingBag className="h-3 w-3" /> Pickup
              </Badge>
            )}
          </div>

          <Button size="sm" asChild variant="outline" className="gap-1 text-xs">
            <Link to={`/mess/${item.slug || item.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
