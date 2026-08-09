import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, MapPin, X, RotateCcw, BookOpen } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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

import { LibraryCard } from "@/features/library/components/LibraryCard";
import { LibraryPagination } from "@/features/library/components/LibraryPagination";
import { getLibraries } from "@/features/library/services";
import { INDORE_AREAS } from "@/features/accommodation/mock-data/areas";

export function LibrariesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse state from URL search params
  const [queryInput, setQueryInput] = useState(
    searchParams.get("query") || searchParams.get("search") || "",
  );
  const [debouncedQuery, setDebouncedQuery] = useState(queryInput);
  const [selectedArea, setSelectedArea] = useState(searchParams.get("area") || "all");
  const [minFee, setMinFee] = useState(searchParams.get("minFee") || "");
  const [maxFee, setMaxFee] = useState(searchParams.get("maxFee") || "");
  const [hasAc, setHasAc] = useState(searchParams.get("ac") === "true");
  const [hasWifi, setHasWifi] = useState(searchParams.get("wifi") === "true");
  const [hasPower, setHasPower] = useState(searchParams.get("powerBackup") === "true");
  const [is24x7, setIs24x7] = useState(searchParams.get("is24x7") === "true");
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

  // Set document title & SEO
  useEffect(() => {
    document.title = "Study Libraries & Reading Rooms in Indore | StudentHub";
  }, []);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("query", debouncedQuery.trim());
    if (selectedArea && selectedArea !== "all") params.set("area", selectedArea);
    if (minFee) params.set("minFee", minFee);
    if (maxFee) params.set("maxFee", maxFee);
    if (hasAc) params.set("ac", "true");
    if (hasWifi) params.set("wifi", "true");
    if (hasPower) params.set("powerBackup", "true");
    if (is24x7) params.set("is24x7", "true");
    if (sort && sort !== "recommended") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());

    setSearchParams(params, { replace: true });
  }, [
    debouncedQuery,
    selectedArea,
    minFee,
    maxFee,
    hasAc,
    hasWifi,
    hasPower,
    is24x7,
    sort,
    page,
    setSearchParams,
  ]);

  const filtersPayload = useMemo(
    () => ({
      query: debouncedQuery,
      area: selectedArea,
      minFee: Number(minFee) || 0,
      maxFee: Number(maxFee) || 0,
      ac: hasAc,
      wifi: hasWifi,
      powerBackup: hasPower,
      is24x7,
      sort: sort as "recommended" | "fee-asc" | "fee-desc" | "rating",
      page,
      limit: 9,
    }),
    [debouncedQuery, selectedArea, minFee, maxFee, hasAc, hasWifi, hasPower, is24x7, sort, page],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["libraries", filtersPayload],
    queryFn: () => getLibraries(filtersPayload),
  });

  const resetFilters = () => {
    setQueryInput("");
    setDebouncedQuery("");
    setSelectedArea("all");
    setMinFee("");
    setMaxFee("");
    setHasAc(false);
    setHasWifi(false);
    setHasPower(false);
    setIs24x7(false);
    setSort("recommended");
    setPage(1);
  };

  const activeFilterCount =
    (selectedArea !== "all" ? 1 : 0) +
    (minFee ? 1 : 0) +
    (maxFee ? 1 : 0) +
    (hasAc ? 1 : 0) +
    (hasWifi ? 1 : 0) +
    (hasPower ? 1 : 0) +
    (is24x7 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Banner Section */}
        <section className="border-b border-border bg-card py-10 px-4 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 bg-primary/10 text-primary border-primary/20"
                >
                  <BookOpen className="mr-1 h-3 w-3" /> Study Spaces & Libraries
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Study Libraries in Indore
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
                  Discover silent study halls, 24x7 reading rooms, and self-study hubs with AC,
                  Wi-Fi, and personal lockers across Indore.
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
                  placeholder="Search library name, area, or landmark (e.g. Saarthi, Bhawarkua)..."
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
                    <SelectItem value="fee-asc">Fee: Low to High</SelectItem>
                    <SelectItem value="fee-desc">Fee: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expanded Filter Panel */}
            {showFilters && (
              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 transition">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-semibold">Filter Libraries</h3>
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

                  {/* Price Range */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Monthly Fee (₹)
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        placeholder="Min"
                        value={minFee}
                        onChange={(e) => {
                          setMinFee(e.target.value.replace(/\D/g, ""));
                          setPage(1);
                        }}
                        className="bg-background text-xs"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        placeholder="Max"
                        value={maxFee}
                        onChange={(e) => {
                          setMaxFee(e.target.value.replace(/\D/g, ""));
                          setPage(1);
                        }}
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Key Facilities
                    </label>
                    <div className="mt-2 flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={hasAc}
                          onCheckedChange={(v) => {
                            setHasAc(!!v);
                            setPage(1);
                          }}
                        />
                        <span>AC Hall</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={hasWifi}
                          onCheckedChange={(v) => {
                            setHasWifi(!!v);
                            setPage(1);
                          }}
                        />
                        <span>Wi-Fi</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={hasPower}
                          onCheckedChange={(v) => {
                            setHasPower(!!v);
                            setPage(1);
                          }}
                        />
                        <span>Power Backup</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={is24x7}
                          onCheckedChange={(v) => {
                            setIs24x7(!!v);
                            setPage(1);
                          }}
                        />
                        <span>24x7 Access</span>
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
              title="No study libraries found"
              description="We couldn't find any verified study libraries matching your search filters."
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
                  Showing {data?.items.length} of {data?.total || 0} study libraries in Indore
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
                  <LibraryCard key={item.id} item={item} />
                ))}
              </div>

              <LibraryPagination
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
      </main>

      <Footer />
    </div>
  );
}
