import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  MessageSquare,
  ArrowLeft,
  TrendingUp,
  Crown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/monetization", label: "Monetization & Plans", icon: Crown },
    { to: "/admin/reviews", label: "Review Moderation", icon: Star },
    { to: "/admin/moderation", label: "Listing Moderation", icon: ShieldCheck },
    { to: "/admin/search-analytics", label: "Search Telemetry", icon: TrendingUp },
    { to: "/admin/listings", label: "Listings", icon: Building2 },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/owners", label: "Business Owners", icon: Briefcase },
    { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Admin Navigation Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="font-bold tracking-tight text-lg">StudentHub</span>
            </Link>
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20 gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" /> Control Panel
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" asChild className="gap-1.5 text-xs">
              <Link to="/">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to App
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Layout */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-2.5 shadow-sm lg:flex-col">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:block">
              Administration
            </div>
            {links.map((l) => {
              const isActive =
                currentPath === l.to ||
                (l.to !== "/admin/dashboard" && currentPath.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-purple-600 text-white shadow-sm"
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

        {/* Page Content */}
        <main className="space-y-6">
          {title && (
            <div className="border-b border-border pb-4">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
