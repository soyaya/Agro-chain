"use client";

import { useEffect, useState, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { FullScreenStatusModal } from "~/components/shared/FullScreenStatusModal";
import { NIGERIAN_STATES } from "~/types/constants";
import type { Role } from "~/types/types";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { cn } from "~/lib/utils";

// === Zod Schema
const registerSchema = z
  .object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    phone: z
      .string()
      .min(10, "Phone number is too short")
      .regex(
        /^(0|\+234)[789][01]\d{8}$/,
        "Invalid Nigerian phone number (+234 or 0 prefix)",
      ),
    email: z.string().email("Invalid email address"),
    state: z.string().min(1, "State is required"),
    localGovernment: z.string().min(2, "Local government is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = (searchParams.get("role")?.toLowerCase() || "") as Role;

  const [selectedRole, setSelectedRole] = useState<Role>(urlRole);
  const role = selectedRole;

  const [selectedState, setSelectedState] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendLocked, setResendLocked] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    variant: "loading" | "success";
  }>({
    open: false,
    variant: "loading",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { state: "", localGovernment: "" },
  });

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setValue("state", value, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    setStatusModal({ open: true, variant: "loading" });
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          state: data.state,
          localGovernment: data.localGovernment,
          password: data.password,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      toast.success("Account created! OTP sent to your email.");
      setStatusModal({ open: false, variant: "loading" });
      setStep(2);
      setCooldownSeconds(60);
      setResendAttempts(0);
      setResendLocked(false);
    } catch (error) {
      setStatusModal({ open: false, variant: "loading" });
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = isValid;

  useEffect(() => {
    if (step !== 2 || resendLocked) return;
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, cooldownSeconds, resendLocked]);

  const handleVerifyOtp = async () => {
    if (otp.length < 6 || submitting) return;
    setSubmitting(true);
    setOtpError(null);
    setStatusModal({ open: true, variant: "loading" });

    try {
      const response = await fetch("/api/auth/register/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailAddress: getValues("email"),
          registerOtp: Number(otp),
        }),
        credentials: "include",
      });

      const data = (await response.json()) as {
        message?: string;
        data?: { user?: { role?: string; is_cluster_farmer?: boolean } };
      };

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setStatusModal({ open: true, variant: "success" });
      toast.success("Account verified! Taking you to your dashboard.");

      const role = data.data?.user?.role;
      const dashboardRoute =
        role === "farmer"
          ? "/farmers-dashboard"
          : role === "cluster"
            ? "/cluster-dashboard"
            : role === "buyer"
              ? "/buyers-dashboard"
              : "/login";

      setTimeout(() => {
        router.push(dashboardRoute);
      }, 1800);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "OTP verification failed. Please try again.";
      setOtpError(message);
      setStatusModal({ open: false, variant: "loading" });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (submitting || resendLocked || cooldownSeconds > 0) return;
    if (resendAttempts >= 2) {
      setResendLocked(true);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/auth/register/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress: getValues("email") }),
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
        error instanceof Error
          ? error.message
          : "Failed to resend OTP. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="default-container-max-width flex h-full min-h-full w-full flex-col gap-(--section-gap)">
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="font-ubuntu text-2xl font-bold sm:text-3xl lg:text-4xl">
            Create Account
          </h2>
          {role && (
            <p className="font-roboto-slab text-text-colour text-sm">
              Joining as a{" "}
              <span className="text-theme-green-dark font-semibold capitalize">
                {role}
              </span>
            </p>
          )}
        </div>

        {/* Inline role selector - shown only when no ?role= param */}
        {!urlRole && step === 1 && (
          <div className="default-page-max-width flex flex-col gap-2">
            <label className="font-roboto-slab text-heading-colour text-sm font-medium">
              I am a…
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("farmer")}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedRole === "farmer"
                    ? "border-theme-green-dark bg-green-tint"
                    : "border-input-border hover:bg-gray-bg"
                }`}
              >
                <p className="font-ubuntu text-heading-colour font-semibold">
                  Farmer
                </p>
                <p className="font-roboto-slab text-text-colour text-xs">
                  I grow and sell catfish
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("buyer")}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedRole === "buyer"
                    ? "border-theme-green-dark bg-green-tint"
                    : "border-input-border hover:bg-gray-bg"
                }`}
              >
                <p className="font-ubuntu text-heading-colour font-semibold">
                  Buyer
                </p>
                <p className="font-roboto-slab text-text-colour text-xs">
                  I buy catfish in bulk
                </p>
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onSubmit={handleSubmit(onSubmit)}
              className="default-page-max-width flex w-full flex-col gap-(--gap-lg)"
            >
              <div className="flex w-full flex-col gap-(--gap-base)">
                <DynamicInput
                  label="Full Name"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                  required
                />

                <DynamicInput
                  fieldType="tel"
                  label="Phone Number"
                  error={errors.phone?.message}
                  {...register("phone")}
                  placeholder="08012345678 or +2348012345678"
                  required
                />

                <DynamicInput
                  fieldType="email"
                  label="Email Address"
                  error={errors.email?.message}
                  {...register("email")}
                  required
                />

                <DynamicInput
                  fieldType="password"
                  label="Password"
                  error={errors.password?.message}
                  {...register("password")}
                  required
                />

                <DynamicInput
                  fieldType="password"
                  label="Confirm Password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                  required
                />

                <SelectInput
                  label="State"
                  value={selectedState}
                  onValueChange={handleStateChange}
                  options={NIGERIAN_STATES.map((s) => ({ label: s, value: s }))}
                  error={errors.state?.message}
                  required
                />

                <DynamicInput
                  label="Local Government"
                  error={errors.localGovernment?.message}
                  {...register("localGovernment")}
                  placeholder="Enter your local government area"
                  required
                />
              </div>

              <div className="mx-auto mt-(--submit-button-mt) flex w-full max-w-sm flex-col gap-(--gap-base)">
                {isFormComplete && role ? (
                  <SubmitPrimaryButton loading={submitting} type="submit">
                    Create Account
                  </SubmitPrimaryButton>
                ) : (
                  <SubmitSecondaryButton disabled type="button">
                    Create Account
                  </SubmitSecondaryButton>
                )}
                <p className="text-text-colour text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-(--black) decoration-2 underline-offset-4 hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="default-page-max-width flex flex-col gap-(--section-gap)"
            >
              <p className="font-roboto-slab text-text-colour text-center lg:text-lg">
                Enter the OTP sent to your email
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

                <div className="mt-8 flex w-full flex-col gap-(--gap-base)">
                  <SubmitPrimaryButton
                    onClick={handleVerifyOtp}
                    disabled={otp.length < 6 || submitting}
                    loading={submitting}
                  >
                    Verify OTP
                  </SubmitPrimaryButton>

                  <p className="text-text-colour text-center text-sm">
                    Didn&apos;t receive a code?{" "}
                    <button
                      type="button"
                      className="cursor-pointer font-medium text-(--black) decoration-2 underline-offset-4 hover:underline"
                      onClick={handleResendOtp}
                      disabled={
                        submitting || cooldownSeconds > 0 || resendLocked
                      }
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FullScreenStatusModal
        open={statusModal.open}
        variant={statusModal.variant}
        title={
          statusModal.variant === "loading"
            ? step === 1
              ? "Creating your account..."
              : "Verifying your OTP..."
            : "Account Verified! Redirecting to your dashboard..."
        }
        description={
          statusModal.variant === "success"
            ? "We're preparing your dashboard now."
            : undefined
        }
      />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-full w-full items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
