"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { FullScreenStatusModal } from "~/components/shared/FullScreenStatusModal";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/components/ui/input-otp";
import Link from "next/link";
import { cn } from "~/lib/utils";

//=== Step 1 Schema
// const phoneSchema = z.object({
//   phone: z
//     .string()
//     .regex(
//       /^(0|\+234)[789][01]\d{8}$/,
//       "Please enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)",
//     ),
// });

// type PhoneForm = z.infer<typeof phoneSchema>;
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type EmailForm = z.infer<typeof emailSchema>;

//=== Main Component
export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [loginOtp, setLoginOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    variant: "loading" | "success";
  }>({
    open: false,
    variant: "loading",
  });

  //=== Form for Step 1
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  // === Step 1: Send OTP
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
        throw new Error(err.message || "Login failed");
      }

      toast.success(`OTP sent to ${data.email}`);
      setEmailAddress(data.email);
      setStep(2);
      setResendAttempts(0);
      setResendLocked(false);
      setCooldownSeconds(60);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  //=== Step 2: Verify OTP
  const handleVerify = useCallback(async () => {
    if (loading || success) return;

    setLoading(true);
    setError(null);

    setStatusModal({ open: true, variant: "loading" });

    try {
      console.log(`Verifying OTP: ${loginOtp} for phone: ${emailAddress}`);
      await new Promise((r) => setTimeout(r, 1600));

      const response = await fetch("/api/auth/login/otp", {
        method: "POST",
        body: JSON.stringify({ emailAddress, loginOtp: Number(loginOtp) }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      const roleFromBackend = data.role as "Farmer" | "Buyer" | "Cluster Farmer" | "Farmer & Cluster";
      const token = data.token || data.accessToken || data.bearerToken;
      if (token) {
        sessionStorage.setItem("auth_token", token);
      }

      setSuccess(true);
      setStatusModal({ open: true, variant: "success" });

      localStorage.setItem(
        "currentUser",
        JSON.stringify({ phone: emailAddress, role: roleFromBackend }),
      );

      toast.success("Login successful!");

      const isCluster =
        data.isClusterFarmer === true ||
        roleFromBackend === "Cluster Farmer" ||
        data.role === "Farmer & Cluster";

      let dashboardPath = "/buyer-dashboard";
      if (isCluster) {
        dashboardPath = "/cluster-dashboard";
      } else if (roleFromBackend === "Farmer") {
        dashboardPath = "/farmers-dashboard";
      } else {
        dashboardPath = "/buyers-dashboard";
      }

      console.log("Role from backend:", roleFromBackend, "isCluster:", isCluster);

      setTimeout(() => {
        router.push(dashboardPath);
      }, 2200);
    } catch (error) {
      let msg = "Invalid or expired code";

      if (error instanceof Error) {
        msg = error.message;
      }

      setError(msg);
      setStatusModal({ open: false, variant: "loading" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [loading, success, loginOtp, emailAddress, router]);

  //===Auto-submit loginOTP when 6 digits entered
  useEffect(() => {
    if (step === 2 && loginOtp.length === 6 && !loading && !success) {
      void handleVerify();
    }
  }, [loginOtp, step, loading, success, handleVerify]);

  const hasOtpError = !!error;

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

    try {
      setLoading(true);
      const response = await fetch("/api/auth/login/otp/resend", {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to resend OTP";
      toast.error(msg);
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
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {/* Form for Step 1 */}
          {step === 1 ? (
            <form
              onSubmit={handleSubmit(onSendOtp)}
              className="flex w-full flex-col gap-(--section-gap)"
            >
              {/* Heading */}
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
            // Step 2: OTP Input
            <div className="flex flex-col gap-(--section-gap)">
              <p className="font-roboto-slab text-center text-(--text-colour) lg:text-lg">
                Enter the OTP sent to your email
              </p>

              <div className="flex flex-col items-center gap-6">
                <InputOTP
                  maxLength={6}
                  value={loginOtp}
                  onChange={setLoginOtp}
                  containerClassName={cn("gap-3", hasOtpError && "animate-shake")}
                >
                  <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} aria-invalid={hasOtpError} />
                    <InputOTPSlot index={1} aria-invalid={hasOtpError} />
                    <InputOTPSlot index={2} aria-invalid={hasOtpError} />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={3} aria-invalid={hasOtpError} />
                    <InputOTPSlot index={4} aria-invalid={hasOtpError} />
                    <InputOTPSlot index={5} aria-invalid={hasOtpError} />
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
                    className={cn(success && "mt-16 bg-(--theme-green-dark) hover:opacity-96")}
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
                      ? "You’ve reached the resend limit. Try again after 24 hours."
                      : `${Math.max(0, 2 - resendAttempts)} resend${
                          2 - resendAttempts === 1 ? "" : "s"
                        } left`}
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
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);
