import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, Heart, Wifi, Snowflake, Utensils } from "lucide-react";
import type { Accommodation } from "../types";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  WiFi: Wifi,
  AC: Snowflake,
};

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_STYLES: Record<Accommodation["availabilityStatus"], string> = {
  Available: "bg-success/15 text-success border-success/30",
  "Filling Fast": "bg-warning/20 text-warning-foreground border-warning/40",
  Full: "bg-muted text-muted-foreground border-border",
};

export function AccommodationCard({ item }: { item: Accommodation }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg hover:shadow-primary/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={item.images[0]}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {item.verified && (
            <Badge className="gap-1 border-0 bg-primary text-primary-foreground shadow">
              <ShieldCheck className="h-3 w-3" /> Verified
            </Badge>
          )}
          <Badge variant="outline" className={`border ${STATUS_STYLES[item.availabilityStatus]}`}>
            {item.availabilityStatus}
          </Badge>
        </div>
        <button
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-muted-foreground shadow transition hover:text-accent"
          aria-label="Save listing"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.location.area}, Indore</span>
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {item.propertyType}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="font-normal">
            {item.genderPreference}
          </Badge>
          {item.foodAvailability === "Included" && (
            <Badge variant="outline" className="gap-1 font-normal">
              <Utensils className="h-3 w-3" /> Meals
            </Badge>
          )}
          {item.amenities.slice(0, 3).map((a) => {
            const Icon = AMENITY_ICONS[a];
            return (
              <Badge key={a} variant="outline" className="gap-1 font-normal">
                {Icon && <Icon className="h-3 w-3" />} {a}
              </Badge>
            );
          })}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly rent</p>
            <p className="text-lg font-bold text-foreground">
              {formatINR(item.monthlyRent)}
              <span className="text-xs font-medium text-muted-foreground"> /mo</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Deposit: {formatINR(item.securityDeposit)}
            </p>
          </div>
          <Button asChild size="sm">
            <Link to={`/accommodations/${item.id}`}>View details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
