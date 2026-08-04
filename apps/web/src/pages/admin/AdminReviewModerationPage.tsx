import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, CheckCircle2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/common/LoadingState";
import { fetchApi } from "@/services/api";
import type { ReviewDTO, AdminReviewAnalyticsDTO } from "@studenthub/types";

export function AdminReviewModerationPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("FLAGGED");

  // Fetch Review Moderation Queue
  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin-review-queue", selectedStatus],
    queryFn: () =>
      fetchApi<{ reviews: ReviewDTO[]; reports: unknown[]; analytics: AdminReviewAnalyticsDTO }>(
        `/reviews/admin/queue${selectedStatus ? `?status=${selectedStatus}` : ""}`,
      ),
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (vars: { reviewId: string; status: string }) =>
      fetchApi(`/reviews/admin/${vars.reviewId}/status`, {
        method: "PATCH",
        data: { status: vars.status },
      }),
    onSuccess: () => {
      toast.success("Review moderation status updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-review-queue"] });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout
        title="Review Moderation Queue"
        subtitle="Audit reported student reviews, fake reviews, and enforce community standards."
      >
        <LoadingState />
      </AdminLayout>
    );
  }

  const reviews = queueData?.reviews || [];
  const analytics = queueData?.analytics || {
    totalReviews: 0,
    pendingReportsCount: 0,
    hiddenReviewsCount: 0,
    mostReviewedListings: [],
    lowRatedOwners: [],
  };

  return (
    <AdminLayout
      title="Review Moderation & Abuse Control"
      subtitle="Audit reported fake reviews, approve pending feedback, and maintain platform trust."
    >
      {/* Moderation KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total Platform Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.totalReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified & public student reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Pending Abuse Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{analytics.pendingReportsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Fake review reports awaiting audit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Hidden / Removed Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.hiddenReviewsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Sanctioned policy violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue Tabs */}
      <Tabs defaultValue="flagged" className="mt-8 space-y-6">
        <TabsList>
          <TabsTrigger value="flagged" onClick={() => setSelectedStatus("FLAGGED")}>
            Flagged & Reported ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="all" onClick={() => setSelectedStatus("")}>
            All Platform Reviews
          </TabsTrigger>
          <TabsTrigger value="hidden" onClick={() => setSelectedStatus("HIDDEN")}>
            Hidden Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
              No flagged or reported reviews requiring admin action.
            </Card>
          ) : (
            reviews.map((r) => (
              <Card key={r.id} className="border-amber-200 bg-amber-50/10">
                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase border-amber-300 text-amber-700 bg-amber-50"
                      >
                        STATUS: {r.status}
                      </Badge>
                      <span className="font-bold text-foreground">{r.studentName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-current" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground">{r.title}</h4>
                    <p className="text-muted-foreground mt-1">{r.comment}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-[11px] text-muted-foreground">
                      Reports Count: {r.reportCount}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-semibold text-emerald-600 gap-1"
                        onClick={() =>
                          updateStatusMutation.mutate({ reviewId: r.id, status: "APPROVED" })
                        }
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Keep Visible
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs font-semibold gap-1"
                        onClick={() =>
                          updateStatusMutation.mutate({ reviewId: r.id, status: "HIDDEN" })
                        }
                      >
                        <EyeOff className="h-3.5 w-3.5" /> Hide Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">{r.title}</span>
                  <p className="text-muted-foreground">{r.comment.slice(0, 100)}...</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold">
                  {r.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hidden" className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">{r.title}</span>
                  <p className="text-muted-foreground">{r.comment}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold"
                  onClick={() =>
                    updateStatusMutation.mutate({ reviewId: r.id, status: "APPROVED" })
                  }
                >
                  Restore Review
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
