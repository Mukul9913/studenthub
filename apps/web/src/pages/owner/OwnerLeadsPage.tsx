import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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

import { SiteLayout } from "@/components/layout/SiteLayout";
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

export function OwnerLeadsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [rescheduleLeadId, setRescheduleLeadId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("11:00 AM");

  const [followUpLeadId, setFollowUpLeadId] = useState<string | null>(null);
  const [followUpNote, setFollowUpNote] = useState("");

  const [timelineLeadId, setTimelineLeadId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // 1. Fetch Owner Analytics
  const { data: analytics } = useQuery({
    queryKey: ["owner-leads-analytics"],
    queryFn: async () => {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/leads/owner/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.data;
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
      const token = localStorage.getItem("token") || "";
      const statusParam = selectedStatus !== "ALL" ? `?status=${selectedStatus}` : "";
      const res = await fetch(`/api/leads/owner${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.data || [];
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
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, preferredDate, preferredTime, notes }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || json.error?.message || "Failed to update lead status");
      }
      return json.data;
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
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/leads/${leadId}/followups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note, contactChannel: "CALL" }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || json.error?.message || "Failed to add follow-up note");
      }
      return json.data;
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
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Top Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Users className="mr-1 h-3 w-3" /> Owner Dashboard
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Lead Management & Visit Requests
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track, accept, reschedule, and convert student leads for your listings in Indore.
            </p>
          </div>

          <Button size="sm" asChild variant="outline">
            <Link to="/owner/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Analytics Header Cards */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500">Total Leads</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{analytics.totalLeads}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 shadow-sm">
              <span className="text-[11px] font-medium text-blue-600">Today's Leads</span>
              <p className="text-xl font-bold text-blue-700 mt-1">{analytics.todayLeads}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 shadow-sm">
              <span className="text-[11px] font-medium text-amber-600">Pending</span>
              <p className="text-xl font-bold text-amber-700 mt-1">{analytics.pendingLeads}</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 shadow-sm">
              <span className="text-[11px] font-medium text-indigo-600">Accepted</span>
              <p className="text-xl font-bold text-indigo-700 mt-1">{analytics.acceptedLeads}</p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 shadow-sm">
              <span className="text-[11px] font-medium text-purple-600">Visited</span>
              <p className="text-xl font-bold text-purple-700 mt-1">{analytics.visitedLeads}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 shadow-sm">
              <span className="text-[11px] font-medium text-emerald-600">Converted</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">{analytics.convertedLeads}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-600 text-white p-3 shadow-sm">
              <span className="text-[11px] font-medium text-emerald-100 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Conversion
              </span>
              <p className="text-xl font-bold mt-1">{analytics.conversionRate}%</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mt-6">
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
            <TabsList className="flex flex-wrap justify-start h-auto gap-1 bg-muted/60 p-1">
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
                    className="flex flex-col lg:flex-row gap-5 rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 shadow-sm"
                  >
                    {/* Left Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {item.targetType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-semibold uppercase ${
                              item.status === "CONVERTED"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : item.status === "ACCEPTED"
                                  ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                                  : item.status === "VISITED"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : item.status === "REJECTED" || item.status === "CANCELLED"
                                      ? "bg-red-100 text-red-800 border-red-300"
                                      : "bg-amber-100 text-amber-800 border-amber-300"
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
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3.5 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 text-white font-bold text-sm">
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

                        <div className="grid gap-2 sm:grid-cols-2 pt-1 border-t border-indigo-100 text-xs">
                          {/* Phone Actions */}
                          <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 border border-border">
                            <div className="flex items-center gap-2 truncate">
                              <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-foreground truncate">
                                {student?.phone || item.contactPhone || "No phone"}
                              </span>
                            </div>
                            {(student?.phone || item.contactPhone) && (
                              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                <a
                                  href={`tel:${student?.phone || item.contactPhone}`}
                                  className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                                >
                                  Call
                                </a>
                                <a
                                  href={`https://wa.me/91${(student?.phone || item.contactPhone || "").replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-md bg-green-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-700 transition flex items-center gap-1"
                                >
                                  <MessageCircle className="h-3 w-3" /> WhatsApp
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Email */}
                          <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 border border-border">
                            <div className="flex items-center gap-2 truncate">
                              <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <span className="font-semibold text-foreground truncate">
                                {student?.email || item.contactEmail || "No email"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Target listing pill */}
                      <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-2.5 border border-border/60 text-xs">
                        {target?.image && (
                          <img src={target.image} alt="" className="h-8 w-8 rounded object-cover" />
                        )}
                        <span className="font-medium text-foreground truncate">
                          {target?.title}
                        </span>
                        <span className="text-muted-foreground">({target?.area})</span>
                        {target?.link && (
                          <Link
                            to={target.link}
                            className="ml-auto text-primary hover:underline flex items-center gap-0.5"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      {/* Message */}
                      <div className="text-xs text-muted-foreground italic bg-muted/20 p-2.5 rounded-lg border border-border/40">
                        "{item.message}"
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-5 min-w-[210px]">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
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
                            className="text-xs text-red-600 hover:bg-red-50 border-red-200 gap-1"
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
                          className="w-full text-xs gap-1.5"
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
                          className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
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
                          className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Mark as Converted
                        </Button>
                      )}

                      {/* Add Follow-Up Note */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setFollowUpLeadId(item.id)}
                        className="w-full text-xs gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5" /> Add Note / Follow-up
                      </Button>

                      {/* Timeline Audit Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTimelineLeadId(item.id)}
                        className="w-full text-xs text-muted-foreground gap-1.5"
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
                  className="bg-amber-600 hover:bg-amber-700 text-white"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
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

            <div className="space-y-3 max-h-[400px] overflow-y-auto pt-2">
              {timelineData?.timelines?.length === 0 ? (
                <p className="text-xs text-muted-foreground">No history logged yet.</p>
              ) : (
                timelineData?.timelines?.map((item: TimelineItem) => (
                  <div key={item.id} className="border-l-2 border-indigo-500 pl-3 py-1 space-y-0.5">
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
      </div>
    </SiteLayout>
  );
}
