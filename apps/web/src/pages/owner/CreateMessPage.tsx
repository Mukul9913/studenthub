import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { INDORE_AREAS } from "../../features/accommodation/mock-data/areas";
import { createMess } from "../../features/mess/services";
import {
  FOOD_PREFERENCE_LABELS,
  MEAL_TYPE_LABELS,
  PROVIDER_TYPE_LABELS,
  WEEK_DAYS,
} from "../../features/mess/labels";
import { parseImageUrls } from "../../features/mess/utils";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ApiError } from "../../services/api";
import type { FoodPreference, MealType, MessProviderType } from "@studenthub/types";
import { DraggableMapPicker } from "../../components/maps/DraggableMapPicker";
import {
  DEFAULT_INDORE_LAT,
  DEFAULT_INDORE_LNG,
  buildGeoLocationPayload,
  patchFromGeocode,
} from "../../lib/location-helpers";

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

interface FormState {
  name: string;
  description: string;
  providerType: MessProviderType;
  area: string;
  address: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  formattedAddress?: string;
  foodPreferences: string[];
  mealTypes: string[];
  startingMealPrice: string;
  openingTime: string;
  closingTime: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  subscriptionAvailable: boolean;
  phone: string;
  imageUrls: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  providerType: "mess",
  area: "",
  address: "",
  zipCode: "452001",
  latitude: DEFAULT_INDORE_LAT,
  longitude: DEFAULT_INDORE_LNG,
  foodPreferences: ["vegetarian"],
  mealTypes: ["lunch", "dinner"],
  startingMealPrice: "80",
  openingTime: "07:00",
  closingTime: "22:00",
  deliveryAvailable: false,
  pickupAvailable: true,
  subscriptionAvailable: true,
  phone: "",
  imageUrls: "",
};

export function CreateMessPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
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

  const toggleInList = (key: "foodPreferences" | "mealTypes", value: string) => {
    const list = form[key].includes(value)
      ? form[key].filter((entry) => entry !== value)
      : [...form[key], value];
    set(key, list);
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Mess name is required.";
    else if (form.name.trim().length < 3) errs.name = "Name must be at least 3 characters.";

    if (!form.description.trim()) errs.description = "Description is required.";
    else if (form.description.trim().length < 10)
      errs.description = "Description must be at least 10 characters.";

    if (!form.area) errs.area = "Locality / Area is required.";
    if (!form.address.trim()) errs.address = "Address is required.";

    const price = Number(form.startingMealPrice);
    if (!form.startingMealPrice || isNaN(price) || price < 0) {
      errs.startingMealPrice = "Enter a valid starting meal price.";
    }

    if (form.mealTypes.length === 0) errs.mealTypes = "Select at least one meal you serve.";

    return errs;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMess({
        name: form.name.trim(),
        description: form.description.trim(),
        providerType: form.providerType,
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
        },
        foodPreferences: form.foodPreferences,
        mealTypes: form.mealTypes,
        pricing: {
          startingMealPrice: Number(form.startingMealPrice) || 0,
        },
        deliveryAvailable: form.deliveryAvailable,
        pickupAvailable: form.pickupAvailable,
        subscriptionAvailable: form.subscriptionAvailable,
        operatingHours: {
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          openDays: WEEK_DAYS,
          is24x7: false,
        },
        images: parseImageUrls(form.imageUrls),
        status: "PENDING_REVIEW",
      });

      toast.success("Mess listing submitted for review!");
      navigate("/owner/listings");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to create mess listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Add a Mess / Tiffin Service"
      subtitle="Publish your kitchen with food preferences, meal timings, and starting price."
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
            <Label htmlFor="mess-name">Mess / Kitchen Name *</Label>
            <Input
              id="mess-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Sharma Student Mess"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mess-type">Provider Type</Label>
            <Select
              value={form.providerType}
              onValueChange={(v) => set("providerType", v as MessProviderType)}
            >
              <SelectTrigger id="mess-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {PROVIDER_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mess-desc">Description *</Label>
            <Textarea
              id="mess-desc"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe your thali, cooking style, hygiene standards, delivery timings, and who you serve."
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Location</h2>

          <div>
            <Label className="mb-1.5 block">Pin Exact Kitchen / Mess Location</Label>
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
              <Label htmlFor="mess-area">Area / Locality in Indore *</Label>
              <Select value={form.area} onValueChange={(v) => set("area", v)}>
                <SelectTrigger id="mess-area">
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
              <Label htmlFor="mess-zip">Zip Code</Label>
              <Input
                id="mess-zip"
                value={form.zipCode}
                onChange={(e) => set("zipCode", e.target.value)}
                placeholder="452001"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mess-address">Full Address *</Label>
            <Textarea
              id="mess-address"
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Shop / House No., Landmark, Street Road, Indore"
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            <p className="text-xs text-muted-foreground">
              Auto-filled from map pin — you can still edit the street text.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">City: Indore · State: Madhya Pradesh</p>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Food & Meals</h2>

          <div className="space-y-2">
            <Label>Food Preferences</Label>
            <div className="grid gap-2 sm:grid-cols-4">
              {FOOD_PREFERENCE_OPTIONS.map((pref) => {
                const checked = form.foodPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleInList("foodPreferences", pref)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                      checked ? "border-primary bg-primary/10 font-medium" : "border-border bg-card"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="text-xs">{FOOD_PREFERENCE_LABELS[pref]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meals Served *</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {MEAL_TYPE_OPTIONS.map((meal) => {
                const checked = form.mealTypes.includes(meal);
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => toggleInList("mealTypes", meal)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                      checked ? "border-primary bg-primary/10 font-medium" : "border-border bg-card"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="text-xs">{MEAL_TYPE_LABELS[meal]}</span>
                  </button>
                );
              })}
            </div>
            {errors.mealTypes && <p className="text-xs text-destructive">{errors.mealTypes}</p>}
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Pricing & Service Options</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="mess-price">Starting Meal Price (₹) *</Label>
              <Input
                id="mess-price"
                type="number"
                value={form.startingMealPrice}
                onChange={(e) => set("startingMealPrice", e.target.value)}
                placeholder="80"
              />
              {errors.startingMealPrice && (
                <p className="text-xs text-destructive">{errors.startingMealPrice}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mess-open">Opening Time</Label>
              <Input
                id="mess-open"
                type="time"
                value={form.openingTime}
                onChange={(e) => set("openingTime", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mess-close">Closing Time</Label>
              <Input
                id="mess-close"
                type="time"
                value={form.closingTime}
                onChange={(e) => set("closingTime", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={form.deliveryAvailable}
                onCheckedChange={(v) => set("deliveryAvailable", !!v)}
              />
              <span>Home Delivery Available</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={form.pickupAvailable}
                onCheckedChange={(v) => set("pickupAvailable", !!v)}
              />
              <span>Self Pickup Available</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={form.subscriptionAvailable}
                onCheckedChange={(v) => set("subscriptionAvailable", !!v)}
              />
              <span>Monthly Subscription Plans</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Contact & Photos</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mess-phone">Contact Phone</Label>
              <Input
                id="mess-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98260 11223"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mess-images">Photo URLs (optional)</Label>
            <Textarea
              id="mess-images"
              rows={3}
              value={form.imageUrls}
              onChange={(e) => set("imageUrls", e.target.value)}
              placeholder="One image URL per line, or comma separated"
            />
            <p className="text-xs text-muted-foreground">
              Paste links to thali and kitchen photos. Only https links are saved.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/owner/listings")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
