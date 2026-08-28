import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { Calendar, ExternalLink, Clock } from "lucide-react";

import { DashboardShell, USER_SIDEBAR } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { fetchApi } from "@/services/api";
import { cn } from "@/lib/utils";

interface UserLeadItem {
  id: string;
  targetType: string;
  status: string;
  message: string;
  createdAt: string;
  preferredDate?: string;
  preferredTime?: string;
  targetDetails?: {
    title?: string;
    area?: string;
    image?: string;
    link?: string;
  };
}

function statusBadgeClass(status: string) {
  if (status === "CONVERTED") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "ACCEPTED" || status === "VISITED")
    return "border-primary/20 bg-primary/10 text-primary";
  if (status === "REJECTED" || status === "CANCELLED")
    return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

export function UserEnquiriesPage() {
  const { pathname } = useLocation();
  const {
    data: leads,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["my-leads-and-enquiries"],
    queryFn: async () => {
      try {
        const data = await fetchApi<UserLeadItem[]>("/leads/my");
        if (data && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch {
        // Fallback to legacy endpoint
      }

      const data = await fetchApi<UserLeadItem[]>("/enquiries/me");
      return data || [];
    },
  });

  return (
    <DashboardShell
      title="My Visit Requests & Enquiries"
      subtitle="Track responses and scheduled visit times for your property and study library inquiries in Indore."
      links={USER_SIDEBAR}
      currentPath={pathname}
    >
      {isLoading ? (
        <div className="py-12">
          <LoadingState />
        </div>
      ) : isError ? (
        <div className="py-12">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : !leads || leads.length === 0 ? (
        <EmptyState
          title="No visit requests submitted yet"
          description="Browse accommodations or study libraries in Indore and click 'Request Visit' to connect directly with owners."
          action={
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/accommodations">Browse Accommodations</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/libraries">Browse Libraries</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          {leads.map((item) => {
            const target = item.targetDetails;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 sm:flex-row"
              >
                {target?.image && (
                  <img
                    src={target.image}
                    alt={target.title || "Listing"}
                    className="h-24 w-full shrink-0 rounded-lg border border-border object-cover sm:w-32"
                  />
                )}

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                        {item.targetType}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] font-semibold uppercase", statusBadgeClass(item.status))}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Submitted{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {target?.title || "Listing Target"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Area: {target?.area || "Indore"}</span>
                    {item.preferredDate && (
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <Clock className="h-3.5 w-3.5" /> Preferred Visit:{" "}
                        {new Date(item.preferredDate).toLocaleDateString("en-IN")} (
                        {item.preferredTime || "Anytime"})
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/40 p-2.5 text-xs italic text-muted-foreground">
                    "{item.message}"
                  </div>
                </div>

                {target?.link && (
                  <div className="flex items-center justify-end border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                    <Button size="sm" variant="outline" asChild className="w-full gap-1">
                      <Link to={target.link}>
                        View Listing <ExternalLink className="ml-0.5 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
