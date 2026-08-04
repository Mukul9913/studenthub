import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { DashboardShell, OWNER_SIDEBAR } from "../../components/layout/DashboardShell";
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
import { DraggableMapPicker } from "../../components/maps/DraggableMapPicker";
import { createAccommodation } from "../../features/accommodation/services";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  GENDER_PREFERENCES,
  GENDER_LABELS,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  type BackendPropertyType,
  type BackendGenderPreference,
  type BackendRoomType,
  type CreateAccommodationPayload,
} from "../../features/accommodation/schemas";
import { ApiError } from "../../services/api";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const AMENITIES = [
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

const STEPS = [
  "Basics",
  "Location",
  "Pricing & Room",
  "Preferences",
  "Amenities",
  "Photos",
  "Review",
] as const;

// Default coordinates for Indore
const INDORE_LNG = 75.8577;
const INDORE_LAT = 22.7196;

/* ------------------------------------------------------------------ */
/*  Form state                                                         */
/* ------------------------------------------------------------------ */

interface FormState {
  title: string;
  description: string;
  propertyType: BackendPropertyType;
  area: string;
  address: string;
  zipCode: string;
  latitude?: string;
  longitude?: string;
  nearbyCollege: string;
  nearbyCompany: string;
  rent: string;
  deposit: string;
  roomType: BackendRoomType;
  sharingCount: string;
  totalBeds: string;
  gender: BackendGenderPreference;
  foodProvided: boolean;
  amenities: string[];
  images: string[];
}

const EMPTY: FormState = {
  title: "",
  description: "",
  propertyType: "pg",
  area: "",
  address: "",
  zipCode: "",
  latitude: "22.7196",
  longitude: "75.8577",
  nearbyCollege: "",
  nearbyCompany: "",
  rent: "",
  deposit: "",
  roomType: "shared",
  sharingCount: "2",
  totalBeds: "4",
  gender: "unisex",
  foodProvided: false,
  amenities: [],
  images: [],
};

/* ------------------------------------------------------------------ */
/*  Step validation                                                    */
/* ------------------------------------------------------------------ */

function validateStep(step: number, form: FormState): Record<string, string> {
  const errs: Record<string, string> = {};

  if (step === 0) {
    if (!form.title.trim()) errs.title = "Property title is required.";
    else if (form.title.trim().length < 3) errs.title = "Title must be at least 3 characters.";
    else if (form.title.trim().length > 100) errs.title = "Title cannot exceed 100 characters.";

    if (!form.description.trim()) errs.description = "Description is required.";
    else if (form.description.trim().length < 10)
      errs.description = "Description must be at least 10 characters.";
    else if (form.description.trim().length > 2000)
      errs.description = "Description cannot exceed 2000 characters.";
  }

  if (step === 1) {
    if (!form.area) errs.area = "Area is required.";
    if (!form.address.trim()) errs.address = "Address is required.";
    if (!form.zipCode.trim()) errs.zipCode = "Zip/Pin code is required.";
  }

  if (step === 2) {
    if (!form.rent.trim()) errs.rent = "Monthly rent is required.";
    else if (Number(form.rent) < 0) errs.rent = "Rent cannot be negative.";

    if (!form.deposit.trim()) errs.deposit = "Security deposit is required.";
    else if (Number(form.deposit) < 0) errs.deposit = "Deposit cannot be negative.";

    const sc = Number(form.sharingCount) || 0;
    if (sc < 1) errs.sharingCount = "Must be at least 1.";
    if (form.roomType === "private" && sc !== 1)
      errs.sharingCount = "Private rooms must have sharing count of 1.";

    const tb = Number(form.totalBeds) || 0;
    if (tb < 1) errs.totalBeds = "Must be at least 1.";
  }

  return errs;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CreateAccommodationPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });

  const progress = ((step + 1) / STEPS.length) * 100;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 10);
    setSelectedFiles(combinedFiles);

    const urls = combinedFiles.map((f) => URL.createObjectURL(f));
    set("images", urls);
  };

  const advanceStep = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const submit = async (status: "draft" | "pending_review" = "pending_review") => {
    for (let s = 0; s <= 2; s++) {
      const stepErrors = validateStep(s, form);
      if (Object.keys(stepErrors).length > 0) {
        setStep(s);
        setErrors(stepErrors);
        toast.error("Please fix the errors before proceeding.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        toast.loading("Uploading photos...", { id: "upload-toast" });
        const { uploadAccommodationImages } = await import("../../features/accommodation/services");
        uploadedUrls = await uploadAccommodationImages(selectedFiles);
        toast.dismiss("upload-toast");
      }

      const nearbyColleges = form.nearbyCollege.trim()
        ? [{ name: form.nearbyCollege.trim(), distanceKm: 1 }]
        : [];
      const nearbyCompanies = form.nearbyCompany.trim()
        ? [{ name: form.nearbyCompany.trim(), distanceKm: 1 }]
        : [];

      const totalBeds = Number(form.totalBeds) || 1;

      await createAccommodation({
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        location: {
          address: form.address.trim(),
          city: "indore",
          state: "Madhya Pradesh",
          zipCode: form.zipCode.trim() || "452001",
          coordinates: {
            type: "Point",
            coordinates: [INDORE_LNG, INDORE_LAT],
          },
        },
        area: form.area,
        nearbyColleges,
        nearbyCompanies,
        amenities: form.amenities,
        food: {
          provided: form.foodProvided,
          mealsIncluded: [],
        },
        images: uploadedUrls,
        videos: [],
        status,
        rooms: [
          {
            roomType: form.roomType,
            sharingCount: Number(form.sharingCount) || 1,
            rent: Number(form.rent) || 0,
            deposit: Number(form.deposit) || 0,
            genderPreference: form.gender,
            amenities: form.amenities,
            totalBeds,
            availableBeds: totalBeds,
            isAvailable: true,
          },
        ],
      } as unknown as CreateAccommodationPayload);

      toast.success(
        status === "draft" ? "Listing saved as draft!" : "Listing submitted for review!",
      );
      navigate("/owner/listings");
    } catch (err) {
      toast.dismiss("upload-toast");
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to create listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <DashboardShell
      title="Add a new listing"
      subtitle="Fill in the details to publish your property."
      links={OWNER_SIDEBAR}
      currentPath={pathname}
    >
      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              Step {step + 1} of {STEPS.length} ·{" "}
              <span className="text-primary">{STEPS[step]}</span>
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
          <div className="mt-3 hidden gap-1 md:flex">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Property title</Label>
              <Input
                id="title"
                className="mt-1.5"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Sunrise PG for Boys — Vijay Nagar"
              />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="mt-1.5 min-h-[120px]"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tell students what makes your place special…"
              />
              <p className="mt-1 text-xs text-muted-foreground">{form.description.length}/2000</p>
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">{errors.description}</p>
              )}
            </div>
            <div>
              <Label>Property type</Label>
              <Select
                value={form.propertyType}
                onValueChange={(v) => set("propertyType", v as BackendPropertyType)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {PROPERTY_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block">Pin Exact Property Location & Address</Label>
              <DraggableMapPicker
                initialAddress={form.address}
                initialCity="Indore"
                onLocationChange={(loc) => {
                  if (loc.address) set("address", loc.address);
                  if (loc.pincode) set("zipCode", loc.pincode);
                  if (loc.latitude) set("latitude", loc.latitude as unknown as string);
                  if (loc.longitude) set("longitude", loc.longitude as unknown as string);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Area</Label>
                <Select value={form.area} onValueChange={(v) => set("area", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDORE_AREAS.map((a) => (
                      <SelectItem key={a.slug} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
              </div>

              <div>
                <Label htmlFor="zipCode">Pincode</Label>
                <Input
                  id="zipCode"
                  className="mt-1.5"
                  value={form.zipCode}
                  onChange={(e) => set("zipCode", e.target.value)}
                  placeholder="452001"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Full Street Address</Label>
              <Input
                id="address"
                className="mt-1.5"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="House No, Street, Landmark"
              />
              {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nearbyCollege">Nearby College</Label>
                <Input
                  id="nearbyCollege"
                  className="mt-1.5"
                  value={form.nearbyCollege}
                  onChange={(e) => set("nearbyCollege", e.target.value)}
                  placeholder="e.g. DAVV, SGSITS"
                />
              </div>
              <div>
                <Label htmlFor="nearbyCompany">Nearby Coaching / Landmark</Label>
                <Input
                  id="nearbyCompany"
                  className="mt-1.5"
                  value={form.nearbyCompany}
                  onChange={(e) => set("nearbyCompany", e.target.value)}
                  placeholder="e.g. Physics Wallah, Drishti IAS"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Room */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rent">Monthly rent (₹)</Label>
                <Input
                  id="rent"
                  inputMode="numeric"
                  className="mt-1.5"
                  value={form.rent}
                  onChange={(e) => set("rent", e.target.value.replace(/\D/g, ""))}
                  placeholder="8500"
                />
                {errors.rent && <p className="mt-1 text-xs text-destructive">{errors.rent}</p>}
              </div>
              <div>
                <Label htmlFor="deposit">Security deposit (₹)</Label>
                <Input
                  id="deposit"
                  inputMode="numeric"
                  className="mt-1.5"
                  value={form.deposit}
                  onChange={(e) => set("deposit", e.target.value.replace(/\D/g, ""))}
                  placeholder="10000"
                />
                {errors.deposit && (
                  <p className="mt-1 text-xs text-destructive">{errors.deposit}</p>
                )}
              </div>
            </div>
            <div>
              <Label>Room type</Label>
              <Select
                value={form.roomType}
                onValueChange={(v) => set("roomType", v as BackendRoomType)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ROOM_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sharingCount">Sharing count</Label>
                <Input
                  id="sharingCount"
                  inputMode="numeric"
                  className="mt-1.5"
                  value={form.sharingCount}
                  onChange={(e) => set("sharingCount", e.target.value.replace(/\D/g, ""))}
                  placeholder="2"
                />
                {errors.sharingCount && (
                  <p className="mt-1 text-xs text-destructive">{errors.sharingCount}</p>
                )}
              </div>
              <div>
                <Label htmlFor="totalBeds">Total beds</Label>
                <Input
                  id="totalBeds"
                  inputMode="numeric"
                  className="mt-1.5"
                  value={form.totalBeds}
                  onChange={(e) => set("totalBeds", e.target.value.replace(/\D/g, ""))}
                  placeholder="4"
                />
                {errors.totalBeds && (
                  <p className="mt-1 text-xs text-destructive">{errors.totalBeds}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Gender preference</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => set("gender", v as BackendGenderPreference)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_PREFERENCES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {GENDER_LABELS[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="flex items-center gap-2.5">
                <Checkbox
                  checked={form.foodProvided}
                  onCheckedChange={(v) => set("foodProvided", !!v)}
                />
                <span className="text-sm font-medium">Food / Meals included</span>
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Check if meals are provided with the accommodation.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Amenities */}
        {step === 4 && (
          <div>
            <Label>Select all amenities available</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {AMENITIES.map((a) => (
                <label
                  key={a}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition ${
                    form.amenities.includes(a)
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-background"
                  }`}
                >
                  <Checkbox
                    checked={form.amenities.includes(a)}
                    onCheckedChange={(v) =>
                      set(
                        "amenities",
                        v ? [...form.amenities, a] : form.amenities.filter((x) => x !== a),
                      )
                    }
                  />
                  <span className="text-sm">{a}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Photos */}
        {step === 5 && (
          <div>
            <Label>Upload photos (up to 8)</Label>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition hover:border-primary hover:bg-primary-soft/40">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Drag & drop or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5 MB each</p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            {form.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {form.images.map((src, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                  >
                    <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "images",
                          form.images.filter((_, x) => x !== i),
                        )
                      }
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-destructive shadow"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Image upload is preview only. Full upload support coming soon.
            </p>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Review your listing before publishing.</p>
            <div className="grid gap-3 rounded-lg border border-border bg-background p-4 text-sm sm:grid-cols-2">
              <ReviewField label="Title" value={form.title || "—"} />
              <ReviewField label="Property type" value={PROPERTY_TYPE_LABELS[form.propertyType]} />
              <ReviewField label="Area" value={form.area || "—"} />
              <ReviewField
                label="Rent"
                value={form.rent ? `₹${Number(form.rent).toLocaleString("en-IN")}/mo` : "—"}
              />
              <ReviewField
                label="Deposit"
                value={form.deposit ? `₹${Number(form.deposit).toLocaleString("en-IN")}` : "—"}
              />
              <ReviewField label="Gender" value={GENDER_LABELS[form.gender]} />
              <ReviewField label="Room type" value={ROOM_TYPE_LABELS[form.roomType]} />
              <ReviewField label="Food" value={form.foodProvided ? "Included" : "Not included"} />
              <ReviewField
                label="Amenities"
                value={form.amenities.length ? form.amenities.join(", ") : "None"}
                className="sm:col-span-2"
              />
              <ReviewField
                label="Photos"
                value={form.images.length ? `${form.images.length} uploaded (preview)` : "None"}
                className="sm:col-span-2"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-2 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Button variant="ghost" disabled={isSubmitting} onClick={() => submit("draft")}>
            Save draft
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={step === 0 || isSubmitting}
              onClick={() => {
                setErrors({});
                setStep((s) => s - 1);
              }}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={advanceStep}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => submit("pending_review")} disabled={isSubmitting}>
                <Check className="mr-1 h-4 w-4" />{" "}
                {isSubmitting ? "Submitting…" : "Submit for review"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function ReviewField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
