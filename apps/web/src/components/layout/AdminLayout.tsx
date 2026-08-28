import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/config/navigation";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandLogo to="/admin/dashboard" size="sm" />
            <Badge variant="secondary" className="gap-1 text-xs text-primary">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              Control Panel
            </Badge>
          </div>
          <Button size="sm" variant="ghost" asChild className="gap-1.5">
            <Link to="/">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to App
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <nav
            aria-label="Admin"
            className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col"
          >
            <div className="hidden px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:block">
              Administration
            </div>
            {ADMIN_NAV.map((l) => {
              const isActive =
                currentPath === l.href ||
                (l.href !== "/admin/dashboard" && currentPath.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  to={l.href}
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

        <main className="min-w-0 space-y-6">
          {title && (
            <div className="border-b border-border pb-4">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
