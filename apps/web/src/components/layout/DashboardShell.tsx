import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { USER_NAV, getOwnerNav, type NavItem } from "@/config/navigation";

export type SidebarLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

function toSidebarLinks(items: NavItem[]): SidebarLink[] {
  return items.map((item) => ({ to: item.href, label: item.label, icon: item.icon }));
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
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <BrandLogo size="sm" />
          <Button variant="outline" size="sm" asChild>
            <Link to="/">Back to site</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <nav
            aria-label="Dashboard"
            className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col"
          >
            {links.map((l) => {
              const isActive =
                currentPath === l.to ||
                (l.to !== "/dashboard/profile" &&
                  l.to !== "/owner/dashboard" &&
                  currentPath.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <l.icon className="h-4 w-4" aria-hidden />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export const USER_SIDEBAR: SidebarLink[] = toSidebarLinks(USER_NAV);

export const OWNER_SIDEBAR: SidebarLink[] = toSidebarLinks(getOwnerNav());

export function getOwnerSidebar(ownerType?: string | null): SidebarLink[] {
  return toSidebarLinks(getOwnerNav(ownerType));
}
