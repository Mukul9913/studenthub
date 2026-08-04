import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  ThumbsUp,
  ShieldCheck,
  Flag,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchApi } from "@/services/api";
import type { ReviewDTO } from "@studenthub/types";

interface ReviewSectionProps {
  targetType: "ACCOMMODATION" | "LIBRARY";
  targetId: string;
  targetTitle: string;
  ownerId?: string;
}

export function ReviewSection({ targetType, targetId, targetTitle }: ReviewSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Review Form State
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    prosText: "",
    consText: "",
    wouldRecommend: true,
    isAnonymous: false,
    imageUrl: "",
  });

  // Report Form State
  const [reportReason, setReportReason] = useState<
    "FAKE_REVIEW" | "SPAM" | "ABUSIVE_LANGUAGE" | "IRRELEVANT" | "OTHER"
  >("SPAM");
  const [reportDetails, setReportDetails] = useState("");

  // Fetch Reviews
  const { data: reviewData } = useQuery({
    queryKey: ["reviews", targetType, targetId, filterRating],
    queryFn: () => {
      const url = `/reviews?targetType=${targetType}&targetId=${targetId}${filterRating ? `&rating=${filterRating}` : ""}`;
      return fetchApi<{ items: ReviewDTO[]; total: number }>(url);
    },
  });

  // Create Review Mutation
  const createReviewMutation = useMutation({
    mutationFn: (newReview: unknown) =>
      fetchApi<ReviewDTO>("/reviews", {
        method: "POST",
        data: newReview,
      }),
    onSuccess: () => {
      toast.success("Thank you! Your verified review has been published.");
      queryClient.invalidateQueries({ queryKey: ["reviews", targetType, targetId] });
      setWriteModalOpen(false);
      setForm({
        rating: 5,
        title: "",
        comment: "",
        prosText: "",
        consText: "",
        wouldRecommend: true,
        isAnonymous: false,
        imageUrl: "",
      });
    },
    onError: (err: { response?: { data?: { error?: { code?: string }; message?: string } } }) => {
      if (err?.response?.data?.error?.code === "REVIEW_VERIFICATION_REQUIRED") {
        toast.error(
          "Verified Lead Required: You can only review listings you have inquired about or visited.",
        );
      } else {
        toast.error(err?.response?.data?.message || "Failed to submit review.");
      }
    },
  });

  // React to Review Mutation
  const reactMutation = useMutation({
    mutationFn: (vars: { reviewId: string; type: "HELPFUL" | "LIKE" }) =>
      fetchApi(`/reviews/${vars.reviewId}/react`, {
        method: "POST",
        data: { type: vars.type },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", targetType, targetId] });
    },
  });

  // Report Review Mutation
  const reportMutation = useMutation({
    mutationFn: (vars: { reviewId: string; reason: string; details?: string }) =>
      fetchApi(`/reviews/${vars.reviewId}/report`, {
        method: "POST",
        data: { reason: vars.reason, details: vars.details },
      }),
    onSuccess: () => {
      toast.success("Review reported for moderation review.");
      setReportModalOpen(false);
    },
  });

  const reviews = reviewData?.items || [];
  const total = reviewData?.total || 0;

  // Calculate Rating Metrics
  const avgRating =
    total > 0 ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / total) * 10) / 10 : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      total > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
  }));

  const recommendedPercentage =
    total > 0 ? Math.round((reviews.filter((r) => r.wouldRecommend).length / total) * 100) : 100;

  return (
    <section className="mt-12 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Student Reviews & Ratings{" "}
            <Badge variant="secondary" className="text-xs">
              {total}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground">
            Authentic reviews verified through student lead inquiries and visit bookings.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!user) {
              toast.error("Please login to write a verified review.");
              return;
            }
            setWriteModalOpen(true);
          }}
          className="gap-1.5 font-semibold text-xs"
        >
          <Sparkles className="h-4 w-4" /> Write a Review
        </Button>
      </div>

      {/* Rating Summary Header Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3 md:items-center">
            {/* Score Display */}
            <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0">
              <span className="text-5xl font-extrabold text-foreground">{avgRating || "N/A"}</span>
              <div className="flex items-center gap-1 mt-2 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(avgRating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {total} verified reviews
              </p>
              <Badge className="mt-3 bg-emerald-600 text-white text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" /> {recommendedPercentage}% Recommend
              </Badge>
            </div>

            {/* Rating Bars */}
            <div className="space-y-2 md:col-span-2">
              {ratingCounts.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-medium flex items-center gap-1">
                    {star} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  </span>
                  <Progress value={percentage} className="h-2 flex-1 bg-muted" />
                  <span className="w-8 text-right text-muted-foreground font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Rating Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
        <Button
          variant={filterRating === null ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 rounded-full"
          onClick={() => setFilterRating(null)}
        >
          All Reviews ({total})
        </Button>
        {[5, 4, 3, 2, 1].map((star) => (
          <Button
            key={star}
            variant={filterRating === star ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 rounded-full gap-1"
            onClick={() => setFilterRating(star)}
          >
            {star} <Star className="h-3 w-3 fill-current" />
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No reviews yet for this listing. Be the first verified student to share your experience!
          </Card>
        ) : (
          reviews.map((r) => (
            <Card key={r.id} className="transition hover:border-border/80">
              <CardContent className="p-5 space-y-4">
                {/* Author Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold grid place-items-center text-xs uppercase">
                      {r.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{r.studentName}</span>
                        {r.isVerifiedPurchase && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 gap-1"
                          >
                            <ShieldCheck className="h-3 w-3" /> Verified Student Visit
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= r.rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Title & Comment */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">{r.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {r.comment}
                  </p>
                </div>

                {/* Pros & Cons Pills */}
                {(r.pros.length > 0 || r.cons.length > 0) && (
                  <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-border/50 text-xs">
                    {r.pros.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Pros:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {r.pros.map((p, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-emerald-50/50 text-emerald-700 border-emerald-200 text-[10px]"
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {r.cons.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Cons:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {r.cons.map((c, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-red-50/50 text-red-700 border-red-200 text-[10px]"
                            >
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Images */}
                {r.images && r.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-1">
                    {r.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review photo ${idx + 1}`}
                        className="h-16 w-16 object-cover rounded-lg border border-border"
                      />
                    ))}
                  </div>
                )}

                {/* Owner Reply */}
                {r.reply && (
                  <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs space-y-1 mt-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground font-bold text-[9px]">
                        OWNER RESPONSE
                      </Badge>
                      <span className="font-semibold text-foreground">{r.reply.ownerName}</span>
                    </div>
                    <p className="text-muted-foreground">{r.reply.comment}</p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground gap-1.5"
                    onClick={() => reactMutation.mutate({ reviewId: r.id, type: "HELPFUL" })}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({r.helpfulCount})
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground gap-1.5 hover:text-red-500"
                    onClick={() => {
                      setSelectedReviewId(r.id);
                      setReportModalOpen(true);
                    }}
                  >
                    <Flag className="h-3.5 w-3.5" /> Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Write Review Dialog */}
      <Dialog open={writeModalOpen} onOpenChange={setWriteModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Write a Verified Student Review</DialogTitle>
            <DialogDescription className="text-xs">
              Share your authentic feedback for {targetTitle}. Only verified student inquiries are
              accepted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Rating Stars Selection */}
            <div>
              <Label className="text-xs font-semibold">Your Rating</Label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setForm({ ...form, rating: star })}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= form.rating
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="font-bold text-sm ml-2">{form.rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Review Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Quiet study hall with fast 5G wifi"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Detailed Review Comment</Label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Describe seat comfort, noise level, owner responsiveness, hygiene..."
                className="mt-1 min-h-[90px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Pros (Comma separated)</Label>
                <Input
                  value={form.prosText}
                  onChange={(e) => setForm({ ...form, prosText: e.target.value })}
                  placeholder="e.g. Clean AC, 24x7 Open"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Cons (Comma separated)</Label>
                <Input
                  value={form.consText}
                  onChange={(e) => setForm({ ...form, consText: e.target.value })}
                  placeholder="e.g. Parking space limited"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Image URL (Optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://cloudinary.com/photo.jpg"
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="anonymous"
                checked={form.isAnonymous}
                onCheckedChange={(c) => setForm({ ...form, isAnonymous: !!c })}
              />
              <Label htmlFor="anonymous" className="text-xs font-normal cursor-pointer">
                Post anonymously (Hide my name and profile photo)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWriteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!form.title || !form.comment) {
                  toast.error("Please enter a title and comment");
                  return;
                }
                const pros = form.prosText
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const cons = form.consText
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const images = form.imageUrl ? [form.imageUrl] : [];

                createReviewMutation.mutate({
                  targetType,
                  targetId,
                  rating: form.rating,
                  title: form.title,
                  comment: form.comment,
                  pros,
                  cons,
                  wouldRecommend: form.wouldRecommend,
                  isAnonymous: form.isAnonymous,
                  images,
                });
              }}
              disabled={createReviewMutation.isPending}
              className="gap-1.5"
            >
              <Send className="h-4 w-4" /> Submit Verified Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Review Dialog */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Review for Admin Audit</DialogTitle>
            <DialogDescription className="text-xs">
              If you believe this review is fake, abusive, or contains spam, flag it for moderator
              investigation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Report Reason</Label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as unknown as typeof reportReason)}
                className="mt-1 w-full rounded-md border border-border bg-background p-2 text-xs font-medium"
              >
                <option value="FAKE_REVIEW">Fake Review / Never Visited</option>
                <option value="SPAM">Spam or Commercial Promotion</option>
                <option value="ABUSIVE_LANGUAGE">Abusive / Harassing Language</option>
                <option value="IRRELEVANT">Irrelevant Content</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Additional Details</Label>
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Explain why this review violates StudentHub community guidelines..."
                className="mt-1 min-h-[70px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedReviewId) {
                  reportMutation.mutate({
                    reviewId: selectedReviewId,
                    reason: reportReason,
                    details: reportDetails,
                  });
                }
              }}
              disabled={reportMutation.isPending}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
