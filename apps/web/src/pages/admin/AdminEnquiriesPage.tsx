import { useEffect, useState } from "react";
import {
  MessageSquare,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Building2,
  BarChart2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/services/api";

interface AdminAnalytics {
  totalLeads: number;
  todayLeads: number;
  weeklyLeads: number;
  monthlyLeads: number;
  conversionRate: number;
  topListings: Array<{ id: string; title: string; targetType: string; count: number }>;
  topOwners: Array<{ id: string; name: string; email: string; count: number }>;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
}

interface LeadItem {
  id: string;
  targetType: string;
  message: string;
  status: string;
  source?: string;
  createdAt: string;
  student?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  owner?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  targetDetails?: {
    title?: string;
    area?: string;
    link?: string;
  };
}

export function AdminEnquiriesPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [leadsRes, analyticsRes] = await Promise.all([
        fetchApi<LeadItem[]>("/leads/admin"),
        fetchApi<AdminAnalytics>("/leads/admin/analytics"),
      ]);

      setLeads(leadsRes || []);
      setAnalytics(analyticsRes || null);
    } catch (err: unknown) {
      // Fallback to legacy enquiries endpoint if leads/admin endpoint has not loaded
      try {
        const legacyRes = await fetchApi<LeadItem[]>("/enquiries");
        setLeads(legacyRes || []);
      } catch {
        setError(err instanceof Error ? err.message : "Failed to load lead analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLeads = leads.filter((item) => {
    if (selectedType !== "ALL" && item.targetType !== selectedType) return false;
    if (selectedStatus !== "ALL" && item.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const studentName = item.student?.name?.toLowerCase() || "";
      const title = item.targetDetails?.title?.toLowerCase() || "";
      const ownerName = item.owner?.name?.toLowerCase() || "";
      return studentName.includes(term) || title.includes(term) || ownerName.includes(term);
    }
    return true;
  });

  return (
    <AdminLayout
      title="Platform Lead Analytics & Management"
      subtitle="Monitor total lead volume, conversion rates, and student inquiry flows across all marketplace listings."
    >
      <div className="space-y-6">
        {/* Top Action Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
            <MessageSquare className="h-3.5 w-3.5" /> Platform Lead Telemetry
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Analytics Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Total Leads</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalLeads}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
              <span className="text-xs font-medium text-blue-600">Today's Leads</span>
              <p className="text-2xl font-bold text-blue-700 mt-1">{analytics.todayLeads}</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
              <span className="text-xs font-medium text-indigo-600">Weekly Leads</span>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{analytics.weeklyLeads}</p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 shadow-sm">
              <span className="text-xs font-medium text-purple-600">Monthly Leads</span>
              <p className="text-2xl font-bold text-purple-700 mt-1">{analytics.monthlyLeads}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-600 text-white p-4 shadow-sm">
              <span className="text-xs font-medium text-emerald-100 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Conversion Rate
              </span>
              <p className="text-2xl font-bold mt-1">{analytics.conversionRate}%</p>
            </div>
          </div>
        )}

        {/* Top Rankings */}
        {analytics && (analytics.topListings?.length > 0 || analytics.topOwners?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Listings */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" /> Top Performing Listings
              </h4>
              <div className="space-y-2">
                {analytics.topListings.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/40"
                  >
                    <span className="font-medium text-foreground truncate">
                      {idx + 1}. {item.title}
                    </span>
                    <Badge variant="secondary" className="font-semibold text-indigo-700">
                      {item.count} Leads
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Owners */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" /> Top Lead Generating Owners
              </h4>
              <div className="space-y-2">
                {analytics.topOwners.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/40"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {idx + 1}. {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{item.email}</p>
                    </div>
                    <Badge variant="secondary" className="font-semibold text-emerald-700">
                      {item.count} Leads
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Control Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Input
            placeholder="Search student, owner, or listing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-72 text-xs"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedType === "ALL" ? "default" : "outline"}
              onClick={() => setSelectedType("ALL")}
              className="text-xs h-8"
            >
              All Types
            </Button>
            <Button
              size="sm"
              variant={selectedType === "ACCOMMODATION" ? "default" : "outline"}
              onClick={() => setSelectedType("ACCOMMODATION")}
              className="text-xs h-8"
            >
              Property
            </Button>
            <Button
              size="sm"
              variant={selectedType === "LIBRARY" ? "default" : "outline"}
              onClick={() => setSelectedType("LIBRARY")}
              className="text-xs h-8"
            >
              Library
            </Button>
          </div>
        </div>

        {/* Lead Table */}
        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <h3 className="font-semibold text-foreground text-sm">Failed to Load Lead Analytics</h3>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button size="sm" onClick={fetchData}>
              Retry Loading
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-border bg-card p-4 animate-pulse bg-muted/40"
              />
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
            <BarChart2 className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="font-bold text-foreground text-base">No Leads Match Criteria</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No student or professional leads found matching your search and status filters.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Student Inquirer</th>
                    <th className="px-4 py-3">Target Listing</th>
                    <th className="px-4 py-3">Listing Owner</th>
                    <th className="px-4 py-3">Source & Message</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">
                          {e.student?.name || "Student"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {e.student?.email || "—"} {e.student?.phone ? `• ${e.student.phone}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {e.targetDetails?.title || "Listing"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="uppercase text-[9px] px-1.5 py-0">
                            {e.targetType}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {e.targetDetails?.area}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{e.owner?.name || "Owner"}</p>
                        <p className="text-[11px] text-muted-foreground">{e.owner?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-muted-foreground">
                        <span className="font-semibold text-foreground text-[10px] uppercase block">
                          {e.source || "VISIT_REQUEST"}
                        </span>
                        <span className="truncate block">"{e.message}"</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`uppercase text-[10px] font-semibold ${
                            e.status === "CONVERTED"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : e.status === "ACCEPTED"
                                ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                                : e.status === "VISITED"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : e.status === "REJECTED" || e.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800 border-red-300"
                                    : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {e.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
