import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Smile, CheckCircle2, XCircle, CornerDownRight, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, getOwnerSidebar } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/common/LoadingState";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchApi } from "@/services/api";
import type { ReviewDTO, ReviewAnalyticsDTO } from "@studenthub/types";

export function OwnerReviewAnalyticsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewDTO | null>(null);
  const [replyComment, setReplyComment] = useState("");

  // Fetch Owner Review Analytics
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["owner-review-analytics"],
    queryFn: () => fetchApi<ReviewAnalyticsDTO>("/reviews/owner/analytics"),
  });

  // Fetch Reviews List
  const { data: reviewListData, isLoading: loadingList } = useQuery({
    queryKey: ["owner-reviews-list"],
    queryFn: () => fetchApi<{ items: ReviewDTO[] }>(`/reviews?ownerId=${user?.id}`),
    enabled: !!user?.id,
  });

  // Reply Mutation
  const replyMutation = useMutation({
    mutationFn: (vars: { reviewId: string; comment: string }) =>
      fetchApi(`/reviews/${vars.reviewId}/reply`, {
        method: "POST",
        data: { comment: vars.comment },
      }),
    onSuccess: () => {
      toast.success("Reply published successfully!");
      queryClient.invalidateQueries({ queryKey: ["owner-reviews-list"] });
      setReplyModalOpen(false);
      setReplyComment("");
    },
  });

  if (loadingAnalytics || loadingList) {
    return (
      <DashboardShell
        title="Student Review Analytics & Replies"
        subtitle="Track student feedback, sentiment analysis, and publish official owner replies."
        links={getOwnerSidebar(user?.ownerType)}
        currentPath="/owner/reviews"
      >
        <LoadingState />
      </DashboardShell>
    );
  }

  const analytics = analyticsData || {
    averageRating: 0,
    totalReviews: 0,
    recommendationPercentage: 100,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    mostMentionedPros: [],
    mostMentionedCons: [],
  };

  const reviews = reviewListData?.items || [];

  return (
    <DashboardShell
      title="Student Review Analytics & Replies"
      subtitle="Analyze student feedback metrics, sentiment signals, and engage directly with verified student reviewers."
      links={getOwnerSidebar(user?.ownerType)}
      currentPath="/owner/reviews"
    >
      {/* Analytics Overview Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">
              Average Rating
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              {analytics.averageRating || "N/A"}{" "}
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {analytics.totalReviews} Total Student Reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">
              Recommendation Rate
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">
              {analytics.recommendationPercentage}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Would recommend to fellow aspirants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">
              Positive Sentiment
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
              {analytics.sentiment.positive} <Smile className="h-6 w-6 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Neutral: {analytics.sentiment.neutral} | Negative: {analytics.sentiment.negative}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">
              Reviews Replied
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-purple-600">
              {reviews.filter((r) => r.reply).length} / {reviews.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active owner engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Pros & Cons Summary Chips */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Most Mentioned Pros
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-xs">
            {analytics.mostMentionedPros.length === 0 ? (
              <span className="text-muted-foreground text-xs">No pros recorded yet.</span>
            ) : (
              analytics.mostMentionedPros.map((p, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  {p.text} ({p.count})
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-red-500 flex items-center gap-1.5">
              <XCircle className="h-4 w-4" /> Areas for Improvement (Cons)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-xs">
            {analytics.mostMentionedCons.length === 0 ? (
              <span className="text-muted-foreground text-xs">No cons recorded yet.</span>
            ) : (
              analytics.mostMentionedCons.map((c, i) => (
                <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {c.text} ({c.count})
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews Reply List */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-bold">Manage & Reply to Student Reviews</h3>

        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No reviews submitted for your properties yet.
          </Card>
        ) : (
          reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{r.studentName}</span>
                      {r.isVerifiedPurchase && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]"
                        >
                          Verified Visit
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
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

                {r.reply ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                    <span className="font-semibold text-primary">Your Official Reply:</span>
                    <p className="text-muted-foreground">{r.reply.comment}</p>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs font-semibold"
                    onClick={() => {
                      setSelectedReview(r);
                      setReplyModalOpen(true);
                    }}
                  >
                    <CornerDownRight className="h-3.5 w-3.5" /> Reply to Student
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Owner Reply</DialogTitle>
            <DialogDescription className="text-xs">
              Your response will be publicly displayed under {selectedReview?.studentName}'s review.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              value={replyComment}
              onChange={(e) => setReplyComment(e.target.value)}
              placeholder="Thank the student for their review or address their specific feedback..."
              className="min-h-[100px] text-xs"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedReview && replyComment) {
                  replyMutation.mutate({ reviewId: selectedReview.id, comment: replyComment });
                }
              }}
              disabled={replyMutation.isPending}
              className="gap-1.5"
            >
              <Send className="h-4 w-4" /> Publish Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
