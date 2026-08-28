import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";

import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Progress } from "../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { INDORE_AREAS } from "../../features/accommodation/mock-data/areas";
import { createLibrary } from "../../features/library/services";
import { uploadAccommodationImages } from "../../features/accommodation/services";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ApiError } from "../../services/api";
import { DraggableMapPicker } from "../../components/maps/DraggableMapPicker";
import {
  DEFAULT_INDORE_LAT,
  DEFAULT_INDORE_LNG,
  buildGeoLocationPayload,
  patchFromGeocode,
} from "../../lib/location-helpers";

const STEPS = [
  "Basics",
  "Location",
  "Timings",
  "Pricing",
  "Facilities",
  "Capacity & Photos",
  "Review",
] as const;

const LIBRARY_CATEGORIES = [
  { value: "reading_room", label: "Reading Room" },
  { value: "study_library", label: "Study Library" },
  { value: "digital_library", label: "Digital Library" },
  { value: "study_space", label: "Study Space" },
  { value: "coworking_study", label: "Coworking & Study Space" },
];

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

interface FormState {
  name: string;
  category: string;
  description: string;
  address: string;
  area: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  formattedAddress?: string;
  openingTime: string;
  closingTime: string;
  is24x7: boolean;
  monthlyFee: string;
  weeklyFee: string;
  dailyFee: string;
  registrationFee: string;
  facilities: string[];
  seatCapacity: string;
  availableSeats: string;
  phone: string;
  email: string;
  images: string[];
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "study_library",
  description: "",
  address: "",
  area: "",
  zipCode: "452001",
  latitude: DEFAULT_INDORE_LAT,
  longitude: DEFAULT_INDORE_LNG,
  openingTime: "06:00",
  closingTime: "23:00",
  is24x7: false,
  monthlyFee: "1200",
  weeklyFee: "400",
  dailyFee: "100",
  registrationFee: "200",
  facilities: ["AC", "Wi-Fi", "Power Backup", "Individual Desk", "RO Drinking Water"],
  seatCapacity: "50",
  availableSeats: "15",
  phone: "",
  email: "",
  images: [],
};

