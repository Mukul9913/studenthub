import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { INDORE_AREAS } from "../../features/accommodation/mock-data/areas";
import { getLibraryById, updateLibrary } from "../../features/library/services";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ApiError } from "../../services/api";

const LIBRARY_FACILITIES = [
  "AC",
  "Wi-Fi",
  "Power Backup",
  "CCTV",
  "RO Drinking Water",
  "Individual Desk",
  "Ergonomic Chair",
  "Charging Point",
  "Locker",
  "Washroom",
  "Newspaper & Periodicals",
  "24/7 Access",
  "Parking",
  "Tea / Coffee Vending",
];

export function EditLibraryPage() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    area: "",
    zipCode: "452001",
    openingTime: "06:00",
    closingTime: "23:00",
    is24x7: false,
    monthlyFee: "1200",
    weeklyFee: "",
    dailyFee: "",
    registrationFee: "",
    facilities: [] as string[],
    seatCapacity: "50",
    availableSeats: "15",
    phone: "",
    email: "",
    images: [] as string[],
  });

  const sidebarLinks = getOwnerSidebar(user?.ownerType);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getLibraryById(id)
      .then((lib) => {
        if (!lib) {
          setIsError(true);
          return;
        }
        setForm({
          name: lib.name || "",
          description: lib.description || "",
          address: lib.location?.address || "",
          area: lib.area || "",
          zipCode: lib.location?.zipCode || "452001",
          openingTime: lib.operatingHours?.openingTime || "06:00",
          closingTime: lib.operatingHours?.closingTime || "23:00",
          is24x7: !!lib.operatingHours?.is24x7,
          monthlyFee: String(lib.pricing?.monthlyFee || 0),
          weeklyFee: lib.pricing?.weeklyFee ? String(lib.pricing.weeklyFee) : "",
          dailyFee: lib.pricing?.dailyFee ? String(lib.pricing.dailyFee) : "",
          registrationFee: lib.pricing?.registrationFee ? String(lib.pricing.registrationFee) : "",
          facilities: lib.facilities || [],
          seatCapacity: String(lib.seatCapacity || 50),
          availableSeats: String(lib.availableSeats || 10),
          phone: lib.contact?.phone || "",
          email: lib.contact?.email || "",
          images: lib.images || [],
        });
        setIsError(false);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const set = (key: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const toggleFacility = (facility: string) => {
    const list = form.facilities.includes(facility)
      ? form.facilities.filter((f) => f !== facility)
      : [...form.facilities, facility];
    set("facilities", list);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!form.name.trim() || !form.description.trim() || !form.area) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLibrary(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        location: {
          address: form.address.trim(),
          city: "indore",
          state: "Madhya Pradesh",
          zipCode: form.zipCode.trim() || "452001",
        },
        area: form.area,
        contact: {
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
        },
        pricing: {
          monthlyFee: Number(form.monthlyFee) || 0,
          weeklyFee: form.weeklyFee ? Number(form.weeklyFee) : undefined,
          dailyFee: form.dailyFee ? Number(form.dailyFee) : undefined,
          registrationFee: form.registrationFee ? Number(form.registrationFee) : undefined,
        },
        facilities: form.facilities,
        operatingHours: {
          openingTime: form.is24x7 ? "00:00" : form.openingTime,
          closingTime: form.is24x7 ? "23:59" : form.closingTime,
          openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          is24x7: form.is24x7,
        },
        seatCapacity: Number(form.seatCapacity) || 50,
        availableSeats: Number(form.availableSeats) || 10,
        images: form.images,
      });

      toast.success("Library updated successfully!");
      navigate("/owner/listings");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to update library listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Edit Library" links={sidebarLinks} currentPath={pathname}>
        <LoadingState />
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell title="Edit Library" links={sidebarLinks} currentPath={pathname}>
        <ErrorState onRetry={() => navigate("/owner/listings")} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Edit Study Library"
      subtitle={`Updating details for "${form.name}"`}
      links={sidebarLinks}
      currentPath={pathname}
    >
      <form
        onSubmit={submit}
        className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-6"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Details</h2>
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Library Name *</Label>
            <Input id="edit-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description *</Label>
            <Textarea
              id="edit-desc"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Location</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Area / Locality *</Label>
              <Select value={form.area} onValueChange={(v) => set("area", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDORE_AREAS.map((a) => (
                    <SelectItem key={a.slug} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Full Address</Label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Pricing & Seats</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Monthly Fee (₹) *</Label>
              <Input
                type="number"
                value={form.monthlyFee}
                onChange={(e) => set("monthlyFee", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Total Seats</Label>
              <Input
                type="number"
                value={form.seatCapacity}
                onChange={(e) => set("seatCapacity", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Available Seats</Label>
              <Input
                type="number"
                value={form.availableSeats}
                onChange={(e) => set("availableSeats", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Facilities</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {LIBRARY_FACILITIES.map((facility) => {
              const checked = form.facilities.includes(facility);
              return (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                    checked ? "border-primary bg-primary/10 font-medium" : "border-border bg-card"
                  }`}
                >
                  <span
                    className={`grid h-4 w-4 place-items-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className="text-xs">{facility}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/owner/listings")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
