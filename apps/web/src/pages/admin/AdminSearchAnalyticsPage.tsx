import { useEffect, useState } from "react";
import { Search, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/services/api";
import type { AdminSearchAnalytics } from "@studenthub/types";

export function AdminSearchAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminSearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi<AdminSearchAnalytics>(`/search/admin/analytics?days=${days}`);
      setAnalytics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load search analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  return (
    <AdminLayout
      title="Marketplace Search & Demand Telemetry"
      subtitle="Analyze student search queries, zero-result keywords, trending areas, and search-to-lead conversion rates."
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
                className="text-xs h-8"
              >
                Last {d} Days
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchAnalytics}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            Telemetry
          </Button>
        </div>

        {/* Telemetry Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Search className="h-4 w-4 text-purple-600" /> Total Marketplace Searches
              </span>
              <p className="text-2xl font-bold text-foreground">
                {analytics.totalSearches.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-rose-600" /> Zero-Result Searches
              </span>
              <p className="text-2xl font-bold text-rose-900">
                {analytics.zeroResultQueries.length}
              </p>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-indigo-600" /> Top Locality Demand
              </span>
              <p className="text-2xl font-bold text-indigo-900">
                {analytics.topAreas[0]?.area || "Bhawarkua"}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Search Conversion Rate
              </span>
              <p className="text-2xl font-bold text-emerald-900">
                {analytics.searchToLeadConversionRate}%
              </p>
            </div>
          </div>
        )}

        {/* Detailed Analytics Grid */}
        {loading ? (
          <div className="h-64 rounded-2xl border border-border bg-card p-6 animate-pulse bg-muted/40" />
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 text-xs">
            {error}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Searched Keywords */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" /> Top Searched Keywords & Colleges
              </h3>
              <div className="space-y-2">
                {analytics.topKeywords.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No keyword data captured yet.</p>
                ) : (
                  analytics.topKeywords.map((kw, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40"
                    >
                      <span className="font-semibold text-foreground">{kw.query}</span>
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {kw.count} searches
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Zero Result Queries */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" /> Unmet Demand (Zero Result
                Queries)
              </h3>
              <p className="text-xs text-rose-700">
                These keywords produced 0 results. Use this data to onboard new PG and Library
                owners in these areas.
              </p>
              <div className="space-y-2">
                {analytics.zeroResultQueries.length === 0 ? (
                  <p className="text-xs text-emerald-700 font-semibold">
                    Zero unmet queries! All searches returned listings.
                  </p>
                ) : (
                  analytics.zeroResultQueries.map((zq, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-100/60 text-rose-900 border border-rose-200"
                    >
                      <span className="font-bold">{zq.query}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-rose-200 text-rose-900 border-rose-300 font-bold"
                      >
                        {zq.count} missed searches
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
