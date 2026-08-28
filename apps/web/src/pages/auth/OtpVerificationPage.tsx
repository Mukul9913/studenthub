import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RefreshCw, ArrowLeft } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { fetchApi, setToken } from "@/services/api";

export function OtpVerificationPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "VERIFY_EMAIL";
  const autoResend = searchParams.get("autoResend") === "1";
  const navigate = useNavigate();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // If coming from login, allow immediate resend (no forced wait)
  const [resendCooldown, setResendCooldown] = useState(autoResend ? 0 : 60);
  const autoResendDone = useRef(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async (silent = false) => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    if (resendCooldown > 0 && !silent) return;

    setIsResending(true);
    try {
      await fetchApi("/auth/resend-otp", {
        method: "POST",
        data: { email: targetEmail, purpose },
      });
      if (!silent) {
        toast.success("New 6-digit OTP code sent to your email!");
      } else {
        toast.success("OTP sent to your email. Check inbox or spam.");
      }
      setResendCooldown(60);
      setOtp("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to resend OTP";
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  // When redirected from login (unverified), auto-send a fresh OTP once
  useEffect(() => {
    if (!autoResend || autoResendDone.current) return;
    if (!email.trim()) return;
    autoResendDone.current = true;
    void handleResendOtp(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResend, email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    if (otp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsSubmitting(true);
    try {
      if (purpose === "FORGOT_PASSWORD") {
        navigate(
          `/reset-password?email=${encodeURIComponent(targetEmail)}&otp=${encodeURIComponent(otp)}`,
        );
        return;
      }

      const response = await fetchApi<{
        accessToken: string;
        user: { role: string };
      }>("/auth/verify-otp", {
        method: "POST",
        data: {
          email: targetEmail,
          otp,
        },
      });

      setToken(response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success("Account verified successfully! Welcome to StudentHub");
      navigate(response.user.role === "owner" ? "/owner/dashboard" : "/accommodations");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to verify OTP code";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Verify Your Account"
      subtitle="Enter the 6-digit OTP sent to your email. Didn’t get it? Resend below."
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="otp-email">Email</Label>
          <Input
            id="otp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, idx) => (
                <InputOTPSlot
                  key={idx}
                  index={idx}
                  className="h-12 w-11 rounded-xl border-border text-xl font-bold font-mono sm:w-12"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={otp.length < 6}
          isLoading={isSubmitting}
          loadingText="Verifying..."
          className="h-11 w-full rounded-xl text-sm font-semibold"
        >
          Verify OTP Code
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5 text-xs">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline-flex items-center font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Login
        </button>

        <button
          type="button"
          disabled={resendCooldown > 0 || isResending}
          onClick={() => handleResendOtp(false)}
          className="inline-flex items-center font-semibold text-primary hover:underline disabled:text-muted-foreground"
        >
          {isResending && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
          {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
        </button>
      </div>
    </AuthShell>
  );
}
