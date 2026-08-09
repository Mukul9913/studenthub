import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { fetchApi, ApiError } from "../../services/api";

import { PUBLIC_ROLE_OPTIONS, OWNER_TYPE_OPTIONS } from "@/features/auth/constants";
import type { OwnerType } from "@studenthub/types";

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "student" as "student" | "professional" | "owner",
    ownerType: "accommodation" as OwnerType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    else if (form.firstName.trim().length > 50)
      errs.firstName = "First name must not exceed 50 characters.";

    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    else if (form.lastName.trim().length > 50)
      errs.lastName = "Last name must not exceed 50 characters.";

    if (!form.email.trim()) errs.email = "Email is required.";

    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
      errs.phone = "Enter a valid phone number (e.g. +919876543210).";
    }

    if (form.role === "owner" && !form.ownerType) {
      errs.ownerType = "Please select the type of business you manage.";
    }

    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    else if (form.password.length > 100) errs.password = "Password must not exceed 100 characters.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);
    setIsLoading(true);

    try {
      await fetchApi<{ requiresOtp: boolean; message: string }>("/auth/register", {
        method: "POST",
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          ...(form.role === "owner" ? { ownerType: form.ownerType } : {}),
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        },
      });

      toast.success("Registration successful! Please check your email for the 6-digit OTP code.");
      navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    } catch (err) {
      if (err instanceof ApiError) {
        // Map field-level details if available
        if (err.details) {
          const fieldErrs: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.details)) {
            if (msgs[0]) fieldErrs[key] = msgs[0];
          }
          setErrors(fieldErrs);
        } else {
          setServerError(err.firstFieldError);
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join thousands finding their place in Indore."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {serverError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-firstName">First name</Label>
            <Input
              id="reg-firstName"
              autoComplete="given-name"
              value={form.firstName}
              onChange={upd("firstName")}
              placeholder="Saarthi"
              disabled={isLoading}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-lastName">Last name</Label>
            <Input
              id="reg-lastName"
              autoComplete="family-name"
              value={form.lastName}
              onChange={upd("lastName")}
              placeholder="Hub"
              disabled={isLoading}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={upd("email")}
            placeholder="saarthi@example.com"
            disabled={isLoading}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-phone">
            Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={upd("phone")}
            placeholder="+919876543210"
            disabled={isLoading}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-role">I am a</Label>
          <Select
            value={form.role}
            onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}
          >
            <SelectTrigger id="reg-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PUBLIC_ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.role === "owner" && (
          <div className="space-y-1.5">
            <Label htmlFor="reg-ownerType">Business / Service Type</Label>
            <Select
              value={form.ownerType}
              onValueChange={(v) => setForm({ ...form, ownerType: v as OwnerType })}
            >
              <SelectTrigger id="reg-ownerType">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {OWNER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ownerType && <p className="text-xs text-destructive">{errors.ownerType}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={upd("password")}
            placeholder="At least 8 characters"
            disabled={isLoading}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        {serverError && (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          loadingText="Creating account…"
        >
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
