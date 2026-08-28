import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  children: React.ReactNode;
  badge?: string;
  accentColor?: string;
}

export function HomeSection({
  title,
  subtitle,
  viewAllHref,
  isLoading = false,
  isEmpty = false,
  children,
  badge,
  accentColor = "bg-primary",
}: HomeSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  if (isEmpty && !isLoading) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {badge && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white mb-2 ${accentColor}`}
              >
                {badge}
              </span>
            )}
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {viewAllHref && (
              <Button variant="ghost" size="sm" asChild className="text-primary font-semibold">
                <Link to={viewAllHref} className="flex items-center gap-1">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shrink-0 w-72">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="mt-3 h-4 w-3/4 rounded" />
                <Skeleton className="mt-2 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
