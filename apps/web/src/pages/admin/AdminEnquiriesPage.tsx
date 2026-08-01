import { useEffect, useState } from "react";
import { MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/services/api";

interface EnquiryItem {
  id: string;
  targetType: string;
  message: string;
  status: string;
  createdAt: string;
  user?: {
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
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi<EnquiryItem[]>("/enquiries");
      setEnquiries(res || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  return (
    <AdminLayout
      title="Platform Enquiries & Leads"
      subtitle="Monitor user lead activity and customer interest across accommodation and library listings."
    >
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1">
          <MessageSquare className="h-3.5 w-3.5 text-purple-600" /> Platform Inquiry Log
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchEnquiries}
          disabled={loading}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="font-semibold text-foreground text-sm">Failed to Load Enquiries</h3>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button size="sm" onClick={fetchEnquiries}>
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
      ) : enquiries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="font-bold text-foreground text-base">No Enquiries Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No student or professional enquiries have been submitted on the platform yet.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Inquirer Student</th>
                  <th className="px-4 py-3">Target Listing</th>
                  <th className="px-4 py-3">Listing Owner</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{e.user?.name || "Student"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {e.user?.email || "—"} {e.user?.phone ? `• ${e.user.phone}` : ""}
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
                    <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                      "{e.message}"
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-purple-500/10 text-purple-600">{e.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
