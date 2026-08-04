/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { SiteLayout } from "../../components/layout/SiteLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { getAccommodations } from "../../features/accommodation/services";
import { INDORE_AREAS } from "../../features/accommodation/mock-data/areas";
import { AccommodationGrid } from "../../features/accommodation/components/AccommodationGrid";
import { AccommodationPagination } from "../../features/accommodation/components/AccommodationPagination";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import type { Amenity, GenderPreference, PropertyType } from "../../features/accommodation/types";

const AMENITIES: Amenity[] = [
  "WiFi",
  "AC",
  "Parking",
  "Power Backup",
  "Laundry",
  "Attached Bathroom",
  "Security",
  "CCTV",
  "Furnished",
  "Study Table",
];

type SortValue = "recommended" | "rent-asc" | "rent-desc" | "recent";

export function AccommodationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || searchParams.get("search") || "";
  const urlArea = searchParams.get("area");
  const urlSort = searchParams.get("sort") as SortValue | null;
  const urlPage = searchParams.get("page");

  const [queryInput, setQueryInput] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [selectedArea, setSelectedArea] = useState<string>(urlArea ?? "all");
  const [selectedCoaching, setSelectedCoaching] = useState<string>("all");
  const [selectedCollege, setSelectedCollege] = useState<string>("all");
  const [radiusKm, setRadiusKm] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<PropertyType | "all">("all");
  const [gender, setGender] = useState<GenderPreference | "all">("all");
  const [minRent, setMinRent] = useState<string>("");
  const [maxRent, setMaxRent] = useState<string>("");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [sort, setSort] = useState<SortValue | "nearest">(urlSort ?? "recommended");
  const [page, setPage] = useState<number>(urlPage ? Number(urlPage) : 1);

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(queryInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [queryInput]);

  // Set document title for SEO
  useEffect(() => {
    document.title = "Verified PGs, Hostels & Rooms in Indore | StudentHub";
  }, []);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    else params.delete("q");
    if (selectedArea !== "all") params.set("area", selectedArea);
    else params.delete("area");
    if (sort !== "recommended") params.set("sort", sort);
    else params.delete("sort");
    if (page > 1) params.set("page", page.toString());
    else params.delete("page");
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, selectedArea, sort, page, setSearchParams]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedArea, propertyType, gender, minRent, maxRent, amenities, sort]);

  const filters = useMemo(
    () => ({
      query: debouncedQuery,
      area: selectedArea,
      propertyType,
      genderPreference: gender,
      minRent: Number(minRent) || 0,
      maxRent: Number(maxRent) || 0,
      amenities,
      sort: sort as any,
      page,
      limit: 9,
    }),
    [debouncedQuery, selectedArea, propertyType, gender, minRent, maxRent, amenities, sort, page],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["accommodations", filters],
    queryFn: () => getAccommodations(filters),
  });

  const clearFilters = () => {
    setQueryInput("");
    setDebouncedQuery("");
    setSelectedArea("all");
    setPropertyType("all");
    setGender("all");
    setMinRent("");
    setMaxRent("");
    setAmenities([]);
    setSort("recommended");
    setPage(1);
  };

  const toggleAmenity = (a: Amenity) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const activeCount =
    (selectedArea !== "all" ? 1 : 0) +
    (propertyType !== "all" ? 1 : 0) +
    (gender !== "all" ? 1 : 0) +
    (minRent ? 1 : 0) +
    (maxRent ? 1 : 0) +
    amenities.length;

  const FiltersPanel = (
    <div className="space-y-6">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Area / Locality
        </Label>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="mt-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {INDORE_AREAS.map((a) => (
              <SelectItem key={a.slug} value={a.name}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coaching Institute
        </Label>
        <Select value={selectedCoaching} onValueChange={setSelectedCoaching}>
          <SelectTrigger className="mt-2 text-xs">
            <SelectValue placeholder="All Coaching Institutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coaching Institutes</SelectItem>
            {[
              "Drishti IAS",
              "Physics Wallah",
              "Ribosome",
              "Allen",
              "Unacademy",
              "Career Launcher",
              "Aakash",
              "CatalyseR",
            ].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Nearby College
        </Label>
        <Select value={selectedCollege} onValueChange={setSelectedCollege}>
          <SelectTrigger className="mt-2 text-xs">
            <SelectValue placeholder="All Colleges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {["DAVV", "SGSITS", "IIT Indore", "Medi-Caps", "IPS Academy", "Acropolis"].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Distance Radius
        </Label>
        <Select value={radiusKm} onValueChange={setRadiusKm}>
          <SelectTrigger className="mt-2 text-xs">
            <SelectValue placeholder="Any distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any distance</SelectItem>
            <SelectItem value="1">Within 1 KM</SelectItem>
            <SelectItem value="2">Within 2 KM</SelectItem>
            <SelectItem value="3">Within 3 KM</SelectItem>
            <SelectItem value="5">Within 5 KM</SelectItem>
            <SelectItem value="10">Within 10 KM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Property type
        </Label>
        <Select
          value={propertyType}
          onValueChange={(v) => setPropertyType(v as PropertyType | "all")}
        >
          <SelectTrigger className="mt-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="PG">PG</SelectItem>
            <SelectItem value="Hostel">Hostel</SelectItem>
            <SelectItem value="Private Room">Private Room</SelectItem>
            <SelectItem value="Shared Room">Shared Room</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gender preference
        </Label>
        <Select value={gender} onValueChange={(v) => setGender(v as GenderPreference | "all")}>
          <SelectTrigger className="mt-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Rent (₹ / month)
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            inputMode="numeric"
            placeholder="Min"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value.replace(/\D/g, ""))}
            className="text-xs"
          />
          <Input
            inputMode="numeric"
            placeholder="Max"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value.replace(/\D/g, ""))}
            className="text-xs"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Amenities
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {AMENITIES.map((a) => (
            <label
              key={a}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2 text-xs cursor-pointer"
            >
              <Checkbox checked={amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </div>
      <Button variant="outline" className="w-full gap-2 text-xs" onClick={clearFilters}>
        <X className="h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <SiteLayout>
      <div className="border-b border-border bg-surface-elevated">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Accommodations in Indore
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {data ? `${data.total} listings` : "Loading listings"} · Verified PGs, hostels and
            private rooms
          </p>
          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search by name, area or keyword…"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs"
              />
              {queryInput && (
                <button
                  onClick={() => {
                    setQueryInput("");
                    setDebouncedQuery("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 lg:hidden text-xs">
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                    {activeCount > 0 && <Badge className="ml-1">{activeCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">{FiltersPanel}</div>
                </SheetContent>
              </Sheet>
              <Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
                <SelectTrigger className="w-[190px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="nearest">Nearest First</SelectItem>
                  <SelectItem value="rent-asc">Rent: Low to High</SelectItem>
                  <SelectItem value="rent-desc">Rent: High to Low</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Filters
              </h2>
              {FiltersPanel}
            </div>
          </aside>
          <div>
            {isLoading ? (
              <LoadingState />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                title="No accommodations match your filters"
                description="Try adjusting your search area, rent range or amenities."
                action={
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div>
                <AccommodationGrid items={data.items} />
                <AccommodationPagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
