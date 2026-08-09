import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  MapPin,
  User as UserIcon,
  LogOut,
  Settings,
  MessageSquare,
  Users,
  ShieldCheck,
  Building2,
  Home,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const NAV_LINKS = [
  { label: "Accommodations", href: "/accommodations" },
  { label: "Study Libraries", href: "/libraries" },
  { label: "Mess / Tiffin", href: "/mess" },
  { label: "Services", href: "/services" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const profileLink =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "owner"
        ? "/owner/profile"
        : "/dashboard/profile";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
            SH
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight">StudentHub</span>
            <span className="flex items-center text-[10px] text-muted-foreground">
              <MapPin className="mr-0.5 h-3 w-3 text-primary" /> Indore
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User account menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary ring-offset-background transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
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
                  <span>Profile</span>
                </DropdownMenuItem>

                {user.role === "admin" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                      <ShieldCheck className="mr-2 h-4 w-4 text-purple-600" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/search-analytics")}>
                      <ShieldCheck className="mr-2 h-4 w-4 text-indigo-600" />
                      <span>Search Analytics</span>
                    </DropdownMenuItem>
                  </>
                )}

                {user.role === "owner" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/owner/dashboard")}>
                      <Building2 className="mr-2 h-4 w-4 text-primary" />
                      <span>
                        {user.ownerType === "library"
                          ? "Library Dashboard"
                          : user.ownerType === "mess"
                            ? "Mess Dashboard"
                            : user.ownerType === "service_provider"
                              ? "Service Dashboard"
                              : "Owner Dashboard"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/owner/listings")}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>
                        {user.ownerType === "library"
                          ? "My Libraries"
                          : user.ownerType === "mess"
                            ? "My Messes"
                            : user.ownerType === "service_provider"
                              ? "My Services"
                              : "My Properties"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/owner/leads")}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Manage Leads</span>
                    </DropdownMenuItem>
                  </>
                )}

                {(user.role === "student" || user.role === "professional") && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard/enquiries")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>My Enquiries</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/owner">List Your Property</Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            {isAuthenticated && user && (
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.firstName, user.lastName)
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {isAuthenticated && user && (
                <>
                  <Link
                    to={profileLink}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Settings
                  </Link>
                </>
              )}
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                >
                  Log out
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild onClick={() => setOpen(false)}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/owner">List Your Property</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
