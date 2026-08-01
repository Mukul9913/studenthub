import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  Share2,
  ArrowLeft,
  BookOpen,
  Check,
  Heart,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { getLibraryById, getLibraries } from "@/features/library/services";
import { LibraryCard } from "@/features/library/components/LibraryCard";
import { FACILITY_LABELS } from "@/features/library/schemas";
import { EnquiryModal } from "@/features/enquiry/components/EnquiryModal";
import type { LibraryFacility } from "@studenthub/types";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80";

export function LibraryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

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

  const { data: similarData } = useQuery({
    queryKey: ["similar-libraries", item?.area],
    queryFn: () => getLibraries({ area: item?.area, limit: 3 }),
    enabled: !!item?.area,
  });

  const similarLibraries = (similarData?.items || []).filter((l) => l.id !== id).slice(0, 3);

  useEffect(() => {
    if (item?.name) {
      document.title = `${item.name} — Study Library in ${item.area}, Indore | StudentHub`;
    }
  }, [item?.name, item?.area]);

  const images = item?.images && item.images.length > 0 ? item.images : [DEFAULT_COVER];
  const currentImage = activeImage || images[0];

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
        title: item?.name || "Library Details",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pb-12">
        {isLoading ? (
          <div className="py-12">
            <LoadingState />
          </div>
        ) : isError || !item ? (
          <div className="py-12">
            <ErrorState onRetry={() => refetch()} />
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link to="/libraries">Back to Libraries</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Top Navigation Bar */}
            <div className="border-b border-border bg-card py-3 px-4 md:px-6">
              <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                  <Link to="/libraries">
                    <ArrowLeft className="h-4 w-4" /> Back to Libraries
                  </Link>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSave}
                    className={`gap-1.5 text-xs ${isSaved ? "text-rose-600 border-rose-200 bg-rose-50" : ""}`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${isSaved ? "fill-rose-600 text-rose-600" : ""}`}
                    />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-1.5 text-xs"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share Space
                  </Button>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
              {/* Image Gallery */}
              <div className="space-y-3">
                <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border bg-muted">
                  <img src={currentImage} alt={item.name} className="h-full w-full object-cover" />
                  {item.isVerified && (
                    <Badge className="absolute left-4 top-4 bg-emerald-500 text-white gap-1 shadow-lg">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Study Space
                    </Badge>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative aspect-[16/10] h-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          currentImage === img
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Information Section */}
              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                {/* Left Column: Details */}
                <div className="space-y-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {item.area}, Indore
                      </Badge>
                      {item.operatingHours?.is24x7 && (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200"
                        >
                          <Clock className="h-3.5 w-3.5" /> 24x7 Open
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
                          <p className="text-xs text-muted-foreground font-medium uppercase">
                            Timings
                          </p>
                          <p className="text-sm font-semibold mt-0.5">
                            {item.operatingHours?.is24x7
                              ? "Open 24 Hours (Round the clock)"
                              : `${item.operatingHours?.openingTime || "06:00"} - ${item.operatingHours?.closingTime || "23:00"}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Days: {item.operatingHours?.openDays?.join(", ") || "All days"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-border p-4 bg-muted/20">
                        <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase">
                            Capacity & Seats
                          </p>
                          <p className="text-sm font-semibold mt-0.5">
                            {item.availableSeats} Seats Available
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total Capacity: {item.seatCapacity} desks
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pricing & Contact Sticky Card */}
                <div className="space-y-6">
                  <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Monthly Fee
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          ₹{item.pricing?.monthlyFee?.toLocaleString("en-IN") || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">/ month</span>
                      </div>
                    </div>

                    {/* Additional Fee Schedule */}
                    <div className="space-y-2 border-t border-border pt-4 text-xs">
                      {item.pricing?.weeklyFee && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Weekly Pass</span>
                          <span className="font-medium text-foreground">
                            ₹{item.pricing.weeklyFee}
                          </span>
                        </div>
                      )}
                      {item.pricing?.dailyFee && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Daily Pass</span>
                          <span className="font-medium text-foreground">
                            ₹{item.pricing.dailyFee}
                          </span>
                        </div>
                      )}
                      {item.pricing?.registrationFee && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Registration (One-time)</span>
                          <span className="font-medium text-foreground">
                            ₹{item.pricing.registrationFee}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enquiry Modal CTA */}
                    <EnquiryModal
                      targetType="LIBRARY"
                      targetId={item.id}
                      targetTitle={item.name}
                      targetArea={item.area}
                      targetImage={item.images?.[0]}
                      triggerText="Enquire / Book Seat"
                      triggerClassName="w-full py-6 font-semibold text-xs"
                    />

                    {/* Direct Contact Info Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-xs font-semibold py-5"
                        >
                          <Phone className="h-4 w-4" /> View Phone & Direct Contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Contact {item.name}</DialogTitle>
                          <DialogDescription>
                            Get in touch directly with the study space management for seat
                            availability and admission details.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          {item.contact?.phone ? (
                            <a
                              href={`tel:${item.contact.phone}`}
                              className="flex items-center gap-3 rounded-xl border border-border p-3.5 transition hover:border-primary hover:bg-primary-soft/30"
                            >
                              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                                <Phone className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="text-xs text-muted-foreground">Phone Number</p>
                                <p className="text-sm font-semibold">{item.contact.phone}</p>
                              </div>
                            </a>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Phone contact available on site visits.
                            </p>
                          )}

                          {item.contact?.email && (
                            <a
                              href={`mailto:${item.contact.email}`}
                              className="flex items-center gap-3 rounded-xl border border-border p-3.5 transition hover:border-primary hover:bg-primary-soft/30"
                            >
                              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="text-xs text-muted-foreground">Email Address</p>
                                <p className="text-sm font-semibold">{item.contact.email}</p>
                              </div>
                            </a>
                          )}

                          {item.contact?.website && (
                            <a
                              href={item.contact.website}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 rounded-xl border border-border p-3.5 transition hover:border-primary hover:bg-primary-soft/30"
                            >
                              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                                <Globe className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="text-xs text-muted-foreground">Website</p>
                                <p className="text-sm font-semibold truncate">
                                  {item.contact.website}
                                </p>
                              </div>
                            </a>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Similar Libraries */}
              {similarLibraries.length > 0 && (
                <div className="mt-14 border-t border-border pt-10">
                  <h2 className="text-xl font-bold text-foreground">
                    Similar Study Libraries in {item.area}
                  </h2>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {similarLibraries.map((lib) => (
                      <LibraryCard key={lib.id} item={lib} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
