import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Check, Plus, Trash2 } from "lucide-react";

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
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { INDORE_AREAS } from "../../features/accommodation/mock-data/areas";
import {
  getMessByIdOrSlug,
  replaceMessMenu,
  replaceMessPlans,
  updateMess,
} from "../../features/mess/services";
import {
  FOOD_PREFERENCE_LABELS,
  MEAL_PLAN_DURATION_LABELS,
  MEAL_TYPE_LABELS,
  PROVIDER_TYPE_LABELS,
  WEEK_DAYS,
} from "../../features/mess/labels";
import { menuItemsToText, parseImageUrls, textToMenuItems } from "../../features/mess/utils";
import type { MessMealPlanInput } from "../../features/mess/types";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ApiError } from "../../services/api";
import type {
  FoodPreference,
  MealPlanDuration,
  MealType,
  MessProviderType,
  MessWeekDay,
} from "@studenthub/types";
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
const MEAL_PLAN_DURATION_OPTIONS: MealPlanDuration[] = [
  "daily",
  "weekly",
  "15_day",
  "monthly",
  "custom",
];

/** One editable weekly menu day, with dishes kept as comma separated text. */
type DayMenuDraft = Record<MealType, string>;

const EMPTY_DAY_MENU: DayMenuDraft = { breakfast: "", lunch: "", dinner: "" };

function emptyPlan(): MessMealPlanInput {
  return {
    name: "",
    description: "",
    duration: "monthly",
    includedMeals: ["lunch"],
    price: 0,
    deliveryIncluded: false,
    pauseAllowed: false,
    isActive: true,
  };
}

