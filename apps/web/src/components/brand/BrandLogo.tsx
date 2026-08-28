import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  to?: string;
  /** compact = mark only; full = mark + wordmark */
  variant?: "full" | "compact";
  /** inverse = for dark/primary backgrounds */
  tone?: "default" | "inverse";
  showLocation?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export function BrandLogo({
  to = "/",
  variant = "full",
  tone = "default",
  showLocation = false,
  className,
  size = "md",
}: BrandLogoProps) {
  const markSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const titleSize = size === "sm" ? "text-base" : "text-lg";

  const markClass =
    tone === "inverse"
      ? "bg-primary-foreground text-primary"
      : "bg-primary text-primary-foreground";

  const titleClass = tone === "inverse" ? "text-primary-foreground" : "text-foreground";
  const metaClass =
    tone === "inverse" ? "text-primary-foreground/70" : "text-muted-foreground";

  return (
    <Link
      to={to}
      className={cn("inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg", className)}
    >
      <span className={cn("grid place-items-center rounded-lg font-bold", markSize, markClass)}>
        {variant === "compact" ? (
          <span className="text-xs font-bold tracking-tight">SH</span>
        ) : (
          <MapPin className={iconSize} aria-hidden />
        )}
      </span>
      {variant === "full" && (
        <span className="flex flex-col">
          <span className={cn("font-bold leading-none tracking-tight", titleSize, titleClass)}>
            StudentHub
          </span>
          {showLocation && (
            <span className={cn("mt-0.5 flex items-center text-[10px]", metaClass)}>
              <MapPin className="mr-0.5 h-3 w-3 text-primary" aria-hidden />
              Indore
            </span>
          )}
        </span>
      )}
      <span className="sr-only">StudentHub home</span>
    </Link>
  );
}