export function CreateLibraryPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sidebarLinks = getOwnerSidebar(user?.ownerType);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleFacility = (facility: string) => {
    const list = form.facilities.includes(facility)
      ? form.facilities.filter((f) => f !== facility)
      : [...form.facilities, facility];
    set("facilities", list);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 8);
    setSelectedFiles(combinedFiles);
    const previewUrls = combinedFiles.map((f) => URL.createObjectURL(f));
    set("images", previewUrls);
  };

  const removeImage = (index: number) => {
    const nextFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(nextFiles);
    const previewUrls = nextFiles.map((f) => URL.createObjectURL(f));
    set("images", previewUrls);
  };

  const validateStep = (s: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.name.trim()) errs.name = "Library name is required.";
      else if (form.name.trim().length < 3) errs.name = "Name must be at least 3 characters.";
      if (!form.description.trim()) errs.description = "Description is required.";
      else if (form.description.trim().length < 10)
        errs.description = "Description must be at least 10 characters.";
    } else if (s === 1) {
      if (!form.address.trim()) errs.address = "Address is required.";
      if (!form.area) errs.area = "Locality / Area is required.";
    } else if (s === 3) {
      const monthly = Number(form.monthlyFee);
      if (!form.monthlyFee || isNaN(monthly) || monthly < 0) {
        errs.monthlyFee = "Enter a valid monthly fee.";
      }
    } else if (s === 5) {
      const capacity = Number(form.seatCapacity);
      const available = Number(form.availableSeats);
      if (!form.seatCapacity || isNaN(capacity) || capacity < 1) {
        errs.seatCapacity = "Total seats must be at least 1.";
      }
      if (isNaN(available) || available < 0) {
        errs.availableSeats = "Available seats cannot be negative.";
      } else if (available > capacity) {
        errs.availableSeats = "Available seats cannot exceed total seats.";
      }
    }
    return errs;
  };

  const advanceStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const submit = async (status: "draft" | "pending_review" = "pending_review") => {
    for (let s = 0; s <= 5; s++) {
      const stepErrors = validateStep(s);
      if (Object.keys(stepErrors).length > 0) {
        setStep(s);
        setErrors(stepErrors);
        toast.error("Please fix the errors before submitting.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        toast.loading("Uploading library photos...", { id: "upload-toast" });
        uploadedUrls = await uploadAccommodationImages(selectedFiles);
        toast.dismiss("upload-toast");
      }

      await createLibrary({
        name: form.name.trim(),
        description: form.description.trim(),
        location: buildGeoLocationPayload({
          address: form.address,
          zipCode: form.zipCode,
          latitude: form.latitude,
          longitude: form.longitude,
          googlePlaceId: form.googlePlaceId,
          formattedAddress: form.formattedAddress,
        }),
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
        images: uploadedUrls,
        status,
      });

      toast.success(
        status === "draft" ? "Library saved as draft!" : "Library submitted for review!",
      );
      navigate("/owner/listings");
    } catch (err) {
      toast.dismiss("upload-toast");
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to create library listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <DashboardShell
      title="Add a Study Library / Reading Room"
      subtitle="Fill in study hall details, seating capacity, fees, and photos."
      links={sidebarLinks}
      currentPath={pathname}
    >
      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {step + 1} of {STEPS.length}:{" "}
              <strong className="text-foreground">{STEPS[step]}</strong>
            </span>
            <span>{progressPercent}% Complete</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* STEP 0: BASICS */}
        {step === 0 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold">Basic Library Information</h2>

            <div className="space-y-1.5">
              <Label htmlFor="lib-name">Library / Study Space Name *</Label>
              <Input
                id="lib-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Saarthi Student Hub Study Space"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-category">Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="lib-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIBRARY_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-desc">Description *</Label>
              <Textarea
                id="lib-desc"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe your study hall, quiet academic environment, AC comfort, personal charging slots, Wi-Fi speed, etc."
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: LOCATION */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold">Location & Address</h2>

            <div>
              <Label className="mb-1.5 block">Pin Exact Library Location</Label>
              <DraggableMapPicker
                initialAddress={form.address}
                initialCity="Indore"
                initialLatitude={form.latitude}
                initialLongitude={form.longitude}
                onLocationChange={(loc) => {
                  const patch = patchFromGeocode(loc);
                  setForm((prev) => ({
                    ...prev,
                    ...patch,
                    zipCode: patch.zipCode || prev.zipCode,
                    area: patch.area || prev.area,
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.address;
                    if (patch.area) delete next.area;
                    return next;
                  });
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lib-area">Area / Locality in Indore *</Label>
                <Select value={form.area} onValueChange={(v) => set("area", v)}>
                  <SelectTrigger id="lib-area">
                    <SelectValue placeholder="Select locality" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDORE_AREAS.map((a) => (
                      <SelectItem key={a.slug} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lib-zip">Zip Code</Label>
                <Input
                  id="lib-zip"
                  value={form.zipCode}
                  onChange={(e) => set("zipCode", e.target.value)}
                  placeholder="452001"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-address">Full Address *</Label>
              <Textarea
                id="lib-address"
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Building Name, Plot No., Landmark, Street Road, Indore"
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              <p className="text-xs text-muted-foreground">
                Auto-filled from map pin — you can still edit the street text.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: TIMINGS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold">Operating Hours & Schedule</h2>

            <div className="flex items-center space-x-2 rounded-lg border p-4 bg-muted/30">
              <Checkbox
                id="lib-24x7"
                checked={form.is24x7}
                onCheckedChange={(c) => set("is24x7", !!c)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="lib-24x7"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Open 24 Hours (24x7 Study Access)
                </label>
                <p className="text-xs text-muted-foreground">
                  Check this if students can access desks 24 hours a day.
                </p>
              </div>
            </div>

            {!form.is24x7 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lib-opening">Opening Time</Label>
                  <Input
                    id="lib-opening"
                    type="time"
                    value={form.openingTime}
                    onChange={(e) => set("openingTime", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lib-closing">Closing Time</Label>
                  <Input
                    id="lib-closing"
                    type="time"
                    value={form.closingTime}
                    onChange={(e) => set("closingTime", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRICING */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold">Membership & Pricing Fees</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lib-monthly">Monthly Fee (₹) *</Label>
                <Input
                  id="lib-monthly"
                  type="number"
                  value={form.monthlyFee}
                  onChange={(e) => set("monthlyFee", e.target.value)}
                  placeholder="1200"
                />
                {errors.monthlyFee && (
                  <p className="text-xs text-destructive">{errors.monthlyFee}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lib-registration">Registration Fee (₹)</Label>
                <Input
                  id="lib-registration"
                  type="number"
                  value={form.registrationFee}
                  onChange={(e) => set("registrationFee", e.target.value)}
                  placeholder="200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lib-weekly">Weekly Fee (₹, optional)</Label>
                <Input
                  id="lib-weekly"
                  type="number"
                  value={form.weeklyFee}
                  onChange={(e) => set("weeklyFee", e.target.value)}
                  placeholder="400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lib-daily">Daily Day-Pass (₹, optional)</Label>
                <Input
                  id="lib-daily"
                  type="number"
                  value={form.dailyFee}
                  onChange={(e) => set("dailyFee", e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FACILITIES */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold">Facilities & Study Amenities</h2>
            <p className="text-xs text-muted-foreground">
              Select all amenities available to students.
            </p>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {LIBRARY_FACILITIES.map((facility) => {
                const checked = form.facilities.includes(facility);
                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition ${
                      checked
                        ? "border-primary bg-primary/10 font-medium text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="text-xs">{facility}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: CAPACITY & PHOTOS */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-semibold">Seat Capacity & Availability</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lib-capacity">Total Study Seats *</Label>
                  <Input
                    id="lib-capacity"
                    type="number"
                    value={form.seatCapacity}
                    onChange={(e) => set("seatCapacity", e.target.value)}
                    placeholder="50"
                  />
                  {errors.seatCapacity && (
                    <p className="text-xs text-destructive">{errors.seatCapacity}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lib-available">Currently Available Seats *</Label>
                  <Input
                    id="lib-available"
                    type="number"
                    value={form.availableSeats}
                    onChange={(e) => set("availableSeats", e.target.value)}
                    placeholder="15"
                  />
                  {errors.availableSeats && (
                    <p className="text-xs text-destructive">{errors.availableSeats}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Library Photos</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload photos of desks, AC halls, and facilities.
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-4">
                {form.images.map((src, i) => (
                  <div
                    key={i}
                    className="group relative h-28 overflow-hidden rounded-lg border border-border"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-background/80 text-foreground transition hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {form.images.length < 8 && (
                  <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 p-4 text-center transition hover:border-primary">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="mt-1 text-xs font-medium text-muted-foreground">
                      Upload Photos
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold">Review Library Listing</h2>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{form.name || "Untitled Library"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {form.area}, Indore · {form.address}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  ₹{form.monthlyFee}/month
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{form.description}</p>

              <div className="grid gap-3 sm:grid-cols-3 text-xs border-t border-border pt-4">
                <div>
                  <span className="text-muted-foreground block">Timings</span>
                  <span className="font-medium">
                    {form.is24x7 ? "24x7 Open" : `${form.openingTime} - ${form.closingTime}`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Available Seats</span>
                  <span className="font-medium">
                    {form.availableSeats} of {form.seatCapacity} seats
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Facilities</span>
                  <span className="font-medium">{form.facilities.length} selected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || isSubmitting}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>

          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={advanceStep}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => submit("draft")}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submit("pending_review")}
                >
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
