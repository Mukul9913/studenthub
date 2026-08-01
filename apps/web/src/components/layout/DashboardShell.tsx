import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  MapPin,
  LayoutDashboard,
  Home,
  PlusCircle,
  MessageSquare,
  User,
  CalendarCheck,
} from "lucide-react";
import { Button } from "../ui/button";

export interface SidebarLink {
  to: string;
  label: string;
  icon: typeof Home;
}

export function DashboardShell({
  title,
  subtitle,
  links,
  children,
  currentPath,
}: {
  title: string;
  subtitle?: string;
  links: SidebarLink[];
  children: ReactNode;
  currentPath: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-elevated">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="font-bold">StudentHub</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">Back to site</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col">
            {links.map((l) => {
              const isActive =
                currentPath === l.to ||
                (l.to !== "/dashboard" && l.to !== "/owner" && currentPath.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <l.icon className="h-4 w-4" />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export const USER_SIDEBAR: SidebarLink[] = [
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/saved", label: "Saved Listings", icon: Home },
  { to: "/dashboard/recent", label: "Recently Viewed", icon: LayoutDashboard },
  { to: "/dashboard/enquiries", label: "Enquiries", icon: MessageSquare },
  { to: "/dashboard/settings", label: "Settings", icon: User },
];

export const OWNER_SIDEBAR: SidebarLink[] = [
  { to: "/owner/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/owner/listings", label: "My Listings", icon: Home },
  { to: "/owner/accommodations/new", label: "Add Listing", icon: PlusCircle },
  { to: "/owner/availability", label: "Availability", icon: CalendarCheck },
  { to: "/owner/leads", label: "Leads", icon: MessageSquare },
  { to: "/owner/profile", label: "Profile", icon: User },
];

export function getOwnerSidebar(ownerType?: string | null): SidebarLink[] {
  if (ownerType === "library") {
    return [
      { to: "/owner/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/owner/listings", label: "My Libraries", icon: Home },
      { to: "/owner/accommodations/new", label: "Add Library", icon: PlusCircle },
      { to: "/owner/leads", label: "Leads", icon: MessageSquare },
      { to: "/owner/profile", label: "Profile", icon: User },
    ];
  }
  if (ownerType === "mess") {
    return [
      { to: "/owner/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/owner/listings", label: "My Messes", icon: Home },
      { to: "/owner/accommodations/new", label: "Add Mess", icon: PlusCircle },
      { to: "/owner/leads", label: "Leads", icon: MessageSquare },
      { to: "/owner/profile", label: "Profile", icon: User },
    ];
  }
  if (ownerType === "service_provider") {
    return [
      { to: "/owner/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/owner/listings", label: "My Services", icon: Home },
      { to: "/owner/accommodations/new", label: "Add Service", icon: PlusCircle },
      { to: "/owner/leads", label: "Leads", icon: MessageSquare },
      { to: "/owner/profile", label: "Profile", icon: User },
    ];
  }
  return OWNER_SIDEBAR;
}
