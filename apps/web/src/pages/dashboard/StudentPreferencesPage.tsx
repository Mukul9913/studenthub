import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Save,
  MapPin,
  Wallet,
  GraduationCap,
  Clock,
  Star,
  Check,
  Loader2,
} from "lucide-react";
import { DashboardShell, USER_SIDEBAR } from "@/components/layout/DashboardShell";
import { SEOHead } from "../../components/seo/SEOHead";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { getStudentPreferences, updateStudentPreferences } from "@/services/recommendation";
import type { StudentPreferenceDTO } from "@studenthub/types";

const INDORE_AREAS = [
  "Vijay Nagar",
  "Palasia",
  "Bhawarkua",
  "South Tukoganj",
  "Rajwada",
  "Geeta Bhawan",
  "MR 10",
  "Tilak Nagar",
  "Sapna Sangeeta",
  "Rau",
];

const FACILITIES = [
  "AC",
  "WiFi",
  "24x7 Access",
  "Power Backup",
  "CCTV",
  "Locker",
  "Parking",
  "Reading Room",
  "Cafeteria",
  "Printing",
  "Meals Included",
  "Laundry",
];

const CATEGORIES = [
  { value: "LIBRARY", label: "Study Libraries", icon: "📚" },
  { value: "ACCOMMODATION", label: "PGs & Hostels", icon: "🏠" },
  { value: "COACHING", label: "Coaching Centers", icon: "🎓" },
  { value: "TIFFIN", label: "Tiffin Services", icon: "🍱" },
];

const LIFESTYLE = [
  "Early Riser",
  "Night Owl",
  "Vegetarian",
  "Non-Vegetarian",
  "Solo Studier",
  "Group Studier",
  "Fitness Enthusiast",
  "Introvert",
];

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ChipSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function StudentPreferencesPage() {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["student-preferences"],
    queryFn: getStudentPreferences,
  });

  const [form, setForm] = useState<Partial<StudentPreferenceDTO>>({});
  const [saved, setSaved] = useState(false);

  const prefs = { ...existing, ...form };

  const mutation = useMutation({
    mutationFn: updateStudentPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const toggle = (field: keyof StudentPreferenceDTO, value: string) => {
    const current = (prefs[field] as string[] | undefined) ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setForm((f) => ({ ...f, [field]: updated }));
  };

  const set = (field: keyof StudentPreferenceDTO, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    mutation.mutate(form as Partial<StudentPreferenceDTO>);
  };

  if (isLoading) {
    return (
      <>
        <SEOHead
          title="My Preferences | StudentHub"
          description="Set your college, budget, and area preferences to get personalized listing recommendations."
        />
        <DashboardShell
          title="My Preferences"
          subtitle="Help us personalize your feed with college, budget, and area preferences."
          links={USER_SIDEBAR}
          currentPath={pathname}
        >
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardShell>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="My Preferences | StudentHub"
        description="Set your college, budget, and area preferences to get personalized listing recommendations."
      />

      <DashboardShell
        title="My Preferences"
        subtitle="Help us personalize your feed. These preferences power your home page recommendations."
        links={USER_SIDEBAR}
        currentPath={pathname}
      >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="sticky top-20 z-10 -mx-1 flex justify-end bg-background/95 pb-2 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button
            onClick={handleSave}
            disabled={mutation.isPending || Object.keys(form).length === 0}
            className="shrink-0"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saved ? "Saved!" : "Save Preferences"}
          </Button>
        </div>

        {saved && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            ✓ Preferences saved! Your home feed will now show personalized recommendations.
          </div>
        )}

        {/* Education */}
        <SectionCard icon={GraduationCap} title="Education Details">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                College / University
              </label>
              <input
                type="text"
                placeholder="e.g. DAVV, SGSITS"
                defaultValue={prefs.college ?? ""}
                onChange={(e) => set("college", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Course
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech, UPSC Prep"
                defaultValue={prefs.course ?? ""}
                onChange={(e) => set("course", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Year</label>
              <select
                defaultValue={prefs.year ?? ""}
                onChange={(e) => set("year", Number(e.target.value) || undefined)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select year</option>
                {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Budget */}
        <SectionCard icon={Wallet} title="Monthly Budget">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Minimum (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 1000"
                defaultValue={prefs.budgetMin ?? ""}
                onChange={(e) => set("budgetMin", Number(e.target.value) || undefined)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Maximum (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                defaultValue={prefs.budgetMax ?? ""}
                onChange={(e) => set("budgetMax", Number(e.target.value) || undefined)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Current: ₹{prefs.budgetMin?.toLocaleString("en-IN") ?? 0} – ₹
            {prefs.budgetMax?.toLocaleString("en-IN") ?? "Any"}
          </p>
        </SectionCard>

        {/* Preferred Areas */}
        <SectionCard icon={MapPin} title="Preferred Areas in Indore">
          <p className="mb-3 text-xs text-muted-foreground">
            Select all areas where you'd like to find listings
          </p>
          <ChipSelector
            options={INDORE_AREAS}
            selected={prefs.preferredAreas ?? []}
            onToggle={(v) => toggle("preferredAreas", v)}
          />
        </SectionCard>

        {/* Facilities */}
        <SectionCard icon={Star} title="Must-Have Facilities">
          <p className="mb-3 text-xs text-muted-foreground">
            Only show listings with these facilities
          </p>
          <ChipSelector
            options={FACILITIES}
            selected={prefs.preferredFacilities ?? []}
            onToggle={(v) => toggle("preferredFacilities", v)}
          />
        </SectionCard>

        {/* Categories */}
        <SectionCard icon={Brain} title="Favorite Categories">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map(({ value, label, icon }) => {
              const isSelected = (prefs.favoriteCategories ?? []).includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggle("favoriteCategories", value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  {label}
                  {isSelected && (
                    <Badge className="text-[10px] px-1.5 py-0.5 bg-primary text-white">
                      Selected
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Study & Lifestyle */}
        <SectionCard icon={Clock} title="Study & Lifestyle">
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Study Hours Per Day
              </label>
              <select
                defaultValue={prefs.studyHoursPerDay ?? ""}
                onChange={(e) => set("studyHoursPerDay", Number(e.target.value) || undefined)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Not specified</option>
                {[2, 4, 6, 8, 10, 12, 14].map((h) => (
                  <option key={h} value={h}>
                    {h} hours/day
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Gender Preference
              </label>
              <select
                defaultValue={prefs.genderPreference ?? "ANY"}
                onChange={(e) => set("genderPreference", e.target.value || "ANY")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="ANY">Any (Co-ed)</option>
                <option value="MALE">Male Only</option>
                <option value="FEMALE">Female Only</option>
              </select>
            </div>
          </div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Lifestyle Tags</p>
          <ChipSelector
            options={LIFESTYLE}
            selected={prefs.lifestylePreferences ?? []}
            onToggle={(v) => toggle("lifestylePreferences", v)}
          />
        </SectionCard>

        {/* Save button at bottom */}
        <div className="flex justify-end pb-6">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={mutation.isPending || Object.keys(form).length === 0}
            className="gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Preferences
          </Button>
        </div>
      </div>
      </DashboardShell>
    </>
  );
}
