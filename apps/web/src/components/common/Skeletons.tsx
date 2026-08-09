import { Skeleton } from "@/components/ui/skeleton";

export function ListingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs space-y-3">
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-[16/10]" />
      <div className="p-4 space-y-3">
        {/* Title & Badge */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/5 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Location */}
        <Skeleton className="h-4 w-4/5 rounded-md" />
        {/* Rent & Amenities */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
      {/* Header */}
      <div className="border-b border-border bg-muted/40 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1 rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-xs">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-4 w-60 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-11 w-32 rounded-xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <CardSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <Skeleton className="h-6 w-36 rounded-md" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl border border-border bg-muted/30 flex items-center justify-center p-6 text-center">
      <div className="space-y-3 flex flex-col items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-3 w-56 rounded-md" />
      </div>
    </div>
  );
}
