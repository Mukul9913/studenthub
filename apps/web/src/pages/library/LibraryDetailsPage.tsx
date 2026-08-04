import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  ArrowLeft,
  BookOpen,
  Check,
  Heart,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { StickyContactCard } from "@/components/common/StickyContactCard";
import { RecommendationSection } from "@/components/search/RecommendationSection";
import { ReviewSection } from "@/components/review/ReviewSection";
import { EnquiryModal } from "@/features/enquiry/components/EnquiryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { getLibraryById } from "@/features/library/services";
import { FACILITY_LABELS } from "@/features/library/schemas";
import type { LibraryFacility } from "@studenthub/types";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80";

export function LibraryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["library", id],
    queryFn: () => getLibraryById(id!),
    enabled: !!id,
  });

  const jsonLd = item
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: item.name,
        description: item.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: item.location.address,
          addressLocality: item.area,
          addressRegion: "Indore",
          postalCode: "452001",
          addressCountry: "IN",
        },
        priceRange: `₹${item.pricing?.monthlyFee || 1000}`,
      }
    : undefined;

  useEffect(() => {
    if (item?.name) {
      document.title = `${item.name} in ${item.area}, Indore | StudentHub`;
    }
  }, [item?.name, item?.area]);

  const toggleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success("Saved to your wishlist!");
    } else {
      toast.info("Removed from wishlist.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item?.name,
          text: `Check out ${item?.name} in ${item?.area} on StudentHub!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-16">
          <LoadingState />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-16">
          <ErrorState
            title="Study Space Not Found"
            description="The library or study desk listing you are looking for does not exist or has been unlisted."
            onRetry={() => {
              refetch();
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = item.images && item.images.length > 0 ? item.images : [DEFAULT_COVER];
  const activeImgUrl = galleryImages[activeImage] || DEFAULT_COVER;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title={`${item.name} in ${item.area}, Indore`}
        description={item.description}
        image={galleryImages[0]}
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/libraries"
              className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Study Libraries
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSave}
                className="h-8 gap-1.5 text-xs font-medium"
              >
                <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-rose-600 text-rose-600" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-8 gap-1.5 text-xs font-medium"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left 2 Cols: Gallery & Space Details */}
            <div className="space-y-8 lg:col-span-2">
              {/* Photo Gallery */}
              <div className="space-y-3">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
                  <img
                    src={activeImgUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                  {item.isVerified && (
                    <Badge className="absolute top-4 left-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 shadow-sm text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Space
                    </Badge>
                  )}
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          activeImage === idx
                            ? "border-primary shadow-sm"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Location Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    Study Library · {item.area}
                  </Badge>

                  {item.availableSeats > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                    >
                      {item.availableSeats} Seats Available
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                    >
                      Waiting List Available
                    </Badge>
                  )}
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {item.name}
                </h1>

                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {item.location.address}, {item.location.city.toUpperCase()} (
                    {item.location.zipCode})
                  </span>
                </p>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">About this Study Space</h2>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Facilities Grid */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Amenities & Facilities</h2>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {(item.facilities || []).map((facKey) => {
                    const label = FACILITY_LABELS[facKey as LibraryFacility] || facKey;
                    return (
                      <div
                        key={facKey}
                        className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2.5 text-xs font-medium"
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="capitalize">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operational Information */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Operating Hours & Capacity</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-xl border border-border p-4 bg-muted/20">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Timings</p>
                      <p className="text-sm font-semibold mt-0.5">
                        {item.operatingHours?.is24x7
                          ? "Open 24 Hours (Round the clock)"
                          : `${item.operatingHours?.openingTime || "06:00"} - ${item.operatingHours?.closingTime || "23:00"}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Open Days: {(item.operatingHours?.openDays || ["Mon-Sun"]).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border p-4 bg-muted/20">
                    <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                        Capacity Details
                      </p>
                      <p className="text-sm font-semibold mt-0.5">
                        {item.seatCapacity} Total Desks / Seats
                      </p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        {item.availableSeats} Desks currently ready for booking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Sticky Contact Card */}
            <div>
              <StickyContactCard
                listingId={item.id}
                listingTitle={item.name}
                targetType="LIBRARY"
                price={item.pricing?.monthlyFee || 1000}
                pricingLabel="month"
                ownerName={`${item.name} Management`}
                ownerPhone={item.contact?.phone || "9876543210"}
                isVerified={item.isVerified}
                onOpenVisitModal={() => setVisitModalOpen(true)}
              />
            </div>
          </div>

          {/* Student Reviews & Trust Ratings */}
          <ReviewSection
            targetType="LIBRARY"
            targetId={item.id}
            targetTitle={item.name}
            ownerId={item.ownerId}
          />

          {/* Unified Search Recommendations */}
          <div className="mt-14">
            <RecommendationSection
              targetType="LIBRARY"
              targetId={item.id}
              title={`More Study Libraries & PGs in ${item.area}`}
            />
          </div>

          {/* Enquiry / Visit Modal */}
          <EnquiryModal
            open={visitModalOpen}
            onOpenChange={setVisitModalOpen}
            targetType="LIBRARY"
            targetId={item.id}
            targetTitle={item.name}
            targetArea={item.area}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
