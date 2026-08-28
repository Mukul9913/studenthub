import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertCircle, Filter, Building2, BookOpen } from "lucide-react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAdminOwners, type AdminOwnersResponse } from "@/features/admin/services/admin.service";

export function AdminOwnersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const ownerTypeParam = searchParams.get("ownerType") || "all";
  const searchParam = searchParams.get("search") || "";

  const [data, setData] = useState<AdminOwnersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminOwners({
        ownerType: ownerTypeParam,
        search: searchParam,
        page,
        limit: 10,
      });
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [ownerTypeParam, searchParam, page]);

  const setFilter = (key: string, val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === "all" || !val) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
      return next;
    });
    setPage(1);
  };

  const getOwnerTypeBadge = (ownerType: string) => {
    switch (ownerType) {
      case "library":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1">
            <BookOpen className="h-3 w-3" /> Library Owner
          </Badge>
        );
      case "mess":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
            Mess Owner
          </Badge>
        );
      case "service_provider":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Service Provider
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 gap-1">
            <Building2 className="h-3 w-3" /> Accommodation Owner
          </Badge>
        );
    }
  };

  return (
    <AdminLayout
      title="Business Owners Management"
      subtitle="View, search, and monitor verified business partners across Indore verticals."
    >
      {/* Search & Domain Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by owner name, email, phone..."
            value={searchParam}
            onChange={(e) => setFilter("search", e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Domain:</span>
          {[
            { id: "all", label: "All Owners" },
            { id: "accommodation", label: "Accommodation" },
            { id: "library", label: "Library" },
            { id: "mess", label: "Mess" },
            { id: "service_provider", label: "Services" },
          ].map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={ownerTypeParam === tab.id ? "default" : "outline"}
              onClick={() => setFilter("ownerType", tab.id)}
              className="text-xs rounded-xl"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="font-semibold text-foreground text-sm">Failed to Load Owners</h3>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button size="sm" onClick={fetchOwners}>
            Retry Loading
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-border bg-card p-4 animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
          <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="font-bold text-foreground text-base">No Owners Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No business owner matching your search or domain filter was found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Owner Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Business Domain</th>
                    <th className="px-4 py-3">Active Listings</th>
                    <th className="px-4 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {o.firstName} {o.lastName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{o.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.phone || "—"}</td>
                      <td className="px-4 py-3">{getOwnerTypeBadge(o.ownerType)}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {o.listingsCount} listing{o.listingsCount === 1 ? "" : "s"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>
              Showing {data.items.length} of {data.total} owners
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={data.items.length < 10 || page * 10 >= data.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
