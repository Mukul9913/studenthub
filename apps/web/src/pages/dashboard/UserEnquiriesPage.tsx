import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, ExternalLink, ArrowLeft, Clock } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
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

export function UserEnquiriesPage() {
  const {
    data: leads,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["my-leads-and-enquiries"],
    queryFn: async () => {
      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetch("/api/leads/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      } catch {
        // Fallback
      }

      const res = await fetch("/api/enquiries/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="h-7 p-0 hover:bg-transparent">
                <Link
                  to="/dashboard/profile"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 inline" /> Profile
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              My Visit Requests & Enquiries
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track responses and scheduled visit times for your property and study library
              inquiries in Indore.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
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
              {leads.map((item: UserLeadItem) => {
                const target = item.targetDetails;
                const status = item.status;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 shadow-sm"
                  >
                    {/* Cover image preview */}
                    {target?.image && (
                      <img
                        src={target.image}
                        alt={target.title}
                        className="h-24 w-full sm:w-32 rounded-lg object-cover border border-border shrink-0"
                      />
                    )}

                    {/* Information */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {item.targetType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-semibold uppercase ${
                              status === "CONVERTED"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : status === "ACCEPTED"
                                  ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                                  : status === "VISITED"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : status === "REJECTED" || status === "CANCELLED"
                                      ? "bg-red-100 text-red-800 border-red-300"
                                      : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {status}
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

                      <h3 className="text-base font-semibold text-foreground truncate">
                        {target?.title || "Listing Target"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Area: {target?.area || "Indore"}</span>
                        {item.preferredDate && (
                          <span className="flex items-center gap-1 text-indigo-600 font-medium">
                            <Clock className="h-3.5 w-3.5" /> Preferred Visit:{" "}
                            {new Date(item.preferredDate).toLocaleDateString("en-IN")} (
                            {item.preferredTime || "Anytime"})
                          </span>
                        )}
                      </div>

                      <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground italic border border-border/50">
                        "{item.message}"
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center justify-end gap-2 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
                      {target?.link && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="w-full gap-1 text-xs"
                        >
                          <Link to={target.link}>
                            View Listing <ExternalLink className="h-3 w-3 ml-0.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
