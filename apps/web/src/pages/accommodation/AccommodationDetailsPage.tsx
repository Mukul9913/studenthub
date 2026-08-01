import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  ShieldCheck,
  Heart,
  Phone,
  Mail,
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { SiteLayout } from "../../components/layout/SiteLayout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { AccommodationCard } from "../../features/accommodation/components/AccommodationCard";
import { EnquiryModal } from "@/features/enquiry/components/EnquiryModal";
import {
  getAccommodationById,
  getSimilarAccommodations,
} from "../../features/accommodation/services";
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

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AccommodationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

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

  const { data: similar } = useQuery({
    queryKey: ["similar", id],
    queryFn: () => getSimilarAccommodations(id!),
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

            <div>
              <h2 className="text-base font-semibold text-foreground">Location</h2>
              <div className="mt-3 grid aspect-[16/8] place-items-center overflow-hidden rounded-2xl border border-border bg-muted/40 text-muted-foreground">
                <div className="text-center">
                  <MapPin className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-2 text-xs font-semibold text-foreground">
                    {item.location.area}, Indore
                  </p>
                  <p className="text-[11px]">Map preview · Full interactive map coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Monthly Rent
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatINR(item.monthlyRent)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Security Deposit: {formatINR(item.securityDeposit)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <EnquiryModal
                    targetType="ACCOMMODATION"
                    targetId={item.id}
                    targetTitle={item.title}
                    targetArea={item.location.area}
                    targetImage={item.images?.[0]}
                    triggerText="Contact Owner"
                    triggerClassName="flex-1 py-5 text-xs font-semibold"
                  />
                  <Button variant="outline" size="icon" onClick={toggleSave} aria-label="Save">
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-rose-600 text-rose-600" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Verified Property Owner
                </p>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {item.owner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{item.owner.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Member since {new Date(item.owner.memberSince).getFullYear()} ·{" "}
                      {item.owner.totalListings} listings
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-xs">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {item.owner.phone}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {item.owner.email}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Accommodations */}
        {similar && similar.length > 0 && (
          <div className="mt-14 border-t border-border pt-10">
            <h2 className="text-xl font-bold text-foreground">
              Similar Accommodations in {item.location.area}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((a) => (
                <AccommodationCard key={a.id} item={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
