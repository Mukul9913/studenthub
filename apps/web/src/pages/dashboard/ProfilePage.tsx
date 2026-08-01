import { useLocation } from "react-router-dom";
import {
  DashboardShell,
  USER_SIDEBAR,
  OWNER_SIDEBAR,
} from "../../components/layout/DashboardShell";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  const isOwner = user.role === "owner";
  const links = isOwner ? OWNER_SIDEBAR : USER_SIDEBAR;
  const settingsLink = isOwner ? "/owner/settings" : "/dashboard/settings";

  return (
    <DashboardShell
      title="My Profile"
      subtitle="View your personal and account details."
      links={links}
      currentPath={pathname}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft text-3xl font-semibold text-primary">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
            )}
          </div>
          <h2 className="mt-4 text-xl font-bold">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm capitalize text-muted-foreground">{user.role}</p>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <ShieldCheck className="h-4 w-4" /> Account Verified
          </div>

          <Button className="mt-6 w-full" asChild>
            <Link to={settingsLink}>Edit Profile</Link>
          </Button>
        </div>

        {/* Details List */}
        <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Personal Information</h3>
          </div>
          <div className="divide-y divide-border">
            <InfoRow icon={User} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
            <InfoRow icon={Mail} label="Email Address" value={user.email} />
            <InfoRow icon={Phone} label="Phone Number" value={user.phone || "Not provided"} />
            <InfoRow
              icon={Calendar}
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 px-6 py-4 sm:items-center">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:mt-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
}
