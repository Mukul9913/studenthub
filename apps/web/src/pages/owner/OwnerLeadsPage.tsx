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
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

import { getOwnerLeads, updateLeadStatus } from "@/features/enquiry/services";
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_STYLES,
  type EnquiryStatus,
} from "@/features/enquiry/types";

export function OwnerLeadsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const queryClient = useQueryClient();

  const {
    data: leads,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["owner-leads", selectedStatus],
    queryFn: () => getOwnerLeads({ status: selectedStatus }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ enquiryId, status }: { enquiryId: string; status: EnquiryStatus }) =>
      updateLeadStatus(enquiryId, status),
    onSuccess: () => {
      toast.success("Lead status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["owner-leads"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update lead status");
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Top Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Users className="mr-1 h-3 w-3" /> Owner Dashboard
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Lead Management & Enquiries
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and manage incoming enquiries for your accommodation and library listings in
              Indore.
            </p>
          </div>

          <Button size="sm" asChild variant="outline">
            <Link to="/owner/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

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
              <TabsTrigger value="CONTACTED" className="text-xs">
                Contacted
              </TabsTrigger>
              <TabsTrigger value="VISIT_SCHEDULED" className="text-xs">
                Visit Scheduled
              </TabsTrigger>
              <TabsTrigger value="CONVERTED" className="text-xs">
                Converted
              </TabsTrigger>
              <TabsTrigger value="CLOSED" className="text-xs">
                Closed
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
          ) : !leads || leads.length === 0 ? (
            <EmptyState
              title="No leads found"
              description={
                selectedStatus === "ALL"
                  ? "You haven't received any enquiries yet. Make sure your listings are published!"
                  : `No leads currently matching status '${selectedStatus}'.`
              }
            />
          ) : (
            <div className="space-y-4">
              {leads.map((item) => {
                const target = item.targetDetails;
                const user = item.user;
                const statusStyle = ENQUIRY_STATUS_STYLES[item.status] || "";
                const statusLabel = ENQUIRY_STATUS_LABELS[item.status] || item.status;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col lg:flex-row gap-5 rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 shadow-sm"
                  >
                    {/* Left: User & Target Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {item.targetType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-medium ${statusStyle}`}
                          >
                            {statusLabel}
                          </Badge>
                        </div>

                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Received{" "}
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* User details */}
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {user?.name
                              ? user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "S"}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              {user?.name || "Student / Aspirant"}
                            </h3>
                            <p className="text-[11px] text-muted-foreground">
                              Enquired Student Contact Information
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 pt-1 border-t border-primary/10 text-xs">
                          {/* Phone Card */}
                          <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 border border-border">
                            <div className="flex items-center gap-2 truncate">
                              <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-foreground truncate">
                                {user?.phone || "No phone provided"}
                              </span>
                            </div>
                            {user?.phone && (
                              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                <a
                                  href={`tel:${user.phone}`}
                                  className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                                >
                                  Call
                                </a>
                                <a
                                  href={`https://wa.me/91${user.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-md bg-green-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-700 transition flex items-center gap-1"
                                >
                                  <MessageCircle className="h-3 w-3" /> WhatsApp
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Email Card */}
                          <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 border border-border">
                            <div className="flex items-center gap-2 truncate">
                              <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <span className="font-semibold text-foreground truncate">
                                {user?.email || "No email provided"}
                              </span>
                            </div>
                            {user?.email && (
                              <a
                                href={`mailto:${user.email}`}
                                className="ml-2 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 transition shrink-0"
                              >
                                Email
                              </a>
                            )}
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

                    {/* Right: Status Action Buttons */}
                    <div className="flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-5 min-w-[200px]">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Update Status
                      </span>

                      {item.status === "NEW" && (
                        <>
                          <Button
                            size="sm"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                enquiryId: item.id,
                                status: "CONTACTED",
                              })
                            }
                            className="w-full gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <Phone className="h-3.5 w-3.5" /> Mark Contacted
                          </Button>
                        </>
                      )}

                      {item.status === "CONTACTED" && (
                        <>
                          <Button
                            size="sm"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                enquiryId: item.id,
                                status: "VISIT_SCHEDULED",
                              })
                            }
                            className="w-full gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Clock className="h-3.5 w-3.5" /> Schedule Visit
                          </Button>
                        </>
                      )}

                      {item.status === "VISIT_SCHEDULED" && (
                        <>
                          <Button
                            size="sm"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                enquiryId: item.id,
                                status: "CONVERTED",
                              })
                            }
                            className="w-full gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Mark Converted
                          </Button>
                        </>
                      )}

                      {item.status !== "CLOSED" && item.status !== "CONVERTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              enquiryId: item.id,
                              status: "CLOSED",
                            })
                          }
                          className="w-full gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Close Lead
                        </Button>
                      )}

                      {item.status === "CONVERTED" && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 p-2 rounded-lg justify-center">
                          <CheckCircle className="h-4 w-4" /> Customer Converted!
                        </div>
                      )}

                      {item.status === "CLOSED" && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted p-2 rounded-lg justify-center">
                          Lead Closed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
