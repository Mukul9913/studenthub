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
  Star,
  Phone,
  Mail,
  Globe,
  Truck,
  ShoppingBag,
  CalendarCheck,
  UtensilsCrossed,
  Leaf,
  Soup,
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { EnquiryModal } from "@/features/enquiry/components/EnquiryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { getMessByIdOrSlug } from "@/features/mess/services";
import {
  FOOD_PREFERENCE_LABELS,
  MEAL_PLAN_DURATION_LABELS,
  MEAL_TYPE_LABELS,
  PROVIDER_TYPE_LABELS,
  WEEK_DAYS,
  getTodayWeekDay,
} from "@/features/mess/labels";
import type { MessMenuItem } from "@studenthub/types";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80";

function MenuItemList({ title, items }: { title: string; items: MessMenuItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">Not served on this day.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((menuItem, idx) => (
            <li key={`${menuItem.name}-${idx}`} className="text-xs text-foreground">
              <span className="font-medium">{menuItem.name}</span>
              {menuItem.description && (
                <span className="text-muted-foreground"> — {menuItem.description}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MessDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = useState(0);

  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["mess", slug],
    queryFn: () => getMessByIdOrSlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (item?.name) {
      document.title = `${item.name} in ${item.area}, Indore | StudentHub`;
    }
  }, [item?.name, item?.area]);

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
      <SiteLayout>
        <div className="py-16">
          <LoadingState />
        </div>
      </SiteLayout>
    );
  }

  if (isError || !item) {
    return (
      <SiteLayout>
        <div className="py-16">
          <ErrorState
            title="Mess Listing Not Found"
            description="The mess or tiffin service you are looking for does not exist or has been unlisted."
            onRetry={() => {
              refetch();
            }}
          />
        </div>
      </SiteLayout>
    );
  }

  const galleryImages = item.images && item.images.length > 0 ? item.images : [DEFAULT_COVER];
  const activeImgUrl = galleryImages[activeImage] || DEFAULT_COVER;
  const providerLabel = PROVIDER_TYPE_LABELS[item.providerType] || item.providerType;
  const activePlans = (item.mealPlans || []).filter((plan) => plan.isActive !== false);
  const weeklyMenu = item.weeklyMenu || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: item.name,
    description: item.description,
    servesCuisine: "Indian",
    address: {
      "@type": "PostalAddress",
      streetAddress: item.location?.address,
      addressLocality: item.area,
      addressRegion: "Indore",
      postalCode: item.location?.zipCode || item.location?.pincode || "452001",
      addressCountry: "IN",
    },
    priceRange: `₹${item.pricing?.startingMealPrice || 0}`,
  };

  return (
    <SiteLayout>
      <SEOHead
        title={`${item.name} — ${providerLabel} in ${item.area}, Indore`}
        description={item.description}
        image={galleryImages[0]}
        jsonLd={jsonLd}
      />

      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/mess"
              className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Mess & Tiffin
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Gallery & details */}
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
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Kitchen
                    </Badge>
                  )}
                </div>

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
                    {providerLabel} · {item.area}
                  </Badge>
                  {item.reviewsCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {item.avgRating.toFixed(1)}
                      <span className="font-normal text-muted-foreground">
                        ({item.reviewsCount} reviews)
                      </span>
                    </span>
                  )}
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {item.name}
                </h1>

                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {item.location?.address}, Indore{" "}
                    {item.location?.zipCode ? `(${item.location.zipCode})` : ""}
                  </span>
                </p>

                {/* Food prefs, meals & service badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(item.foodPreferences || []).map((pref) => (
                    <Badge
                      key={pref}
                      variant="secondary"
                      className="gap-1 font-normal text-[11px] bg-primary/10 text-primary"
                    >
                      <Leaf className="h-3 w-3" /> {FOOD_PREFERENCE_LABELS[pref] || pref}
                    </Badge>
                  ))}
                  {(item.mealTypes || []).map((meal) => (
                    <Badge key={meal} variant="outline" className="gap-1 font-normal text-[11px]">
                      <Soup className="h-3 w-3" /> {MEAL_TYPE_LABELS[meal] || meal}
                    </Badge>
                  ))}
                  {item.deliveryAvailable && (
                    <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                      <Truck className="h-3 w-3" /> Delivery
                      {item.deliveryRadiusKm ? ` up to ${item.deliveryRadiusKm} km` : ""}
                    </Badge>
                  )}
                  {item.pickupAvailable && (
                    <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                      <ShoppingBag className="h-3 w-3" /> Self Pickup
                    </Badge>
                  )}
                  {item.subscriptionAvailable && (
                    <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                      <CalendarCheck className="h-3 w-3" /> Subscription Plans
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <h2 className="text-lg font-semibold">About this Kitchen</h2>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Operating hours & contact */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Serving Hours & Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-xl border border-border p-4 bg-muted/20">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Timings</p>
                      <p className="text-sm font-semibold mt-0.5">
                        {item.operatingHours?.is24x7
                          ? "Open 24 Hours"
                          : `${item.operatingHours?.openingTime || "07:00"} - ${item.operatingHours?.closingTime || "22:00"}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Open Days: {(item.operatingHours?.openDays || ["Mon-Sun"]).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border p-4 bg-muted/20">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                        Contact Kitchen
                      </p>
                      <p className="text-sm font-semibold mt-0.5">
                        {item.contact?.phone || "Available after enquiry"}
                      </p>
                      {item.contact?.email && (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" /> {item.contact.email}
                        </p>
                      )}
                      {item.contact?.website && (
                        <a
                          href={item.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 truncate text-xs text-primary hover:underline"
                        >
                          <Globe className="h-3 w-3 shrink-0" /> Visit website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Menu */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Weekly Menu</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Menus rotate weekly. Today is {getTodayWeekDay()}.
                  </p>
                </div>

                {weeklyMenu.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                    This provider hasn't published a weekly menu yet. Send an enquiry to request
                    today's thali details.
                  </p>
                ) : (
                  <Tabs defaultValue={getTodayWeekDay()}>
                    <TabsList className="flex h-auto flex-wrap justify-start p-1">
                      {WEEK_DAYS.map((day) => (
                        <TabsTrigger key={day} value={day} className="text-xs">
                          {day}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {WEEK_DAYS.map((day) => {
                      const dayMenu = weeklyMenu.find((entry) => entry.day === day);
                      return (
                        <TabsContent key={day} value={day} className="mt-4">
                          {!dayMenu ? (
                            <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                              No menu published for {day}.
                            </p>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-3">
                              <MenuItemList title="Breakfast" items={dayMenu.breakfast || []} />
                              <MenuItemList title="Lunch" items={dayMenu.lunch || []} />
                              <MenuItemList title="Dinner" items={dayMenu.dinner || []} />
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                )}
              </div>

              {/* Meal Plans */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Meal Plans & Pricing</h2>

                {activePlans.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                    No packaged plans listed yet. Enquire for daily and monthly rates.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activePlans.map((plan) => (
                      <div
                        key={plan.id || plan.name}
                        className="rounded-xl border border-border bg-muted/20 p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {plan.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {MEAL_PLAN_DURATION_LABELS[plan.duration] || plan.duration} plan
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            ₹{plan.price.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {plan.description && (
                          <p className="text-xs text-muted-foreground">{plan.description}</p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(plan.includedMeals || []).map((meal) => (
                            <Badge
                              key={meal}
                              variant="outline"
                              className="font-normal text-[11px] gap-1"
                            >
                              <UtensilsCrossed className="h-3 w-3" />{" "}
                              {MEAL_TYPE_LABELS[meal] || meal}
                            </Badge>
                          ))}
                          {plan.deliveryIncluded && (
                            <Badge
                              variant="secondary"
                              className="font-normal text-[11px] gap-1 bg-primary/10 text-primary"
                            >
                              <Truck className="h-3 w-3" /> Delivery included
                            </Badge>
                          )}
                          {plan.pauseAllowed && (
                            <Badge variant="outline" className="font-normal text-[11px]">
                              Pause allowed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to={`/mess?area=${encodeURIComponent(item.area)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Browse more mess & tiffin options in {item.area}
              </Link>
            </div>

            {/* Right: Sticky enquiry panel */}
            <div>
              <div className="sticky top-24 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-lg">
                <div className="flex items-baseline justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs uppercase font-semibold text-muted-foreground">
                      Starting from
                    </span>
                    <div className="mt-0.5 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">
                        ₹{(item.pricing?.startingMealPrice || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-muted-foreground">/meal</span>
                    </div>
                  </div>
                  {item.isVerified && (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 gap-1 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </Badge>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="text-xs font-bold text-foreground">{providerLabel}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.subscriptionAvailable
                      ? "Daily, 15-day and monthly plans available"
                      : "Daily meals available"}
                  </p>
                </div>

                <EnquiryModal
                  targetType="MESS"
                  targetId={item.id}
                  targetTitle={item.name}
                  targetArea={item.area}
                  targetImage={galleryImages[0]}
                  triggerText="Enquire About Plans"
                  triggerClassName="w-full h-11 font-bold shadow-md"
                />

                {item.contact?.phone && (
                  <Button
                    variant="outline"
                    asChild
                    className="w-full h-10 gap-2 text-xs font-semibold"
                  >
                    <a href={`tel:${item.contact.phone}`}>
                      <Phone className="h-3.5 w-3.5" /> Call {item.contact.phone}
                    </a>
                  </Button>
                )}

                <p className="text-center text-[11px] text-muted-foreground">
                  StudentHub connects you directly with the kitchen. No booking fees, no payments on
                  the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
