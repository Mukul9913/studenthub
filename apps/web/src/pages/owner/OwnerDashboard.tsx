import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, CheckCircle2, Clock, FileText, Plus, Eye, Sparkles } from "lucide-react";
import { DashboardShell, getOwnerSidebar } from "../../components/layout/DashboardShell";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { getMyListings } from "../../features/accommodation/services";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { OWNER_TYPE_OPTIONS } from "@/features/auth/constants";
import { fetchApi } from "../../services/api";

export function OwnerDashboard() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOwnerType, setSelectedOwnerType] = useState<string>("accommodation");
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["owner-my-listings"],
    queryFn: getMyListings,
  });

  const handleSaveOwnerType = async () => {
    setIsSavingOnboarding(true);
    try {
      await fetchApi("/users/me", {
        method: "PATCH",
        data: { ownerType: selectedOwnerType },
      });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    } catch {
      // Ignore error
    } finally {
      setIsSavingOnboarding(false);
    }
  };

  const ownerType = user?.ownerType;
  const sidebarLinks = getOwnerSidebar(ownerType);

  const getHeaderInfo = () => {
    const name = user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back, Owner";
    switch (ownerType) {
      case "library":
        return {
          title: name,
          subtitle: "Overview of your study space listings, capacity, and student leads.",
          addUrl: "/owner/accommodations/new",
          addLabel: "Add Library",
          domainLabel: "Library",
        };
      case "mess":
        return {
          title: name,
          subtitle: "Overview of your food services, menus, and subscriber leads.",
          addUrl: "/owner/accommodations/new",
          addLabel: "Add Mess",
          domainLabel: "Mess",
        };
      case "service_provider":
        return {
          title: name,
          subtitle: "Overview of your local services and customer leads.",
          addUrl: "/owner/accommodations/new",
          addLabel: "Add Service",
          domainLabel: "Service",
        };
      default:
        return {
          title: name,
          subtitle: "Overview of your rental properties, rooms, and tenant leads.",
          addUrl: "/owner/accommodations/new",
          addLabel: "Add Property",
          domainLabel: "Accommodation",
        };
    }
  };

  const headerInfo = getHeaderInfo();

  const stats = data?.stats || {
    total: 0,
    published: 0,
    pendingReview: 0,
    draft: 0,
    rejected: 0,
    archived: 0,
  };

  const statCards = [
    { label: "Total listings", value: stats.total, icon: Home, color: "text-primary" },
    { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Pending Review", value: stats.pendingReview, icon: Clock, color: "text-amber-600" },
    { label: "Drafts", value: stats.draft, icon: FileText, color: "text-muted-foreground" },
  ];

  const recentListings = (data?.items || []).slice(0, 4);

  return (
    <DashboardShell
      title={headerInfo.title}
      subtitle={headerInfo.subtitle}
      links={sidebarLinks}
      currentPath={pathname}
    >
      {/* Onboarding Banner for legacy owners without ownerType */}
      {user?.role === "owner" && !user?.ownerType && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold">Complete Your Business Profile</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your primary business type to customize your owner dashboard and listing
                tools.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {OWNER_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedOwnerType(opt.value)}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                      selectedOwnerType === opt.value
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border bg-card hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={handleSaveOwnerType} disabled={isSavingOnboarding}>
                  {isSavingOnboarding ? "Saving..." : "Save Business Profile"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <span className={`grid h-8 w-8 place-items-center rounded-md bg-muted ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent listings</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/owner/listings">
              <Eye className="mr-1 h-4 w-4" /> View all
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/owner/accommodations/new">
              <Plus className="mr-1 h-4 w-4" /> Add listing
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4">
          <LoadingState />
        </div>
      ) : recentListings.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No listings yet"
            description="Create your first accommodation listing to start finding tenants."
            action={
              <Button asChild>
                <Link to="/owner/accommodations/new">Add listing</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {recentListings.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={a.images[0]}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded-md object-cover bg-muted"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.location.area} · ₹{a.monthlyRent.toLocaleString("en-IN")}/mo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {(a as unknown as { status?: string }).status || "Pending"}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/accommodations/${a.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
