import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  TrendingUp,
  History,
  FileText,
} from "lucide-react";

import { DashboardShell, getOwnerSidebar } from "@/components/layout/DashboardShell";
import { DashboardStatCard } from "@/components/common/DashboardStatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchApi } from "@/services/api";

interface LeadItem {
  id: string;
  targetType: string;
  status: string;
  message: string;
  createdAt: string;
  preferredDate?: string;
  preferredTime?: string;
  contactPhone?: string;
  contactEmail?: string;
  student?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  targetDetails?: {
    title?: string;
    area?: string;
    image?: string;
    link?: string;
  };
}

interface TimelineItem {
  id: string;
  action: string;
  notes?: string;
  createdAt: string;
}

interface OwnerAnalytics {
  totalLeads: number;
  todayLeads: number;
  pendingLeads: number;
  acceptedLeads: number;
  rejectedLeads: number;
  visitedLeads: number;
  convertedLeads: number;
  cancelledLeads: number;
  conversionRate: number;
}

export function OwnerLeadsPage() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [rescheduleLeadId, setRescheduleLeadId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("11:00 AM");

  const [followUpLeadId, setFollowUpLeadId] = useState<string | null>(null);
  const [followUpNote, setFollowUpNote] = useState("");

  const [timelineLeadId, setTimelineLeadId] = useState<string | null>(null);

  // 1. Fetch Owner Analytics
  const { data: analytics } = useQuery({
    queryKey: ["owner-leads-analytics"],
    queryFn: async () => {
      return fetchApi<OwnerAnalytics>("/leads/owner/analytics");
    },
  });

  // 2. Fetch Owner Leads
  const {
    data: leadsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["owner-leads", selectedStatus],
    queryFn: async () => {
      const statusParam = selectedStatus !== "ALL" ? `?status=${selectedStatus}` : "";
      const res = await fetchApi<LeadItem[]>(`/leads/owner${statusParam}`);
      return res || [];
    },
  });

  // 3. Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      leadId,
      status,
      preferredDate,
      preferredTime,
      notes,
    }: {
      leadId: string;
      status: string;
      preferredDate?: string;
      preferredTime?: string;
      notes?: string;
    }) => {
      return fetchApi(`/leads/${leadId}/status`, {
        method: "PATCH",
        data: { status, preferredDate, preferredTime, notes },
      });
    },
    onSuccess: () => {
      toast.success("Lead status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["owner-leads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-leads-analytics"] });
      setRescheduleLeadId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // 4. Follow-up Note Mutation
  const addFollowUpMutation = useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: string }) => {
      return fetchApi(`/leads/${leadId}/followups`, {
        method: "POST",
        data: { note, contactChannel: "CALL" },
      });
    },
    onSuccess: () => {
      toast.success("Follow-up note saved!");
      queryClient.invalidateQueries({ queryKey: ["owner-leads"] });
      setFollowUpLeadId(null);
      setFollowUpNote("");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Fetch Timeline Data
  const { data: timelineData } = useQuery({
    queryKey: ["lead-timeline", timelineLeadId],
    queryFn: async () => {
      if (!timelineLeadId) return null;
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/leads/${timelineLeadId}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.data;
    },
    enabled: !!timelineLeadId,
  });

  const leads = leadsData || [];

  return (
    <DashboardShell
      title="Lead Management"
      subtitle="Track, accept, reschedule, and convert student visit requests for your listings."
      links={getOwnerSidebar(user?.ownerType)}
      currentPath={pathname}
    >
      {/* Analytics Header Cards */}
      {analytics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <DashboardStatCard label="Total Leads" value={analytics.totalLeads} icon={Users} />
          <DashboardStatCard label="Today's Leads" value={analytics.todayLeads} icon={Calendar} />
          <DashboardStatCard label="Pending" value={analytics.pendingLeads} icon={Clock} />
          <DashboardStatCard label="Accepted" value={analytics.acceptedLeads} icon={CheckCircle} />
          <DashboardStatCard label="Visited" value={analytics.visitedLeads} icon={Users} />
          <DashboardStatCard label="Converted" value={analytics.convertedLeads} icon={CheckCircle} />
          <DashboardStatCard
            label="Conversion"
            value={`${analytics.conversionRate}%`}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mt-6">
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
            <TabsTrigger value="ALL" className="text-xs">
              All Leads
            </TabsTrigger>
            <TabsTrigger value="NEW" className="text-xs">
              New
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="text-xs">
              Pending
            </TabsTrigger>
            <TabsTrigger value="ACCEPTED" className="text-xs">
              Accepted
            </TabsTrigger>
            <TabsTrigger value="RESCHEDULED" className="text-xs">
              Rescheduled
            </TabsTrigger>
            <TabsTrigger value="VISITED" className="text-xs">
              Visited
            </TabsTrigger>
            <TabsTrigger value="CONVERTED" className="text-xs">
              Converted
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="text-xs">
              Rejected
            </TabsTrigger>
            <TabsTrigger value="CANCELLED" className="text-xs">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Leads List */}
      <div className="mt-6">
        {isLoading ? (
          <div className="py-12">
            <LoadingState />
          </div>
        ) : isError ? (
          <div className="py-12">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description={
              selectedStatus === "ALL"
                ? "You haven't received any visit requests yet. Keep your listings published and active!"
                : `No leads currently matching status '${selectedStatus}'.`
            }
          />
        ) : (
          <div className="space-y-4">
            {leads.map((item: LeadItem) => {
              const target = item.targetDetails;
              const student = item.student;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 lg:flex-row"
                >
                  {/* Left Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                          {item.targetType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-semibold uppercase ${
                            item.status === "CONVERTED"
                              ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                              : item.status === "ACCEPTED"
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : item.status === "VISITED"
                                  ? "border-primary/20 bg-primary/5 text-primary"
                                  : item.status === "REJECTED" || item.status === "CANCELLED"
                                    ? "border-red-300 bg-red-100 text-red-800"
                                    : "border-amber-300 bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" /> Received{" "}
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Student details */}
                    <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {student?.name
                            ? student.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                            : "S"}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            {student?.name || "Student / Aspirant"}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            Preferred Visit:{" "}
                            {item.preferredDate
                              ? new Date(item.preferredDate).toLocaleDateString("en-IN")
                              : "Flexible"}{" "}
                            ({item.preferredTime || "Anytime"})
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 border-t border-primary/10 pt-1 text-xs sm:grid-cols-2">
                        {/* Phone Actions */}
                        <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                          <div className="flex items-center gap-2 truncate">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span className="truncate font-semibold text-foreground">
                              {student?.phone || item.contactPhone || "No phone"}
                            </span>
                          </div>
                          {(student?.phone || item.contactPhone) && (
                            <div className="ml-2 flex shrink-0 items-center gap-1.5">
                              <a
                                href={`tel:${student?.phone || item.contactPhone}`}
                                className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Call
                              </a>
                              <a
                                href={`https://wa.me/91${(student?.phone || item.contactPhone || "").replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-green-700"
                              >
                                <MessageCircle className="h-3 w-3" /> WhatsApp
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate font-semibold text-foreground">
                              {student?.email || item.contactEmail || "No email"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Target listing pill */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs">
                      {target?.image && (
                        <img src={target.image} alt="" className="h-8 w-8 rounded object-cover" />
                      )}
                      <span className="truncate font-medium text-foreground">{target?.title}</span>
                      <span className="text-muted-foreground">({target?.area})</span>
                      {target?.link && (
                        <Link
                          to={target.link}
                          className="ml-auto flex items-center gap-0.5 text-primary hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    {/* Message */}
                    <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-xs italic text-muted-foreground">
                      "{item.message}"
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex min-w-[210px] flex-col justify-center gap-2 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Lead Actions
                    </span>

                    {/* Accept Visit */}
                    {(item.status === "NEW" || item.status === "PENDING") && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          size="sm"
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({ leadId: item.id, status: "ACCEPTED" })
                          }
                          className="gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({ leadId: item.id, status: "REJECTED" })
                          }
                          className="gap-1 border-red-200 text-xs text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}

                    {/* Reschedule Button */}
                    {(item.status === "NEW" ||
                      item.status === "PENDING" ||
                      item.status === "ACCEPTED") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRescheduleLeadId(item.id);
                          setRescheduleDate(
                            item.preferredDate ? item.preferredDate.split("T")[0] || "" : "",
                          );
                          setRescheduleTime(item.preferredTime || "11:00 AM");
                        }}
                        className="w-full gap-1.5 text-xs"
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-600" /> Reschedule Visit
                      </Button>
                    )}

                    {/* Mark Visited */}
                    {(item.status === "ACCEPTED" || item.status === "RESCHEDULED") && (
                      <Button
                        size="sm"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({ leadId: item.id, status: "VISITED" })
                        }
                        className="w-full gap-1.5 text-xs"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Mark as Visited
                      </Button>
                    )}

                    {/* Mark Converted */}
                    {(item.status === "ACCEPTED" ||
                      item.status === "RESCHEDULED" ||
                      item.status === "VISITED") && (
                      <Button
                        size="sm"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({ leadId: item.id, status: "CONVERTED" })
                        }
                        className="w-full gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Mark as Converted
                      </Button>
                    )}

                    {/* Add Follow-Up Note */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFollowUpLeadId(item.id)}
                      className="w-full gap-1.5 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5" /> Add Note / Follow-up
                    </Button>

                    {/* Timeline Audit Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTimelineLeadId(item.id)}
                      className="w-full gap-1.5 text-xs text-muted-foreground"
                    >
                      <History className="h-3.5 w-3.5" /> View Timeline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <Dialog open={!!rescheduleLeadId} onOpenChange={() => setRescheduleLeadId(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Reschedule Visit Request</DialogTitle>
            <DialogDescription>
              Propose a new visit date and time to the student.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rescheduleDate">New Preferred Date</Label>
              <Input
                id="rescheduleDate"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rescheduleTime">New Time Slot</Label>
              <Input
                id="rescheduleTime"
                type="text"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                placeholder="e.g. 04:00 PM"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRescheduleLeadId(null)}>
                Cancel
              </Button>
              <Button
                disabled={updateStatusMutation.isPending}
                onClick={() => {
                  if (rescheduleLeadId) {
                    updateStatusMutation.mutate({
                      leadId: rescheduleLeadId,
                      status: "RESCHEDULED",
                      preferredDate: rescheduleDate,
                      preferredTime: rescheduleTime,
                    });
                  }
                }}
                className="bg-amber-600 text-white hover:bg-amber-700"
              >
                Save & Notify Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow-up Note Modal */}
      <Dialog open={!!followUpLeadId} onOpenChange={() => setFollowUpLeadId(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Follow-Up Note</DialogTitle>
            <DialogDescription>Record call details or internal owner notes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="followUpNote">Follow-Up Note</Label>
              <Textarea
                id="followUpNote"
                rows={4}
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="e.g. Called student, confirmed visit for Saturday 11 AM..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFollowUpLeadId(null)}>
                Cancel
              </Button>
              <Button
                disabled={addFollowUpMutation.isPending || !followUpNote.trim()}
                onClick={() => {
                  if (followUpLeadId && followUpNote.trim()) {
                    addFollowUpMutation.mutate({ leadId: followUpLeadId, note: followUpNote });
                  }
                }}
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timeline Modal */}
      <Dialog open={!!timelineLeadId} onOpenChange={() => setTimelineLeadId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Lead History & Audit Timeline</DialogTitle>
            <DialogDescription>
              Full action history and owner notes for this lead.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] space-y-3 overflow-y-auto pt-2">
            {timelineData?.timelines?.length === 0 ? (
              <p className="text-xs text-muted-foreground">No history logged yet.</p>
            ) : (
              timelineData?.timelines?.map((item: TimelineItem) => (
                <div key={item.id} className="space-y-0.5 border-l-2 border-primary py-1 pl-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{item.action}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
