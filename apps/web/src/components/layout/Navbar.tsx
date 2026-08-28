import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  User as UserIcon,
  LogOut,
  Settings,
  MessageSquare,
  ShieldCheck,
  Building2,
  Home,
  SlidersHorizontal,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PUBLIC_NAV } from "@/config/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const profileLink =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "owner"
        ? "/owner/profile"
        : "/dashboard/profile";

  const settingsLink = user?.role === "owner" ? "/owner/settings" : "/dashboard/settings";

  const closeMobile = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <BrandLogo showLocation size="md" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {PUBLIC_NAV.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <>
              {user.role === "owner" && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/owner/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              {user.role === "admin" && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/dashboard">
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="User account menu"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary ring-offset-background transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user.firstName, user.lastName)
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(profileLink)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}

                  {user.role === "owner" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/owner/dashboard")}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Owner Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/owner/listings")}>
                        <Home className="mr-2 h-4 w-4" />
                        My Listings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/owner/leads")}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Leads
                      </DropdownMenuItem>
                    </>
                  )}

                  {(user.role === "student" || user.role === "professional") && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/dashboard/enquiries")}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        My Enquiries
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/dashboard/preferences")}>
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Preferences
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem onClick={() => navigate(settingsLink)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register?role=owner">List Your Property</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <BrandLogo size="sm" />
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {PUBLIC_NAV.map((l) => (
                  <Link
                    key={l.href}
                    to={l.href}
                    onClick={closeMobile}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium",
                      pathname.startsWith(l.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}

                {isAuthenticated && user && (
                  <>
                    <Link
                      to={profileLink}
                      onClick={closeMobile}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Profile
                    </Link>
                    {(user.role === "student" || user.role === "professional") && (
                      <>
                        <Link
                          to="/dashboard/enquiries"
                          onClick={closeMobile}
                          className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                          Enquiries
                        </Link>
                        <Link
                          to="/dashboard/preferences"
                          onClick={closeMobile}
                          className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                          Preferences
                        </Link>
                      </>
                    )}
                    {user.role === "owner" && (
                      <>
                        <Link
                          to="/owner/dashboard"
                          onClick={closeMobile}
                          className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                          Owner Dashboard
                        </Link>
                        <Link
                          to="/owner/leads"
                          onClick={closeMobile}
                          className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                          Leads
                        </Link>
                      </>
                    )}
                    {user.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={closeMobile}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to={settingsLink}
                      onClick={closeMobile}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Settings
                    </Link>
                  </>
                )}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      closeMobile();
                      handleLogout();
                    }}
                  >
                    Log out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/login" onClick={closeMobile}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register?role=owner" onClick={closeMobile}>
                        List Your Property
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
