import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DashboardShell,
  USER_SIDEBAR,
  OWNER_SIDEBAR,
} from "../../components/layout/DashboardShell";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { fetchApi, ApiError } from "../../services/api";
import type { User } from "@studenthub/types";

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export function SettingsPage() {
  const { user, refetch } = useAuth();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  if (!user) return null;

  const isOwner = user.role === "owner";
  const links = isOwner ? OWNER_SIDEBAR : USER_SIDEBAR;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
      errs.phone = "Enter a valid phone number (e.g. +919876543210)";
    }
    if (form.avatar.trim()) {
      try {
        new URL(form.avatar);
      } catch {
        errs.avatar = "Must be a valid URL";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const updatedUser = await fetchApi<{ data: User }>(`/users/${user.id}`, {
        method: "PATCH",
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
          ...(form.avatar.trim() ? { avatar: form.avatar.trim() } : {}),
        },
      });

      // Update local storage and tanstack query cache
      localStorage.setItem("user", JSON.stringify(updatedUser));
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      toast.success("Profile updated successfully!");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) {
          const fieldErrs: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.details)) {
            if (msgs[0]) fieldErrs[key] = msgs[0];
          }
          setErrors(fieldErrs);
        } else {
          toast.error(err.firstFieldError);
        }
      } else {
        toast.error("Failed to update profile.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Settings"
      subtitle="Manage your profile and preferences."
      links={links}
      currentPath={pathname}
    >
      <div className="rounded-xl border border-border bg-card shadow-sm max-w-2xl">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold">Profile Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Update your personal details here.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                disabled={isSubmitting}
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                disabled={isSubmitting}
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+919876543210"
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              type="url"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              disabled={isSubmitting}
            />
            {errors.avatar && <p className="text-xs text-destructive">{errors.avatar}</p>}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
