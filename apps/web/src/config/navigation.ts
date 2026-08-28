import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  MessageSquare,
  User,
  Settings,
  SlidersHorizontal,
  Crown,
  Star,
  TrendingUp,
  BarChart3,
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  Search,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

/** Public marketing nav — only live destinations */
export const PUBLIC_NAV: { label: string; href: string }[] = [
  { label: "Accommodations", href: "/accommodations" },
  { label: "Study Libraries", href: "/libraries" },
  { label: "Mess / Tiffin", href: "/mess" },
];

export const USER_NAV: NavItem[] = [
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Preferences", href: "/dashboard/preferences", icon: SlidersHorizontal },
  { label: "Enquiries", href: "/dashboard/enquiries", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const OWNER_BASE: NavItem[] = [
  { label: "Overview", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/owner/listings", icon: Home },
  { label: "Add Listing", href: "/owner/listings/new", icon: PlusCircle },
  { label: "Leads", href: "/owner/leads", icon: MessageSquare },
  { label: "CRM", href: "/owner/crm", icon: TrendingUp },
  { label: "Listing Analytics", href: "/owner/listing-analytics", icon: BarChart3 },
  { label: "Reviews", href: "/owner/reviews", icon: Star },
  { label: "Subscription", href: "/owner/subscription", icon: Crown },
  { label: "Profile", href: "/owner/profile", icon: User },
  { label: "Settings", href: "/owner/settings", icon: Settings },
];

export function getOwnerNav(ownerType?: string | null): NavItem[] {
  if (ownerType === "library") {
    return OWNER_BASE.map((item) => {
      if (item.href === "/owner/listings") return { ...item, label: "My Libraries" };
      if (item.href === "/owner/listings/new") return { ...item, label: "Add Library" };
      return item;
    });
  }
  if (ownerType === "mess") {
    return OWNER_BASE.map((item) => {
      if (item.href === "/owner/listings") return { ...item, label: "My Messes" };
      if (item.href === "/owner/listings/new") return { ...item, label: "Add Mess" };
      return item;
    });
  }
  if (ownerType === "service_provider") {
    return OWNER_BASE.map((item) => {
      if (item.href === "/owner/listings") return { ...item, label: "My Services" };
      if (item.href === "/owner/listings/new") return { ...item, label: "Add Service" };
      return item;
    });
  }
  return OWNER_BASE;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Listings", href: "/admin/listings", icon: Building2 },
  { label: "Listing Moderation", href: "/admin/moderation", icon: ShieldCheck },
  { label: "Review Moderation", href: "/admin/reviews", icon: Star },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Business Owners", href: "/admin/owners", icon: Briefcase },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { label: "Monetization", href: "/admin/monetization", icon: Crown },
  { label: "Search Telemetry", href: "/admin/search-analytics", icon: Search },
  { label: "CRM Analytics", href: "/admin/crm-analytics", icon: TrendingUp },
];
