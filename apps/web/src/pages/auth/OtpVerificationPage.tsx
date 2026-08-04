import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchApi, setToken } from "@/services/api";

export function OtpVerificationPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "VERIFY_EMAIL";
  const navigate = useNavigate();

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsSubmitting(true);
    try {
      if (purpose === "FORGOT_PASSWORD") {
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${fullOtp}`);
        return;
      }

      const response = await fetchApi<{
        accessToken: string;
        user: { role: string };
      }>("/auth/verify-otp", {
        method: "POST",
        data: {
          email,
          otp: fullOtp,
        },
      });

      setToken(response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success("Account verified successfully! Welcome to StudentHub 🎉");
      navigate(response.user.role === "owner" ? "/owner/dashboard" : "/accommodations");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to verify OTP code";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await fetchApi("/auth/resend-otp", {
        method: "POST",
        data: { email, purpose },
      });
      toast.success("New 6-digit OTP code sent to your email!");
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to resend OTP";
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight">Verify Your Account</h1>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          We sent a 6-digit verification OTP code to
          <br />
          <span className="font-semibold text-foreground">{email || "your email address"}</span>
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="h-12 w-11 sm:w-12 text-center text-xl font-bold font-mono rounded-xl border border-border bg-background text-foreground shadow-xs focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || otpDigits.join("").length < 6}
            className="w-full h-11 text-sm font-semibold rounded-xl"
          >
            {isSubmitting ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Verify OTP Code
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Login
          </button>

          <button
            type="button"
            disabled={resendCooldown > 0 || isResending}
            onClick={handleResendOtp}
            className="inline-flex items-center font-semibold text-primary disabled:text-muted-foreground hover:underline"
          >
            {isResending && <RefreshCw className="h-3 w-3 animate-spin mr-1" />}
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
