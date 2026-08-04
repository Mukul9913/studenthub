import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  ShieldCheck,
  Heart,
  Star,
  ArrowLeft,
  Share2,
  Wifi,
  Snowflake,
  Car,
  Zap,
  Shirt,
  Bath,
  Lock,
  Camera,
  Sofa,
  BookOpen,
  Copy,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { SiteLayout } from "../../components/layout/SiteLayout";
import { StickyContactCard } from "../../components/common/StickyContactCard";
import { RecommendationSection } from "../../components/search/RecommendationSection";
import { ReviewSection } from "@/components/review/ReviewSection";
import { GoogleMapContainer } from "@/components/maps/GoogleMapContainer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EnquiryModal } from "../../features/enquiry/components/EnquiryModal";
import { getAccommodationById } from "../../features/accommodation/services";
import type { Amenity } from "../../features/accommodation/types";

const AMENITY_ICON: Record<Amenity, typeof Wifi> = {
  WiFi: Wifi,
  AC: Snowflake,
  Parking: Car,
  "Power Backup": Zap,
  Laundry: Shirt,
  "Attached Bathroom": Bath,
  Security: Lock,
  CCTV: Camera,
  Furnished: Sofa,
  "Study Table": BookOpen,
};

export function AccommodationDetailsPage() {
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
    queryKey: ["accommodation", id],
    queryFn: () => getAccommodationById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (item?.title) {
      document.title = `${item.title} in ${item.location.area}, Indore | StudentHub`;
    }
  }, [item?.title, item?.location?.area]);

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
      navigator.share({
        title: item?.title || "Accommodation Details",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <LoadingState />
      </SiteLayout>
    );
  }

  if (isError || !item) {
    return (
      <SiteLayout>
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <h1 className="text-2xl font-bold">Listing not found</h1>
            <p className="mt-2 text-muted-foreground text-xs">
              This listing may have been removed or is no longer available.
            </p>
            <Button asChild size="sm" className="mt-6">
              <Link to="/accommodations">Browse listings</Link>
            </Button>
          </div>
        )}
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/accommodations"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to listings
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSave}
              className={`gap-1.5 text-xs ${isSaved ? "text-rose-600 border-rose-200 bg-rose-50" : ""}`}
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-rose-600 text-rose-600" : ""}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          <div className="overflow-hidden rounded-xl lg:col-span-3">
            <img
              src={
                item.images[activeImage] ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
              }
              alt={item.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-1">
            {item.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`overflow-hidden rounded-lg border-2 transition ${i === activeImage ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                <img
                  src={src}
                  alt={`View ${i + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {item.verified && (
                  <Badge className="gap-1 bg-emerald-500 text-white">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
                <Badge variant="secondary">{item.propertyType}</Badge>
                <Badge variant="outline">{item.genderPreference}</Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                >
                  {item.availabilityStatus}
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                {item.title}
              </h1>
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" /> {item.location.address},{" "}
                {item.location.city.toUpperCase()}
              </p>
              {item.rating && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{item.rating}</span>
                  <span className="text-muted-foreground">({item.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">About this place</h2>
              <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                {item.description}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">Amenities</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {item.amenities.map((a) => {
                  const Icon = AMENITY_ICON[a];
                  return (
                    <div
                      key={a}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        {Icon && <Icon className="h-4 w-4" />}
                      </span>
                      <span className="text-xs font-medium">{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(item.nearbyColleges.length > 0 || item.nearbyCompanies.length > 0) && (
              <div className="grid gap-6 sm:grid-cols-2 rounded-2xl border border-border bg-card p-5">
                {item.nearbyColleges.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Nearby colleges
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                      {item.nearbyColleges.map((c) => (
                        <li key={c}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.nearbyCompanies.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Nearby companies
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                      {item.nearbyCompanies.map((c) => (
                        <li key={c}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  Location & Accessibility
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      const fullAddr = `${item.location.address}, ${item.location.area}, Indore, Madhya Pradesh`;
                      navigator.clipboard.writeText(fullAddr);
                      toast.success("Full address copied to clipboard!");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Address
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${encodeURIComponent(
                              `${item.location.address}, ${item.location.area}, Indore`,
                            )}`;
                            window.open(url, "_blank");
                          },
                          () => {
                            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${item.location.address}, ${item.location.area}, Indore`,
                            )}`;
                            window.open(url, "_blank");
                          },
                        );
                      }
                    }}
                  >
                    <Navigation className="h-3.5 w-3.5 text-primary" /> Current Location
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${item.location.address}, ${item.location.area}, Indore`,
                      )}`;
                      window.open(url, "_blank");
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                  </Button>
                </div>
              </div>

              <GoogleMapContainer
                center={{ lat: 22.7196, lng: 75.8577 }}
                zoom={14}
                markers={[
                  {
                    id: item.id,
                    title: item.title,
                    latitude: 22.7196,
                    longitude: 75.8577,
                    price: item.monthlyRent,
                    type: "ACCOMMODATION",
                    address: `${item.location.address}, ${item.location.area}`,
                  },
                ]}
                height="360px"
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <StickyContactCard
              listingId={item.id}
              listingTitle={item.title}
              targetType="ACCOMMODATION"
              price={item.monthlyRent}
              pricingLabel="month"
              ownerName={item.owner?.name || "Property Owner"}
              ownerPhone={item.owner?.phone || "9876543210"}
              isVerified={item.verified}
              onOpenVisitModal={() => setVisitModalOpen(true)}
            />
          </aside>
        </div>

        {/* Student Reviews & Trust Ratings */}
        <ReviewSection
          targetType="ACCOMMODATION"
          targetId={item.id}
          targetTitle={item.title}
          ownerId={item.owner?.id || ""}
        />

        {/* Unified Search Recommendations */}
        <div className="mt-14">
          <RecommendationSection
            targetType="ACCOMMODATION"
            targetId={item.id}
            title={`More Accommodations & Libraries in ${item.location.area}`}
          />
        </div>

        {/* Enquiry / Visit Modal */}
        <EnquiryModal
          open={visitModalOpen}
          onOpenChange={setVisitModalOpen}
          targetType="ACCOMMODATION"
          targetId={item.id}
          targetTitle={item.title}
          targetArea={item.location.area}
        />
      </div>
    </SiteLayout>
  );
}
