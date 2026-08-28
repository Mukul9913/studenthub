import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  RotateCcw,
  UtensilsCrossed,
  Coffee,
  Soup,
  Moon,
  CalendarCheck,
  Package,
  Leaf,
  Wallet,
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListingCardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

import { MessCard } from "@/features/mess/components/MessCard";
import { MessPagination } from "@/features/mess/components/MessPagination";
import { getMesses } from "@/features/mess/services";
import {
  FOOD_PREFERENCE_LABELS,
  MEAL_TYPE_LABELS,
  PROVIDER_TYPE_LABELS,
} from "@/features/mess/labels";
import { INDORE_AREAS } from "@/features/accommodation/mock-data/areas";
import type { FoodPreference, MealType, MessProviderType, MessSortBy } from "@studenthub/types";

const PROVIDER_TYPE_OPTIONS: MessProviderType[] = [
  "mess",
  "tiffin",
  "home_kitchen",
  "cloud_kitchen",
  "catering",
];
const FOOD_PREFERENCE_OPTIONS: FoodPreference[] = [
  "vegetarian",
  "non_vegetarian",
  "jain",
  "eggetarian",
];
const MEAL_TYPE_OPTIONS: MealType[] = ["breakfast", "lunch", "dinner"];

/** Starting-meal-price ceiling used by the "Budget" quick chip. */
const BUDGET_MAX_MEAL_PRICE = "120";

