import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      const response = await fetchApi<{ accessToken: string; user: AuthUser }>("/auth/login", {
        method: "POST",
        data: { email: email.trim().toLowerCase(), password },
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
      if (err instanceof ApiError) {
        setError(err.firstFieldError);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
            onChange={(e) => setEmail(e.target.value)}
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
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
