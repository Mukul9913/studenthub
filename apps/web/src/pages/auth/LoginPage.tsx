import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/ui/password-input";
import { Label } from "../../components/ui/label";
import { fetchApi, setToken, ApiError } from "../../services/api";

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const goToVerifyOtp = (targetEmail: string, autoResend = true) => {
    const params = new URLSearchParams({
      email: targetEmail,
      purpose: "VERIFY_EMAIL",
    });
    if (autoResend) params.set("autoResend", "1");
    navigate(`/verify-otp?${params.toString()}`, { replace: true });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setError(null);
    setNeedsVerification(false);
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetchApi<{ accessToken: string; user: AuthUser }>("/auth/login", {
        method: "POST",
        data: { email: normalizedEmail, password },
      });

      setToken(response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Welcome back!");

      const redirectParam = searchParams.get("redirect");
      const locationFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const targetPath =
        redirectParam ||
        locationFrom ||
        (response.user.role === "owner"
          ? "/owner/dashboard"
          : response.user.role === "admin"
            ? "/admin/dashboard"
            : "/accommodations");

      navigate(targetPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
        setError("Your email is not verified yet. Verify with OTP to continue.");
        toast.message("Email not verified", {
          description: "We will send a new OTP so you can verify your account.",
        });
        // Send user to OTP screen and trigger resend automatically
        goToVerifyOtp(normalizedEmail, true);
        return;
      }
      if (err instanceof ApiError) {
        setError(err.firstFieldError);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyClick = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Enter your email first, then click Verify.");
      return;
    }
    setIsSendingOtp(true);
    try {
      goToVerifyOtp(normalizedEmail, true);
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your search."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setNeedsVerification(false);
            }}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {error && (
          <div className="space-y-2" role="alert">
            <p className="text-sm text-destructive">{error}</p>
            {needsVerification && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                isLoading={isSendingOtp}
                onClick={handleVerifyClick}
              >
                Verify email with OTP
              </Button>
            )}
          </div>
        )}
        <Button type="submit" className="w-full" isLoading={isLoading} loadingText="Signing in…">
          Log in
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Registered but never verified?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={handleVerifyClick}
          >
            Verify email
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
