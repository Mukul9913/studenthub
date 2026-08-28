import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: DashboardStatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