export function MessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [queryInput, setQueryInput] = useState(
    searchParams.get("query") || searchParams.get("search") || "",
  );
  const [debouncedQuery, setDebouncedQuery] = useState(queryInput);
  const [selectedArea, setSelectedArea] = useState(searchParams.get("area") || "all");
  const [providerType, setProviderType] = useState(searchParams.get("providerType") || "all");
  const [foodPreference, setFoodPreference] = useState(searchParams.get("foodPreference") || "all");
  const [mealType, setMealType] = useState(searchParams.get("mealType") || "all");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [delivery, setDelivery] = useState(searchParams.get("delivery") === "true");
  const [pickup, setPickup] = useState(searchParams.get("pickup") === "true");
  const [subscription, setSubscription] = useState(searchParams.get("subscription") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "recommended");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(queryInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [queryInput]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("query", debouncedQuery.trim());
    if (selectedArea && selectedArea !== "all") params.set("area", selectedArea);
    if (providerType !== "all") params.set("providerType", providerType);
    if (foodPreference !== "all") params.set("foodPreference", foodPreference);
    if (mealType !== "all") params.set("mealType", mealType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (delivery) params.set("delivery", "true");
    if (pickup) params.set("pickup", "true");
    if (subscription) params.set("subscription", "true");
    if (sort && sort !== "recommended") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());

    setSearchParams(params, { replace: true });
  }, [
    debouncedQuery,
    selectedArea,
    providerType,
    foodPreference,
    mealType,
    minPrice,
    maxPrice,
    delivery,
    pickup,
    subscription,
    sort,
    page,
    setSearchParams,
  ]);

  const filtersPayload = useMemo(
    () => ({
      search: debouncedQuery,
      area: selectedArea,
      providerType: providerType !== "all" ? (providerType as MessProviderType) : undefined,
      foodPreference: foodPreference !== "all" ? (foodPreference as FoodPreference) : undefined,
      mealType: mealType !== "all" ? (mealType as MealType) : undefined,
      minPrice: Number(minPrice) || undefined,
      maxPrice: Number(maxPrice) || undefined,
      delivery,
      pickup,
      subscription,
      sortBy: sort as MessSortBy,
      page,
      limit: 9,
    }),
    [
      debouncedQuery,
      selectedArea,
      providerType,
      foodPreference,
      mealType,
      minPrice,
      maxPrice,
      delivery,
      pickup,
      subscription,
      sort,
      page,
    ],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["messes", filtersPayload],
    queryFn: () => getMesses(filtersPayload),
  });

  const resetFilters = () => {
    setQueryInput("");
    setDebouncedQuery("");
    setSelectedArea("all");
    setProviderType("all");
    setFoodPreference("all");
    setMealType("all");
    setMinPrice("");
    setMaxPrice("");
    setDelivery(false);
    setPickup(false);
    setSubscription(false);
    setSort("recommended");
    setPage(1);
  };

  const activeFilterCount =
    (selectedArea !== "all" ? 1 : 0) +
    (providerType !== "all" ? 1 : 0) +
    (foodPreference !== "all" ? 1 : 0) +
    (mealType !== "all" ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (delivery ? 1 : 0) +
    (pickup ? 1 : 0) +
    (subscription ? 1 : 0);

  const quickCategories = [
    {
      label: "Breakfast",
      icon: Coffee,
      isActive: mealType === "breakfast",
      toggle: () => setMealType(mealType === "breakfast" ? "all" : "breakfast"),
    },
    {
      label: "Lunch",
      icon: Soup,
      isActive: mealType === "lunch",
      toggle: () => setMealType(mealType === "lunch" ? "all" : "lunch"),
    },
    {
      label: "Dinner",
      icon: Moon,
      isActive: mealType === "dinner",
      toggle: () => setMealType(mealType === "dinner" ? "all" : "dinner"),
    },
    {
      label: "Monthly Mess",
      icon: CalendarCheck,
      isActive: subscription,
      toggle: () => setSubscription(!subscription),
    },
    {
      label: "Tiffin",
      icon: Package,
      isActive: providerType === "tiffin",
      toggle: () => setProviderType(providerType === "tiffin" ? "all" : "tiffin"),
    },
    {
      label: "Vegetarian",
      icon: Leaf,
      isActive: foodPreference === "vegetarian",
      toggle: () => setFoodPreference(foodPreference === "vegetarian" ? "all" : "vegetarian"),
    },
    {
      label: "Budget",
      icon: Wallet,
      isActive: maxPrice === BUDGET_MAX_MEAL_PRICE,
      toggle: () => setMaxPrice(maxPrice === BUDGET_MAX_MEAL_PRICE ? "" : BUDGET_MAX_MEAL_PRICE),
    },
  ];

  return (
    <SiteLayout>
      <SEOHead
        title="Mess, Tiffin & Food Plans for Students in Indore"
        description="Compare verified student mess services, tiffin providers and home kitchens across Indore. Filter by veg or Jain food, meal timings, delivery, pickup and monthly subscription plans."
      />

      {/* Hero Section */}
      <section className="border-b border-border bg-card py-10 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge
                variant="outline"
                className="mb-2 bg-primary/10 text-primary border-primary/20"
              >
                <UtensilsCrossed className="mr-1 h-3 w-3" /> Mess & Tiffin Services
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Find the right food plan near you
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
                Home-style messes, tiffin deliveries, and Jain-friendly kitchens across Indore —
                with daily, 15-day and monthly plans you can compare before you commit.
              </p>
            </div>

            {/* Quick Area Badges */}
            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
              <Badge
                variant={selectedArea === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedArea("all");
                  setPage(1);
                }}
              >
                All Indore
              </Badge>
              {INDORE_AREAS.slice(0, 4).map((a) => (
                <Badge
                  key={a.slug}
                  variant={selectedArea === a.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedArea(a.name);
                    setPage(1);
                  }}
                >
                  {a.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {quickCategories.map(({ label, icon: Icon, isActive, toggle }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  toggle();
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={queryInput}
                onChange={(e) => {
                  setQueryInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Search mess or tiffin name, area, or cuisine (e.g. Sharma, Vijay Nagar)..."
                className="pl-9 text-xs"
              />
              {queryInput && (
                <button
                  onClick={() => {
                    setQueryInput("");
                    setDebouncedQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 shrink-0 text-xs"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <Select
                value={sort}
                onValueChange={(v) => {
                  setSort(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[170px] shrink-0 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 transition">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold">Filter Mess & Tiffin Providers</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 gap-1 text-xs"
                >
                  <RotateCcw className="h-3 w-3" /> Reset all
                </Button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Area */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Area / Locality
                  </label>
                  <Select
                    value={selectedArea}
                    onValueChange={(v) => {
                      setSelectedArea(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="mt-1 bg-background text-xs">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {INDORE_AREAS.map((a) => (
                        <SelectItem key={a.slug} value={a.name}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Provider Type */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Provider Type</label>
                  <Select
                    value={providerType}
                    onValueChange={(v) => {
                      setProviderType(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="mt-1 bg-background text-xs">
                      <SelectValue placeholder="Any provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {PROVIDER_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {PROVIDER_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Food Preference */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Food Preference
                  </label>
                  <Select
                    value={foodPreference}
                    onValueChange={(v) => {
                      setFoodPreference(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="mt-1 bg-background text-xs">
                      <SelectValue placeholder="Any preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Preferences</SelectItem>
                      {FOOD_PREFERENCE_OPTIONS.map((pref) => (
                        <SelectItem key={pref} value={pref}>
                          {FOOD_PREFERENCE_LABELS[pref]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Meal Type */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Meal Served</label>
                  <Select
                    value={mealType}
                    onValueChange={(v) => {
                      setMealType(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="mt-1 bg-background text-xs">
                      <SelectValue placeholder="Any meal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Meals</SelectItem>
                      {MEAL_TYPE_OPTIONS.map((meal) => (
                        <SelectItem key={meal} value={meal}>
                          {MEAL_TYPE_LABELS[meal]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Starting Meal Price (₹)
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value.replace(/\D/g, ""));
                        setPage(1);
                      }}
                      className="bg-background text-xs"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value.replace(/\D/g, ""));
                        setPage(1);
                      }}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>

                {/* Service Options */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Service Options
                  </label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={delivery}
                        onCheckedChange={(v) => {
                          setDelivery(!!v);
                          setPage(1);
                        }}
                      />
                      <span>Home Delivery</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={pickup}
                        onCheckedChange={(v) => {
                          setPickup(!!v);
                          setPage(1);
                        }}
                      />
                      <span>Self Pickup</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={subscription}
                        onCheckedChange={(v) => {
                          setSubscription(!!v);
                          setPage(1);
                        }}
                      />
                      <span>Monthly Subscription</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ListingCardSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="h-6 w-6" />}
            title="No mess or tiffin providers found"
            description="We couldn't find any food providers matching your search filters. Try widening the area or clearing meal filters."
            action={
              <Button onClick={resetFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <p>
                Showing {data?.items.length} of {data?.total || 0} mess & tiffin providers in Indore
              </p>
              {selectedArea !== "all" && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>In {selectedArea}</span>
                </div>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.items.map((item) => (
                <MessCard key={item.id} item={item} />
              ))}
            </div>

            <MessPagination
              currentPage={data?.page || 1}
              totalPages={data?.totalPages || 1}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