export function EditMessPage() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  const [isSavingPlans, setIsSavingPlans] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    providerType: "mess" as MessProviderType,
    area: "",
    address: "",
    zipCode: "452001",
    latitude: DEFAULT_INDORE_LAT,
    longitude: DEFAULT_INDORE_LNG,
    googlePlaceId: undefined as string | undefined,
    formattedAddress: undefined as string | undefined,
    foodPreferences: [] as string[],
    mealTypes: [] as string[],
    startingMealPrice: "0",
    openingTime: "07:00",
    closingTime: "22:00",
    deliveryAvailable: false,
    pickupAvailable: true,
    subscriptionAvailable: true,
    phone: "",
    imageUrls: "",
  });

  const [weeklyMenu, setWeeklyMenu] = useState<Record<MessWeekDay, DayMenuDraft>>(() =>
    WEEK_DAYS.reduce(
      (acc, day) => ({ ...acc, [day]: { ...EMPTY_DAY_MENU } }),
      {} as Record<MessWeekDay, DayMenuDraft>,
    ),
  );

  const [mealPlans, setMealPlans] = useState<MessMealPlanInput[]>([]);

  const sidebarLinks = getOwnerSidebar(user?.ownerType);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getMessByIdOrSlug(id)
      .then((mess) => {
        if (!mess) {
          setIsError(true);
          return;
        }

        setForm({
          name: mess.name || "",
          description: mess.description || "",
          providerType: (mess.providerType || "mess") as MessProviderType,
          area: mess.area || "",
          address: mess.location?.address || "",
          zipCode: mess.location?.zipCode || mess.location?.pincode || "452001",
          latitude:
            mess.location?.latitude ||
            mess.location?.coordinates?.coordinates?.[1] ||
            DEFAULT_INDORE_LAT,
          longitude:
            mess.location?.longitude ||
            mess.location?.coordinates?.coordinates?.[0] ||
            DEFAULT_INDORE_LNG,
          googlePlaceId: mess.location?.googlePlaceId,
          formattedAddress: mess.location?.formattedAddress,
          foodPreferences: mess.foodPreferences || [],
          mealTypes: mess.mealTypes || [],
          startingMealPrice: String(mess.pricing?.startingMealPrice ?? 0),
          openingTime: mess.operatingHours?.openingTime || "07:00",
          closingTime: mess.operatingHours?.closingTime || "22:00",
          deliveryAvailable: !!mess.deliveryAvailable,
          pickupAvailable: !!mess.pickupAvailable,
          subscriptionAvailable: !!mess.subscriptionAvailable,
          phone: mess.contact?.phone || "",
          imageUrls: (mess.images || []).join("\n"),
        });

        setWeeklyMenu(
          WEEK_DAYS.reduce(
            (acc, day) => {
              const dayMenu = (mess.weeklyMenu || []).find((entry) => entry.day === day);
              acc[day] = {
                breakfast: menuItemsToText(dayMenu?.breakfast),
                lunch: menuItemsToText(dayMenu?.lunch),
                dinner: menuItemsToText(dayMenu?.dinner),
              };
              return acc;
            },
            {} as Record<MessWeekDay, DayMenuDraft>,
          ),
        );

        setMealPlans(
          (mess.mealPlans || []).map((plan) => ({
            name: plan.name,
            description: plan.description || "",
            duration: plan.duration,
            includedMeals: plan.includedMeals || [],
            price: plan.price,
            deliveryIncluded: !!plan.deliveryIncluded,
            pauseAllowed: !!plan.pauseAllowed,
            isActive: plan.isActive !== false,
          })),
        );

        setIsError(false);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const set = (key: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const toggleInList = (key: "foodPreferences" | "mealTypes", value: string) => {
    const list = form[key].includes(value)
      ? form[key].filter((entry) => entry !== value)
      : [...form[key], value];
    set(key, list);
  };

  const setDayMeal = (day: MessWeekDay, meal: MealType, value: string) => {
    setWeeklyMenu((prev) => ({ ...prev, [day]: { ...prev[day], [meal]: value } }));
  };

  const updatePlan = <K extends keyof MessMealPlanInput>(
    index: number,
    key: K,
    value: MessMealPlanInput[K],
  ) => {
    setMealPlans((prev) => prev.map((plan, i) => (i === index ? { ...plan, [key]: value } : plan)));
  };

  const togglePlanMeal = (index: number, meal: MealType) => {
    setMealPlans((prev) =>
      prev.map((plan, i) => {
        if (i !== index) return plan;
        const includedMeals = plan.includedMeals.includes(meal)
          ? plan.includedMeals.filter((entry) => entry !== meal)
          : [...plan.includedMeals, meal];
        return { ...plan, includedMeals };
      }),
    );
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
      await updateMess(id, {
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
      });

      toast.success("Mess listing updated successfully!");
      navigate("/owner/listings");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to update mess listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveMenu = async () => {
    if (!id) return;

    setIsSavingMenu(true);
    try {
      await replaceMessMenu(
        id,
        WEEK_DAYS.map((day) => ({
          day,
          breakfast: textToMenuItems(weeklyMenu[day].breakfast),
          lunch: textToMenuItems(weeklyMenu[day].lunch),
          dinner: textToMenuItems(weeklyMenu[day].dinner),
        })),
      );
      toast.success("Weekly menu saved!");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to save weekly menu.");
      }
    } finally {
      setIsSavingMenu(false);
    }
  };

  const savePlans = async () => {
    if (!id) return;

    const invalidPlan = mealPlans.find(
      (plan) => plan.name.trim().length < 2 || plan.includedMeals.length === 0 || plan.price < 0,
    );
    if (invalidPlan) {
      toast.error("Each plan needs a name, at least one meal, and a valid price.");
      return;
    }

    setIsSavingPlans(true);
    try {
      await replaceMessPlans(
        id,
        mealPlans.map((plan) => ({
          ...plan,
          name: plan.name.trim(),
          description: plan.description?.trim() || undefined,
          price: Number(plan.price) || 0,
        })),
      );
      toast.success("Meal plans saved!");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstFieldError);
      } else {
        toast.error("Failed to save meal plans.");
      }
    } finally {
      setIsSavingPlans(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Edit Mess" links={sidebarLinks} currentPath={pathname}>
        <LoadingState />
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell title="Edit Mess" links={sidebarLinks} currentPath={pathname}>
        <ErrorState onRetry={() => navigate("/owner/listings")} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Edit Mess / Tiffin Service"
      subtitle={`Updating details for "${form.name}"`}
      links={sidebarLinks}
      currentPath={pathname}
    >
      <div className="space-y-6">
        <form
          onSubmit={submit}
          className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Details</h2>

            <div className="space-y-1.5">
              <Label htmlFor="edit-mess-name">Mess / Kitchen Name *</Label>
              <Input
                id="edit-mess-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-mess-type">Provider Type</Label>
              <Select
                value={form.providerType}
                onValueChange={(v) => set("providerType", v as MessProviderType)}
              >
                <SelectTrigger id="edit-mess-type">
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
              <Label htmlFor="edit-mess-desc">Description *</Label>
              <Textarea
                id="edit-mess-desc"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
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
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Area / Locality *</Label>
                <Select value={form.area} onValueChange={(v) => set("area", v)}>
                  <SelectTrigger>
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
              </div>
              <div className="space-y-1.5">
                <Label>Zip Code</Label>
                <Input value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Full Address</Label>
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled from map pin — you can still edit the street text.
              </p>
            </div>
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
                        checked
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border bg-card"
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
              <Label>Meals Served</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {MEAL_TYPE_OPTIONS.map((meal) => {
                  const checked = form.mealTypes.includes(meal);
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => toggleInList("mealTypes", meal)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                        checked
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border bg-card"
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
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Pricing & Service Options</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Starting Meal Price (₹) *</Label>
                <Input
                  type="number"
                  value={form.startingMealPrice}
                  onChange={(e) => set("startingMealPrice", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Opening Time</Label>
                <Input
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => set("openingTime", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Closing Time</Label>
                <Input
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
                <Label>Contact Phone</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Photo URLs</Label>
              <Textarea
                rows={3}
                value={form.imageUrls}
                onChange={(e) => set("imageUrls", e.target.value)}
                placeholder="One image URL per line, or comma separated"
              />
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

        {/* WEEKLY MENU EDITOR */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Weekly Menu</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter dish names separated by commas. Leave a meal blank if it isn't served that
                day.
              </p>
            </div>
            <Button type="button" onClick={saveMenu} disabled={isSavingMenu}>
              {isSavingMenu ? "Saving..." : "Save Menu"}
            </Button>
          </div>

          <div className="space-y-4">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">{day}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {MEAL_TYPE_OPTIONS.map((meal) => (
                    <div key={meal} className="space-y-1.5">
                      <Label htmlFor={`${day}-${meal}`} className="text-xs">
                        {MEAL_TYPE_LABELS[meal]}
                      </Label>
                      <Input
                        id={`${day}-${meal}`}
                        value={weeklyMenu[day][meal]}
                        onChange={(e) => setDayMeal(day, meal, e.target.value)}
                        placeholder="Poha, Masala Chai"
                        className="bg-background text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MEAL PLANS EDITOR */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Meal Plans</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Define the daily, 15-day and monthly packages students can enquire about.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMealPlans((prev) => [...prev, emptyPlan()])}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Plan
              </Button>
              <Button type="button" onClick={savePlans} disabled={isSavingPlans}>
                {isSavingPlans ? "Saving..." : "Save Plans"}
              </Button>
            </div>
          </div>

          {mealPlans.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
              No meal plans yet. Add your first plan so students know your monthly pricing.
            </p>
          ) : (
            <div className="space-y-4">
              {mealPlans.map((plan, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      Plan {index + 1}
                      {plan.name ? ` · ${plan.name}` : ""}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMealPlans((prev) => prev.filter((_, i) => i !== index))}
                      className="h-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Plan Name</Label>
                      <Input
                        value={plan.name}
                        onChange={(e) => updatePlan(index, "name", e.target.value)}
                        placeholder="Monthly Two Meals"
                        className="bg-background text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Duration</Label>
                      <Select
                        value={plan.duration}
                        onValueChange={(v) => updatePlan(index, "duration", v as MealPlanDuration)}
                      >
                        <SelectTrigger className="bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_PLAN_DURATION_OPTIONS.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {MEAL_PLAN_DURATION_LABELS[duration]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="number"
                        value={String(plan.price)}
                        onChange={(e) => updatePlan(index, "price", Number(e.target.value) || 0)}
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={plan.description || ""}
                      onChange={(e) => updatePlan(index, "description", e.target.value)}
                      placeholder="Lunch + dinner for 30 days with free delivery within 4 km"
                      className="bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Included Meals</Label>
                    <div className="flex flex-wrap gap-4">
                      {MEAL_TYPE_OPTIONS.map((meal) => (
                        <label
                          key={meal}
                          className="flex items-center gap-2 text-xs cursor-pointer"
                        >
                          <Checkbox
                            checked={plan.includedMeals.includes(meal)}
                            onCheckedChange={() => togglePlanMeal(index, meal)}
                          />
                          <span>{MEAL_TYPE_LABELS[meal]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={!!plan.deliveryIncluded}
                        onCheckedChange={(v) => updatePlan(index, "deliveryIncluded", !!v)}
                      />
                      <span>Delivery included</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={!!plan.pauseAllowed}
                        onCheckedChange={(v) => updatePlan(index, "pauseAllowed", !!v)}
                      />
                      <span>Pause allowed</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={plan.isActive !== false}
                        onCheckedChange={(v) => updatePlan(index, "isActive", !!v)}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
