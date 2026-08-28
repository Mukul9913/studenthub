import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  BarChart3,
  Eye,
  Bookmark,
  TrendingUp,
  Users,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { SEOHead } from "../../components/seo/SEOHead";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getOwnerListingAnalytics } from "@/services/crm";
import type { ListingViewAnalyticsDTO } from "@studenthub/types";

function MetricBadge({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

function TrendBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ListingAnalyticsCard({ listing }: { listing: ListingViewAnalyticsDTO }) {
  const trend = listing.viewsByDay.slice(-7);
  const recentViews = trend.reduce((sum, d) => sum + d.views, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground mb-1">
            {listing.targetType}
          </span>
          <h3 className="font-semibold text-foreground text-sm">{listing.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {listing.conversionRate > 0.05 ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`font-medium ${listing.conversionRate > 0.05 ? "text-emerald-600" : "text-red-500"}`}
          >
            {(listing.conversionRate * 100).toFixed(1)}% CVR
          </span>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-3 mb-4 py-3 border-y border-border">
        <MetricBadge value={listing.totalViews} label="Views" />
        <MetricBadge value={listing.uniqueViews} label="Unique" />
        <MetricBadge value={listing.totalSaves} label="Saves" />
        <MetricBadge value={listing.leads} label="Leads" />
      </div>

      {/* Avg duration */}
      <p className="text-xs text-muted-foreground mb-3">
        Avg. view time:{" "}
        <span className="font-medium text-foreground">
          {listing.avgViewDurationSeconds > 0
            ? `${Math.round(listing.avgViewDurationSeconds / 60)}m ${listing.avgViewDurationSeconds % 60}s`
            : "—"}
        </span>
        {" · "}Last 7 days: <span className="font-medium text-foreground">{recentViews} views</span>
      </p>

      {/* Top sources */}
      {listing.topSources.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Traffic Sources
          </p>
          {listing.topSources.slice(0, 3).map((src) => (
            <TrendBar
              key={src.source}
              label={src.source}
              count={src.count}
              max={listing.totalViews}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OwnerListingAnalyticsPage() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const links = getOwnerSidebar(user?.ownerType);

  const { data, isLoading } = useQuery({
    queryKey: ["owner-listing-analytics"],
    queryFn: getOwnerListingAnalytics,
  });

  return (
    <DashboardShell
      title="Listing Analytics"
      subtitle="Track views, saves, and lead conversion rates for all your listings"
      links={links}
      currentPath={pathname}
    >
      <SEOHead
        title="Listing Analytics | StudentHub Owner"
        description="Track views, saves, and lead conversion rates for all your listings."
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Listing Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track views, saves, and lead conversion rates for all your listings
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No analytics data available yet.
          </div>
        ) : (
          <>
            {/* Summary KPIs */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {[
                {
                  icon: Eye,
                  label: "Total Views",
                  value: data.totalViews.toLocaleString("en-IN"),
                  color: "text-blue-600",
                },
                {
                  icon: Bookmark,
                  label: "Total Saves",
                  value: data.totalSaves.toLocaleString("en-IN"),
                  color: "text-primary",
                },
                {
                  icon: Users,
                  label: "Total Leads",
                  value: data.totalLeads.toLocaleString("en-IN"),
                  color: "text-emerald-600",
                },
                {
                  icon: TrendingUp,
                  label: "Overall CTR",
                  value: `${data.overallCTR.toFixed(1)}%`,
                  color: "text-amber-600",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {label}
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Per Listing Analytics */}
            {data.listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">No listing data yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Analytics will appear after your listings start receiving views.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {data.listings.map((listing) => (
                  <ListingAnalyticsCard key={listing.listingId} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
