import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  BookOpen,
  MessageSquare,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Briefcase,
  UserCheck,
} from "lucide-react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview, type AdminOverviewData } from "@/features/admin/services/admin.service";

export function AdminDashboard() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await getAdminOverview();
      setData(overview);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load admin overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout
      title="Admin Control Center"
      subtitle="Operational control panel for managing platform users, listings, approvals, and enquiries in Indore."
    >
      {/* Action Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live DB Sync
          </Badge>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadData}
          disabled={loading}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="font-semibold text-foreground text-sm">Failed to Load Overview</h3>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button size="sm" onClick={loadData}>
            Retry Loading
          </Button>
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-border bg-card p-5 animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Overview Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Users */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Platform Users
                </span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {data.users.total}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                <span>{data.users.students} Students</span>
                <span>•</span>
                <span>{data.users.owners} Owners</span>
              </div>
            </div>

            {/* Total Accommodations */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Accommodations
                </span>
                <Building2 className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {data.listings.accommodation}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">PGs, Hostels & Rooms</p>
            </div>

            {/* Total Libraries */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Study Libraries
                </span>
                <BookOpen className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {data.listings.library}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">Self-Study Spaces</p>
            </div>

            {/* Pending Approvals */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Pending Approvals
                </span>
                <Clock className="h-4 w-4 text-rose-500" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {data.approvals.pending}
              </p>
              <p className="text-[11px] text-rose-600 font-medium pt-1">Awaiting Admin Review</p>
            </div>
          </div>

          {/* Operational Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Registrations Table */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Recent Registrations</h3>
                </div>
                <Button size="sm" variant="ghost" className="text-xs gap-1" asChild>
                  <Link to="/admin/users">
                    View All Users <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {data.recentRegistrations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No recent user registrations found.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentRegistrations.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-muted-foreground text-[11px]">{u.email}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          variant="secondary"
                          className={
                            u.role === "owner"
                              ? "bg-amber-500/10 text-amber-600"
                              : u.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : "bg-blue-500/10 text-blue-600"
                          }
                        >
                          {u.role} {u.ownerType ? `(${u.ownerType})` : ""}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Listing Activity */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-foreground">Recent Listings Submitted</h3>
                </div>
                <Button size="sm" variant="ghost" className="text-xs gap-1" asChild>
                  <Link to="/admin/listings">
                    Manage Listings <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {data.recentListings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No recent listing submissions.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentListings.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{l.name}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {l.domain}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          {l.area} • Owner: {l.ownerName}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          className={
                            l.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : l.status === "rejected"
                                ? "bg-rose-500/10 text-rose-600"
                                : "bg-amber-500/10 text-amber-600"
                          }
                        >
                          {l.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(l.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              to="/admin/listings?status=pending_review"
              className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 hover:border-amber-500/60 transition group"
            >
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  Moderation
                </p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  Review Pending Listings ({data.approvals.pending})
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/admin/owners"
              className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-4 hover:border-primary/60 transition group"
            >
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Owners
                </p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  Business Owners ({data.users.owners})
                </p>
              </div>
              <Briefcase className="h-4 w-4 text-primary group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/admin/enquiries"
              className="flex items-center justify-between rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 hover:border-blue-500/60 transition group"
            >
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Inquiries
                </p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  Platform Leads ({data.enquiries.total})
                </p>
              </div>
              <MessageSquare className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
