import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, ExternalLink, ArrowLeft } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

import { getMyEnquiries } from "@/features/enquiry/services";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_STYLES } from "@/features/enquiry/types";

export function UserEnquiriesPage() {
  const {
    data: enquiries,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["my-enquiries"],
    queryFn: getMyEnquiries,
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
              My Enquiries & Requests
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track the status of your inquiries for PGs, rooms, and study libraries in Indore.
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
          ) : !enquiries || enquiries.length === 0 ? (
            <EmptyState
              title="No enquiries submitted yet"
              description="Browse accommodations or study libraries in Indore and click 'Enquire Now' to get in touch with owners."
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
              {enquiries.map((item) => {
                const target = item.targetDetails;
                const statusStyle = ENQUIRY_STATUS_STYLES[item.status] || "";
                const statusLabel = ENQUIRY_STATUS_LABELS[item.status] || item.status;

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
                            className={`text-[11px] font-medium ${statusStyle}`}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
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

                      <p className="text-xs text-muted-foreground">
                        Area: {target?.area || "Indore"}
                      </p>

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
