"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { FullScreenStatusModal } from "~/components/shared/FullScreenStatusModal";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import Link from "next/link";
import { cn } from "~/lib/utils";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type EmailForm = z.infer<typeof emailSchema>;

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [emailAddress, setEmailAddress] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; variant: "loading" | "success" }>(
    {
      open: false,
      variant: "loading",
    },
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  // Step 1: send OTP
  const onSendOtp = async (data: EmailForm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress: data.email, password: data.password }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Login failed");
      }
      toast.success(`OTP sent to ${data.email}`);
      setEmailAddress(data.email);
      setStep(2);
      setResendAttempts(0);
      setResendLocked(false);
      setCooldownSeconds(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP — proxy sets httpOnly cookies, we just redirect
  const handleVerify = useCallback(async () => {
    if (loading || success) return;
    setLoading(true);
    setError(null);
    setStatusModal({ open: true, variant: "loading" });

    try {
      const response = await fetch("/api/auth/login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, loginOtp: Number(loginOtp) }),
        credentials: "include",
      });

      const json = (await response.json()) as {
        message?: string;
        data?: { user?: { role?: string; is_cluster_farmer?: boolean } };
      };

      if (!response.ok) {
        throw new Error(json.message || "OTP verification failed");
      }

      // Cookies are set by the proxy — just determine where to redirect
      const user = json.data?.user;
      const role = user?.role ?? "";
      const isCluster = user?.is_cluster_farmer === true || role === "cluster";

      let dashboardPath = "/buyers-dashboard";
      if (role === "admin") dashboardPath = "/admin-dashboard";
      else if (isCluster) dashboardPath = "/cluster-dashboard";
      else if (role === "farmer") dashboardPath = "/farmers-dashboard";

      setSuccess(true);
      setStatusModal({ open: true, variant: "success" });
      toast.success("Login successful!");

      // Use window.location to force a full navigation so the browser commits
      // the httpOnly cookies set by the proxy before the middleware reads them.
      setTimeout(() => { window.location.href = dashboardPath; }, 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid or expired code";
      setError(msg);
      setStatusModal({ open: false, variant: "loading" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [loading, success, loginOtp, emailAddress]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (step === 2 && loginOtp.length === 6 && !loading && !success) {
      void handleVerify();
    }
  }, [loginOtp, step, loading, success, handleVerify]);

  // Cooldown timer
  useEffect(() => {
    if (step !== 2 || resendLocked || cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, cooldownSeconds, resendLocked]);

  const handleResendOtp = async () => {
    if (loading || resendLocked || cooldownSeconds > 0) return;
    if (resendAttempts >= 2) {
      setResendLocked(true);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/auth/login/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Failed to resend OTP");
      }
      const nextAttempts = resendAttempts + 1;
      setResendAttempts(nextAttempts);
      setCooldownSeconds(60);
      if (nextAttempts >= 2) setResendLocked(true);
      toast.success(
        `OTP resent. ${Math.max(0, 2 - nextAttempts)} resend${2 - nextAttempts === 1 ? "" : "s"} left.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="default-container-max-width flex min-h-screen flex-col py-(--section-px) sm:py-(--section-px-sm)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="default-page-max-width flex w-full flex-col gap-(--section-gap)"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {step === 1 ? (
            <form
              onSubmit={handleSubmit(onSendOtp)}
              className="flex w-full flex-col gap-(--section-gap)"
            >
              <p className="font-roboto-slab text-center text-(--text-colour) lg:text-lg">
                Enter your email address to receive a verification code
              </p>

              <DynamicInput
                fieldType="email"
                label="Email address"
                placeholder="user@gmail.com"
                error={errors.email?.message}
                {...register("email")}
                required
                disabled={loading}
              />
              <DynamicInput
                fieldType="password"
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register("password")}
                required
                disabled={loading}
              />

              <div className="mt-(--submit-button-mt) flex w-full flex-col gap-(--gap-base)">
                <SubmitPrimaryButton loading={loading} disabled={!isValid || loading} type="submit">
                  Send OTP
                </SubmitPrimaryButton>
                <p className="text-center text-sm text-(--text-colour)">
                  Forgot your password?{" "}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-(--black) decoration-2 underline-offset-4 hover:underline"
                  >
                    Reset it
                  </Link>
                </p>
                <p className="text-center text-sm text-(--text-colour)">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-(--black) decoration-2 underline-offset-4 hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-(--section-gap)">
              <p className="font-roboto-slab text-center text-(--text-colour) lg:text-lg">
                Enter the OTP sent to your email
              </p>

              <div className="flex flex-col items-center gap-6">
                <InputOTP
                  maxLength={6}
                  value={loginOtp}
                  onChange={setLoginOtp}
                  containerClassName={cn("gap-3", !!error && "animate-shake")}
                >
                  <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} aria-invalid={!!error} />
                    <InputOTPSlot index={1} aria-invalid={!!error} />
                    <InputOTPSlot index={2} aria-invalid={!!error} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={3} aria-invalid={!!error} />
                    <InputOTPSlot index={4} aria-invalid={!!error} />
                    <InputOTPSlot index={5} aria-invalid={!!error} />
                  </InputOTPGroup>
                </InputOTP>

                {error && (
                  <p className="text-destructive text-center text-sm font-medium">{error}</p>
                )}

                <div className="mt-16 flex w-full flex-col gap-(--gap-base)">
                  <SubmitPrimaryButton
                    onClick={handleVerify}
                    disabled={loginOtp.length < 6 || loading || success}
                    loading={loading}
                    className={cn(success && "bg-(--theme-green-dark) hover:opacity-96")}
                  >
                    {success
                      ? "Verified! Redirecting..."
                      : loading
                        ? "Verifying..."
                        : "Verify Code"}
                  </SubmitPrimaryButton>

                  <p className="text-center text-sm text-(--text-colour)">
                    Didn&apos;t receive a code?{" "}
                    <button
                      type="button"
                      className="cursor-pointer font-medium text-(--black) decoration-2 underline-offset-4 hover:underline"
                      onClick={handleResendOtp}
                      disabled={loading || success || cooldownSeconds > 0 || resendLocked}
                    >
                      {resendLocked
                        ? "Retry after 24 hours"
                        : cooldownSeconds > 0
                          ? `Resend in ${cooldownSeconds}s`
                          : "Resend OTP"}
                    </button>
                  </p>
                  <p className="text-center text-xs text-(--text-colour)">
                    {resendLocked
                      ? "You've reached the resend limit. Try again after 24 hours."
                      : `${Math.max(0, 2 - resendAttempts)} resend${2 - resendAttempts === 1 ? "" : "s"} left`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      <FullScreenStatusModal
        open={statusModal.open}
        variant={statusModal.variant}
        title={
          statusModal.variant === "loading" ? "Verifying your account..." : "Login Successful!"
        }
        description={
          statusModal.variant === "success" ? "Redirecting you to your dashboard." : undefined
        }
      />
    </>
  );
}
