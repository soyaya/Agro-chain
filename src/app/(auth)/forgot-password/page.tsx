"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { cn } from "~/lib/utils";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EmailForm = z.infer<typeof emailSchema>;

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [emailAddress, setEmailAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isValid: resetValid },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
  });

  const onSendOtp = async (data: EmailForm) => {
    setLoading(true);
    setOtpError(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress: data.email }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to send OTP");
      }
      toast.success(`OTP sent to ${data.email}`);
      setEmailAddress(data.email);
      setStep(2);
      setCooldownSeconds(60);
      setResendAttempts(0);
      setResendLocked(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetForm) => {
    if (otp.length < 6) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setOtpError(null);
    try {
      const response = await fetch("/api/auth/forgot-password/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailAddress,
          resetOtp: Number(otp),
          newPassword: data.newPassword,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Failed to reset password");
      }
      toast.success("Password reset successful. You can now log in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      setOtpError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 2 || resendLocked) return;
    if (cooldownSeconds <= 0) return;
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
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to resend OTP");
      }
      const nextAttempts = resendAttempts + 1;
      const attemptsLeft = 2 - nextAttempts;
      setResendAttempts(nextAttempts);
      setCooldownSeconds(60);
      if (nextAttempts >= 2) {
        setResendLocked(true);
      }
      toast.success(
        attemptsLeft >= 0
          ? `OTP resent. ${attemptsLeft} resend${attemptsLeft === 1 ? "" : "s"} left.`
          : "OTP resent.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resend OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="default-container-max-width flex min-h-screen flex-col gap-(--section-gap)">
      <h2 className="font-ubuntu text-center text-2xl font-bold sm:text-3xl lg:text-4xl">
        Forgot Password
      </h2>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onSubmit={handleSubmit(onSendOtp)}
            className="default-page-max-width flex w-full flex-col gap-(--gap-lg)"
          >
            <DynamicInput
              fieldType="email"
              label="Email Address"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
              required
              disabled={loading}
            />
            <SubmitPrimaryButton
              loading={loading}
              disabled={!isValid || loading}
              type="submit"
            >
              Send OTP
            </SubmitPrimaryButton>
          </motion.form>
        ) : (
          <motion.form
            key="step-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onSubmit={handleResetSubmit(handleResetPassword)}
            className="default-page-max-width flex w-full flex-col gap-(--gap-lg)"
          >
            <p className="text-text-colour text-center text-sm">
              Enter the OTP sent to {emailAddress}
            </p>
            <div className="flex flex-col items-center gap-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                containerClassName={cn("gap-3", otpError && "animate-shake")}
              >
                <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} aria-invalid={!!otpError} />
                  <InputOTPSlot index={1} aria-invalid={!!otpError} />
                  <InputOTPSlot index={2} aria-invalid={!!otpError} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={3} aria-invalid={!!otpError} />
                  <InputOTPSlot index={4} aria-invalid={!!otpError} />
                  <InputOTPSlot index={5} aria-invalid={!!otpError} />
                </InputOTPGroup>
              </InputOTP>

              {otpError && (
                <p className="text-destructive text-center text-sm font-medium">
                  {otpError}
                </p>
              )}
            </div>

            <DynamicInput
              fieldType="password"
              label="New Password"
              error={resetErrors.newPassword?.message}
              {...registerReset("newPassword")}
              required
            />
            <DynamicInput
              fieldType="password"
              label="Confirm New Password"
              error={resetErrors.confirmPassword?.message}
              {...registerReset("confirmPassword")}
              required
            />

            <SubmitPrimaryButton
              loading={loading}
              disabled={!resetValid || loading}
              type="submit"
            >
              Reset Password
            </SubmitPrimaryButton>

            <p className="text-text-colour text-center text-sm">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                className="cursor-pointer font-medium text-(--black) decoration-2 underline-offset-4 hover:underline"
                onClick={handleResendOtp}
                disabled={loading || cooldownSeconds > 0 || resendLocked}
              >
                {resendLocked
                  ? "Retry after 24 hours"
                  : cooldownSeconds > 0
                    ? `Resend in ${cooldownSeconds}s`
                    : "Resend OTP"}
              </button>
            </p>
            <p className="text-text-colour text-center text-xs">
              {resendLocked
                ? "You’ve reached the resend limit. Try again after 24 hours."
                : `${Math.max(0, 2 - resendAttempts)} resend${
                    2 - resendAttempts === 1 ? "" : "s"
                  } left`}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
