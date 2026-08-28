import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Star, Zap, Award, TrendingUp } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { fetchApi } from "@/services/api";
import type { OwnerPublicProfileDTO } from "@studenthub/types";

export function PublicOwnerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: owner,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["public-owner-profile", id],
    queryFn: () => fetchApi<OwnerPublicProfileDTO>(`/owners/${id}/profile`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="py-16">
          <LoadingState />
        </div>
      </SiteLayout>
    );
  }

  if (isError || !owner) {
    return (
      <SiteLayout>
        <div className="py-16">
          <ErrorState
            title="Owner Profile Not Found"
            description="The owner profile you are looking for does not exist."
            onRetry={refetch}
          />
        </div>
      </SiteLayout>
    );
  }

  const score = owner.performanceScore || 70;
  const badges = owner.badges || [];
  const listings = owner.listings || [];

  return (
    <SiteLayout>
      <div className="py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6 space-y-8">
          {/* Owner Profile Banner Card */}
          <Card className="overflow-hidden border border-border bg-card">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground font-extrabold grid place-items-center text-2xl uppercase shrink-0">
                    {owner.name.charAt(0)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                        {owner.name}
                      </h1>
                      {owner.isVerified && (
                        <Badge className="bg-emerald-600 text-white font-semibold text-xs gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified Partner
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>• Member for {owner.yearsOnPlatform} year(s)</span>
                      <span>• {owner.totalListings} Active Properties</span>
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {badges.map((b) => (
                        <Badge
                          key={b.id}
                          variant="outline"
                          className="text-[10px] uppercase font-bold border-primary/20 bg-primary/10 text-primary gap-1"
                        >
                          <Award className="h-3 w-3" /> {b.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Dial Badge */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center min-w-[140px]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Performance Score
                  </span>
                  <span className="text-4xl font-extrabold text-primary mt-1">{score}/100</span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Top 5% Indore Partner
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-foreground">
                  {owner.averageRating || "4.5"}
                </span>
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Total Student Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-foreground">
                  {owner.totalReviewsCount}
                </span>
                <Award className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Lead Acceptance Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {owner.leadAcceptanceRate}%
                </span>
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-foreground">
                  &lt; {owner.avgResponseTimeMinutes} mins
                </span>
                <Zap className="h-6 w-6 text-amber-500" />
              </CardContent>
            </Card>
          </div>

          {/* Active Listings Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Listings by {owner.name} <Badge variant="secondary">{listings.length}</Badge>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <Card
                  key={l.id}
                  className="overflow-hidden flex flex-col justify-between transition hover:border-primary/50"
                >
                  <div>
                    <img
                      src={
                        l.images[0] ||
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={l.title}
                      className="h-44 w-full object-cover"
                    />
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">
                          {l.targetType}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" /> {l.averageRating || "4.5"}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold mt-2 line-clamp-1">
                        {l.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {l.area}, {l.city}
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <CardContent className="p-4 pt-0 flex items-center justify-between border-t border-border mt-3">
                    <span className="text-sm font-extrabold text-foreground">
                      {l.price > 0 ? `₹${l.price.toLocaleString("en-IN")}/mo` : "Contact for Price"}
                    </span>
                    <Button size="sm" variant="outline" asChild className="text-xs font-bold">
                      <Link
                        to={
                          l.targetType === "LIBRARY"
                            ? `/libraries/${l.id}`
                            : `/accommodations/${l.id}`
                        }
                      >
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
