import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Phone,
  Calendar,
  Loader2,
  MoreHorizontal,
  ArrowRight,
  StickyNote,
} from "lucide-react";
import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { SEOHead } from "../../components/seo/SEOHead";
import { Button } from "../../components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getCRMPipeline,
  updatePipelineStage,
  addPipelineNote,
  getCRMAnalytics,
  getFollowUps,
} from "@/services/crm";
import type { LeadPipelineDTO } from "@studenthub/types";

const STAGES = [
  {
    key: "NEW_LEAD",
    label: "New Lead",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    key: "CONTACTED",
    label: "Contacted",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    key: "VISIT_SCHEDULED",
    label: "Visit Scheduled",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  {
    key: "VISITED",
    label: "Visited",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    key: "NEGOTIATION",
    label: "Negotiation",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  {
    key: "CONVERTED",
    label: "Converted",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    key: "LOST",
    label: "Lost",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
] as const;

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

function LeadCard({
  pipeline,
  onStageChange,
  onNote,
}: {
  pipeline: LeadPipelineDTO;
  onStageChange: (leadId: string, stage: string) => void;
  onNote: (leadId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const currentStageIdx = STAGES.findIndex((s) => s.key === pipeline.stage);
  const nextStage = STAGES[currentStageIdx + 1];
  const prevStage = STAGES[currentStageIdx - 1];

  const daysAgo = Math.floor(
    (Date.now() - new Date(pipeline.lead.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  const stageMeta = STAGES.find((s) => s.key === pipeline.stage);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Student & Lead info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{pipeline.lead.studentName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{pipeline.lead.targetTitle}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-card shadow-lg p-1.5">
              {prevStage && (
                <button
                  onClick={() => {
                    onStageChange(pipeline.leadId, prevStage.key);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  ← Move to {prevStage.label}
                </button>
              )}
              {nextStage && (
                <button
                  onClick={() => {
                    onStageChange(pipeline.leadId, nextStage.key);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  → Move to {nextStage.label}
                </button>
              )}
              <hr className="my-1 border-border" />
              <button
                onClick={() => {
                  onNote(pipeline.leadId);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <StickyNote className="h-3 w-3" /> Add Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stage badge */}
      <div className="mt-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${stageMeta?.color ?? ""}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${stageMeta?.dot ?? "bg-gray-400"}`} />
          {stageMeta?.label}
        </span>
      </div>

      {/* Message preview */}
      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{pipeline.lead.message}</p>

      {/* Meta row */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {pipeline.lead.studentPhone}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </span>
        </div>
        {pipeline.lead.preferredDate && (
          <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
            <Calendar className="h-3 w-3" />
            {new Date(pipeline.lead.preferredDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>

      {/* Quick advance button */}
      {nextStage && pipeline.stage !== "CONVERTED" && pipeline.stage !== "LOST" && (
        <button
          onClick={() => onStageChange(pipeline.leadId, nextStage.key)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-border bg-accent/40 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
        >
          Move to {nextStage.label} <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// Add Note Modal
function NoteModal({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const mutation = useMutation({
    mutationFn: () => addPipelineNote(leadId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" /> Add Note
        </h3>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note about this lead..."
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="mt-4 flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={!text.trim() || mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OwnerCRMPage() {
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const links = getOwnerSidebar(user?.ownerType);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [noteLeadId, setNoteLeadId] = useState<string | null>(null);

  const { data: pipeline = [], isLoading: pipelineLoading } = useQuery({
    queryKey: ["crm-pipeline"],
    queryFn: getCRMPipeline,
  });

  const { data: analytics } = useQuery({
    queryKey: ["crm-analytics"],
    queryFn: getCRMAnalytics,
  });

  const { data: followUps } = useQuery({
    queryKey: ["crm-followups"],
    queryFn: getFollowUps,
  });

  const stageMutation = useMutation({
    mutationFn: ({ leadId, stage }: { leadId: string; stage: string }) =>
      updatePipelineStage(leadId, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["crm-analytics"] });
    },
  });

  const leadsByStage = STAGES.reduce(
    (acc, s) => {
      acc[s.key] = pipeline.filter((p) => p.stage === s.key);
      return acc;
    },
    {} as Record<string, LeadPipelineDTO[]>,
  );

  const overdueCount = followUps?.overdue?.length ?? 0;
  const todayCount = followUps?.today?.length ?? 0;

  return (
    <DashboardShell
      title="Lead CRM Pipeline"
      subtitle="Manage your lead pipeline, follow-ups, and tasks in one place"
      links={links}
      currentPath={pathname}
    >
      <SEOHead
        title="CRM Pipeline | StudentHub Owner"
        description="Manage your lead pipeline, follow-ups, and tasks in one place."
      />

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead CRM</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your leads through the sales pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <KpiCard
            icon={Users}
            label="Total Leads"
            value={analytics?.totalLeads ?? 0}
            sub={`${analytics?.newLeads ?? 0} new`}
          />
          <KpiCard
            icon={TrendingUp}
            label="Conversion Rate"
            value={`${analytics?.conversionRate ?? 0}%`}
            sub={`${analytics?.convertedLeads ?? 0} converted`}
            color="text-emerald-600"
          />
          <KpiCard
            icon={Clock}
            label="Follow-ups Today"
            value={todayCount}
            sub={overdueCount > 0 ? `${overdueCount} overdue` : "All on track"}
            color={overdueCount > 0 ? "text-red-600" : "text-foreground"}
          />
          <KpiCard
            icon={CheckCircle2}
            label="Pending Tasks"
            value={analytics?.pendingFollowUps ?? 0}
            sub="Scheduled"
          />
        </div>

        {/* Overdue Follow-ups Alert */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {overdueCount} overdue follow-up{overdueCount > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-600/80">
                {followUps?.overdue
                  ?.slice(0, 2)
                  .map((f) => `${f.type} with lead`)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Today's Follow-ups */}
        {todayCount > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
              📅 Today's Follow-ups ({todayCount})
            </p>
            <div className="flex flex-wrap gap-2">
              {followUps?.today?.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                >
                  {f.type === "CALL" ? (
                    <Phone className="h-3 w-3" />
                  ) : (
                    <MessageSquare className="h-3 w-3" />
                  )}
                  {f.type}
                  <span className="text-amber-600">
                    {new Date(f.scheduledAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* KANBAN BOARD */}
        {pipelineLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : view === "kanban" ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {STAGES.map((stage) => {
                const leads = leadsByStage[stage.key] ?? [];
                return (
                  <div key={stage.key} className="w-72 shrink-0">
                    {/* Column header */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                        <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {leads.length}
                      </span>
                    </div>
                    {/* Cards */}
                    <div className="space-y-3">
                      {leads.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
                          No leads in this stage
                        </div>
                      ) : (
                        leads.map((p) => (
                          <LeadCard
                            key={p.id}
                            pipeline={p}
                            onStageChange={(leadId, stage) =>
                              stageMutation.mutate({ leadId, stage })
                            }
                            onNote={(leadId) => setNoteLeadId(leadId)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Listing
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Stage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pipeline.map((p) => {
                    const stageMeta = STAGES.find((s) => s.key === p.stage);
                    const nextStage = STAGES[STAGES.findIndex((s) => s.key === p.stage) + 1];
                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {p.lead.studentName}
                          <div className="text-xs text-muted-foreground font-normal">
                            {p.lead.studentPhone}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {p.lead.targetTitle}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${stageMeta?.color ?? ""}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${stageMeta?.dot ?? ""}`} />
                            {stageMeta?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(p.lead.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          {nextStage && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={() =>
                                stageMutation.mutate({ leadId: p.leadId, stage: nextStage.key })
                              }
                            >
                              → {nextStage.label}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {pipeline.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        No leads in your pipeline yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {noteLeadId && <NoteModal leadId={noteLeadId} onClose={() => setNoteLeadId(null)} />}
    </DashboardShell>
  );
}
