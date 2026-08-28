import { useEffect, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertOctagon,
  AlertTriangle,
  MessageSquare,
  Search,
} from "lucide-react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ModerationStatusBadge } from "@/components/common/ModerationStatusBadge";
import { fetchApi } from "@/services/api";
import { toast } from "sonner";

interface ModerationItem {
  id: string;
  targetType: string;
  title: string;
  area: string;
  status: string;
  verificationStatus?: string;
  submittedAt?: string;
  rejectionReason?: string;
  moderationNotes?: string;
  updatedAt: string;
  ownerId?: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

interface AnalyticsData {
  pendingCount: number;
  underReviewCount: number;
  approvedTodayCount: number;
  rejectedTodayCount: number;
  totalApproved: number;
  totalRejected: number;
  totalSuspended: number;
  averageReviewTimeHours: number;
  topModerators: Array<{ id: string; name: string; email: string; reviewsCount: number }>;
}

interface HistoryLog {
  id: string;
  action: string;
  previousStatus?: string;
  newStatus: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  moderatorId?: { firstName?: string; lastName?: string; email?: string };
}

const REJECTION_REASONS = [
  "Incomplete Address or Location Details",
  "Low Quality / Watermarked Images",
  "Misleading Rent or Hidden Fees",
  "Unreachable Owner Phone Number",
  "Duplicate Listing Found",
  "Violates Platform Community Guidelines",
  "Other / Custom Note Required",
];

export function AdminModerationPage() {
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING_REVIEW");
  const [selectedType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Action Modal States
  const [approveItem, setApproveItem] = useState<ModerationItem | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [verifyOnApprove, setVerifyOnApprove] = useState(true);

  const [rejectItem, setRejectItem] = useState<ModerationItem | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [rejectNotes, setRejectNotes] = useState("");

  const [suspendItem, setSuspendItem] = useState<ModerationItem | null>(null);

  const [historyItem, setHistoryItem] = useState<ModerationItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (selectedStatus !== "ALL") queryParams.append("status", selectedStatus);
      if (selectedType !== "ALL") queryParams.append("targetType", selectedType);
      if (searchTerm) queryParams.append("search", searchTerm);

      const [queueRes, analyticsRes] = await Promise.all([
        fetchApi<{ items: ModerationItem[] }>(`/moderation/admin/queue?${queryParams.toString()}`),
        fetchApi<AnalyticsData>("/moderation/admin/analytics"),
      ]);

      setQueue(queueRes?.items || []);
      setAnalytics(analyticsRes || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load moderation queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedType]);

  const handleApprove = async () => {
    if (!approveItem) return;
    try {
      setSubmitting(true);
      await fetchApi("/moderation/approve", {
        method: "POST",
        body: JSON.stringify({
          targetType: approveItem.targetType,
          targetId: approveItem.id,
          notes: approveNotes,
          verifyListing: verifyOnApprove,
        }),
      });
      toast.success(`Listing '${approveItem.title}' has been approved!`);
      setApproveItem(null);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectItem) return;
    try {
      setSubmitting(true);
      await fetchApi("/moderation/reject", {
        method: "POST",
        body: JSON.stringify({
          targetType: rejectItem.targetType,
          targetId: rejectItem.id,
          reason: rejectReason,
          notes: rejectNotes,
        }),
      });
      toast.success(`Listing '${rejectItem.title}' has been rejected.`);
      setRejectItem(null);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendItem) return;
    try {
      setSubmitting(true);
      await fetchApi("/moderation/suspend", {
        method: "POST",
        body: JSON.stringify({
          targetType: suspendItem.targetType,
          targetId: suspendItem.id,
          reason: "Policy violation",
        }),
      });
      toast.success(`Listing '${suspendItem.title}' has been suspended.`);
      setSuspendItem(null);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Suspension failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async (item: ModerationItem) => {
    setHistoryItem(item);
    try {
      const logs = await fetchApi<HistoryLog[]>(
        `/moderation/${item.id}/history?targetType=${item.targetType}`,
      );
      setHistoryLogs(logs || []);
    } catch {
      setHistoryLogs([]);
    }
  };

  return (
    <AdminLayout
      title="Listing Moderation & Quality Verification"
      subtitle="Review pending property and library submissions before making them visible on the public StudentHub marketplace."
    >
      <div className="space-y-6">
        {/* Header Telemetry Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="gap-1.5 bg-primary/10 text-primary border-primary/20 py-1 px-2.5"
          >
            <ShieldCheck className="h-4 w-4" /> Moderation Control Engine
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
          </Button>
        </div>

        {/* Analytics Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
              <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Pending Review
              </span>
              <p className="text-2xl font-bold text-amber-900 mt-1">{analytics.pendingCount}</p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Under Review
              </span>
              <p className="text-2xl font-bold text-foreground mt-1">
                {analytics.underReviewCount}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Approved Today
              </span>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {analytics.approvedTodayCount}
              </p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
              <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Rejected Today
              </span>
              <p className="text-2xl font-bold text-rose-900 mt-1">
                {analytics.rejectedTodayCount}
              </p>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-sm">
              <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                <AlertOctagon className="h-3.5 w-3.5" /> Total Suspended
              </span>
              <p className="text-2xl font-bold text-foreground mt-1">{analytics.totalSuspended}</p>
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border border-border">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {[
              "PENDING_REVIEW",
              "UNDER_REVIEW",
              "APPROVED",
              "REJECTED",
              "SUSPENDED",
              "ARCHIVED",
              "ALL",
            ].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={selectedStatus === st ? "default" : "ghost"}
                onClick={() => setSelectedStatus(st)}
                className="text-xs h-8 uppercase font-semibold"
              >
                {st.replace("_", " ")}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search title, area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs w-48"
            />
            <Button size="sm" onClick={fetchData} className="h-8 text-xs gap-1">
              <Search className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>
        </div>

        {/* Queue Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-border bg-card p-4 animate-pulse bg-muted/40"
              />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" />
            <h3 className="font-bold text-foreground text-base">Moderation Queue Clean!</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No listing submissions are currently matching status '{selectedStatus}'.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Listing Details</th>
                    <th className="px-4 py-3">Property Owner</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {queue.map((item) => {
                    const ownerName = item.ownerId
                      ? `${item.ownerId.firstName || ""} ${item.ownerId.lastName || ""}`.trim() ||
                        "Owner"
                      : "Owner";

                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-foreground">{item.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge
                              variant="secondary"
                              className="uppercase text-[9px] px-1.5 py-0 font-bold"
                            >
                              {item.targetType}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {item.area}, Indore
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{ownerName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.ownerId?.email || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <ModerationStatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.submittedAt
                            ? new Date(item.submittedAt).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openHistory(item)}
                              className="h-7 text-[11px] px-2 gap-1"
                            >
                              <MessageSquare className="h-3 w-3" /> History
                            </Button>

                            {item.status !== "APPROVED" && (
                              <Button
                                size="sm"
                                onClick={() => setApproveItem(item)}
                                className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Approve
                              </Button>
                            )}

                            {item.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectItem(item)}
                                className="h-7 text-[11px] gap-1 px-2.5"
                              >
                                <XCircle className="h-3 w-3" /> Reject
                              </Button>
                            )}

                            {item.status === "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSuspendItem(item)}
                                className="h-7 text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10 px-2"
                              >
                                Suspend
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        <Dialog open={!!approveItem} onOpenChange={() => setApproveItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" /> Approve Marketplace Listing
              </DialogTitle>
              <DialogDescription>
                Approving this listing will immediately make it public across search, homepage, and
                category feeds.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/40 p-3 text-xs border border-border">
                <p className="font-bold text-foreground">{approveItem?.title}</p>
                <p className="text-muted-foreground mt-0.5">{approveItem?.area}, Indore</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verifyListing"
                  checked={verifyOnApprove}
                  onChange={(e) => setVerifyOnApprove(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor="verifyListing" className="text-xs font-semibold cursor-pointer">
                  Mark as Verified Listing (Verified Badge)
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Moderator Approval Note (Optional)</Label>
                <Textarea
                  placeholder="e.g. Listing details verified via phone check."
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setApproveItem(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {submitting ? "Approving..." : "Confirm Approval"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={!!rejectItem} onOpenChange={() => setRejectItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-700">
                <XCircle className="h-5 w-5" /> Reject Listing Submission
              </DialogTitle>
              <DialogDescription>
                Provide the owner with explicit reasons and instructions for required corrections.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Primary Rejection Reason</Label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  {REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Detailed Correction Feedback for Owner</Label>
                <Textarea
                  placeholder="Explain exactly what needs to be fixed before the owner can resubmit..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="text-xs min-h-[90px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setRejectItem(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={submitting}
                  className="font-semibold"
                >
                  {submitting ? "Rejecting..." : "Send Rejection Notice"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Modal */}
        <Dialog open={!!historyItem} onOpenChange={() => setHistoryItem(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Moderation Audit Timeline
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2 max-h-[350px] overflow-y-auto">
              {historyLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No moderation history recorded yet.</p>
              ) : (
                historyLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-primary pl-3 py-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Status:{" "}
                      <span className="font-medium text-foreground">
                        {log.previousStatus || "START"} → {log.newStatus}
                      </span>
                    </p>
                    {log.reason && (
                      <p className="text-xs font-semibold text-rose-700">Reason: {log.reason}</p>
                    )}
                    {log.notes && (
                      <p className="text-xs text-muted-foreground italic">"{log.notes}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Suspend Modal */}
        <Dialog open={!!suspendItem} onOpenChange={() => setSuspendItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-4 w-4" /> Suspend Listing
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Are you sure you want to suspend{" "}
                <strong className="text-foreground">{suspendItem?.title}</strong>? It will be hidden
                immediately.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSuspendItem(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleSuspend}
                  disabled={submitting}
                >
                  {submitting ? "Suspending..." : "Confirm Suspend"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
