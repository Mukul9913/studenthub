import { useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface AdvancedFilterDrawerProps {
  category: "ACCOMMODATION" | "LIBRARY" | string;
  onApplyFilters: (filters: Record<string, unknown>) => void;
  currentFilters?: Record<string, unknown>;
}

export function AdvancedFilterDrawer({
  category,
  onApplyFilters,
  currentFilters = {},
}: AdvancedFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const [minPrice, setMinPrice] = useState<string>(String(currentFilters.minPrice || ""));
  const [maxPrice, setMaxPrice] = useState<string>(String(currentFilters.maxPrice || ""));
  const [isVerified, setIsVerified] = useState(Boolean(currentFilters.isVerified));
  const [ac, setAc] = useState(Boolean(currentFilters.ac));
  const [wifi, setWifi] = useState(Boolean(currentFilters.wifi));
  const [powerBackup, setPowerBackup] = useState(Boolean(currentFilters.powerBackup));
  const [is24x7, setIs24x7] = useState(Boolean(currentFilters.is24x7));
  const [locker, setLocker] = useState(Boolean(currentFilters.locker));
  const [parking, setParking] = useState(Boolean(currentFilters.parking));
  const [propertyType, setPropertyType] = useState<string>(
    String(currentFilters.propertyType || "ALL"),
  );
  const [sortBy, setSortBy] = useState<string>(String(currentFilters.sortBy || "newest"));

  const handleApply = () => {
    const filters: Record<string, unknown> = {};
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (isVerified) filters.isVerified = true;
    if (ac) filters.ac = true;
    if (wifi) filters.wifi = true;
    if (powerBackup) filters.powerBackup = true;
    if (is24x7) filters.is24x7 = true;
    if (locker) filters.locker = true;
    if (parking) filters.parking = true;
    if (propertyType !== "ALL") filters.propertyType = propertyType;
    if (sortBy) filters.sortBy = sortBy;

    onApplyFilters(filters);
    setOpen(false);
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setIsVerified(false);
    setAc(false);
    setWifi(false);
    setPowerBackup(false);
    setIs24x7(false);
    setLocker(false);
    setParking(false);
    setPropertyType("ALL");
    setSortBy("newest");
    onApplyFilters({});
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs font-semibold gap-1.5 border-border"
        >
          <Filter className="h-3.5 w-3.5" /> Filter Options
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center justify-between text-base font-bold">
            <span>Filter Marketplace Listings</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs gap-1 text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pt-4">
          {/* Price Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Price Range (₹/month)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="text-xs h-9"
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Sort Option */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sort Results By
            </Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>

          {/* Property Specific Filters */}
          {category === "ACCOMMODATION" && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Property Type
              </Label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium"
              >
                <option value="ALL">All Property Types</option>
                <option value="pg">Paying Guest (PG)</option>
                <option value="hostel">Hostel</option>
                <option value="flat">Apartment / Flat</option>
                <option value="house">Independent House</option>
              </select>
            </div>
          )}

          {/* Facilities & Amenities Switches */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Features & Amenities
            </Label>

            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                Platform Verified Listing Badge Only
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ac}
                  onChange={(e) => setAc(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                Air Conditioned (AC)
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wifi}
                  onChange={(e) => setWifi(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                High Speed WiFi Internet
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={powerBackup}
                  onChange={(e) => setPowerBackup(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                Power Backup Generator
              </label>

              {category === "LIBRARY" && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={is24x7}
                      onChange={(e) => setIs24x7(e.target.checked)}
                      className="rounded border-gray-300 text-primary"
                    />
                    24x7 Round-the-Clock Access
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locker}
                      onChange={(e) => setLocker(e.target.checked)}
                      className="rounded border-gray-300 text-primary"
                    />
                    Personal Storage Locker
                  </label>
                </>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parking}
                  onChange={(e) => setParking(e.target.checked)}
                  className="rounded border-gray-300 text-primary"
                />
                Two-Wheeler / Car Parking
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="w-full text-xs font-bold bg-primary text-primary-foreground"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
