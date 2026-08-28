import { Link } from "react-router-dom";
import { MapPin, Clock, CheckCircle2, Wifi, Wind, Zap, BookOpen } from "lucide-react";
import type { Library } from "@studenthub/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80";

export function LibraryCard({ item }: { item: Library }) {
  const coverImage = item.images && item.images.length > 0 ? item.images[0] : DEFAULT_COVER;

  const facilities = item.facilities || [];
  const hasAc = facilities.includes("ac");
  const hasWifi = facilities.includes("wifi");
  const hasPower = facilities.includes("power_backup");

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-primary/40 hover:shadow-md">
      {/* Cover image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={coverImage}
          alt={item.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {item.isVerified && (
          <Badge className="absolute left-3 top-3 bg-emerald-500 text-white flex items-center gap-1 shadow">
            <CheckCircle2 className="h-3 w-3" /> Verified Space
          </Badge>
        )}
        <div className="absolute right-3 top-3 rounded-lg bg-background/90 px-2.5 py-1 backdrop-blur font-semibold text-xs shadow">
          ₹{item.pricing?.monthlyFee?.toLocaleString("en-IN") || 0} / mo
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition">
              {item.name}
            </h3>
          </div>

          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{item.area}, Indore</span>
          </p>

          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>

          {/* Key Amenities pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.operatingHours?.is24x7 ? (
              <Badge
                variant="secondary"
                className="gap-1 font-normal text-[11px] bg-primary/10 text-primary"
              >
                <Clock className="h-3 w-3" /> 24x7 Open
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                <Clock className="h-3 w-3" /> {item.operatingHours?.openingTime || "06:00"} -{" "}
                {item.operatingHours?.closingTime || "23:00"}
              </Badge>
            )}

            {hasAc && (
              <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                <Wind className="h-3 w-3" /> AC
              </Badge>
            )}
            {hasWifi && (
              <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                <Wifi className="h-3 w-3" /> Wi-Fi
              </Badge>
            )}
            {hasPower && (
              <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                <Zap className="h-3 w-3" /> Backup
              </Badge>
            )}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{item.availableSeats || 0} seats left</span>
          </div>

          <Button size="sm" asChild variant="outline" className="gap-1 text-xs">
            <Link to={`/libraries/${item.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
