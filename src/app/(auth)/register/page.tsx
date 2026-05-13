"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { FullScreenStatusModal } from "~/components/shared/FullScreenStatusModal";
import { kadunaLga } from "~/models/models";
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
      .regex(/^(0|\+234)[789][01]\d{8}$/, "Invalid Nigerian phone number (+234 or 0 prefix)"),
    email: z.string().email("Invalid email address"),
    location: z.string().min(2, "Location is required").optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

type Role = "farmer" | "buyer";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role")?.toLowerCase() || "") as Role;

  const [isLga, setSelectedLga] = useState<string>("off");
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
    defaultValues: { location: "" },
  });

  // Sync LGA selection with form location field
  const handleLgaChange = (value: string) => {
    setSelectedLga(value);
    setValue("location", value, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    setStatusModal({ open: true, variant: "loading" });
    try {
      // Set the role cookie on the backend before registering
      await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          location: data.location,
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
        error instanceof Error ? error.message : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = isValid && isLga !== "off";

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
        body: JSON.stringify({ emailAddress: getValues("email"), registerOtp: Number(otp) }),
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
        error instanceof Error ? error.message : "OTP verification failed. Please try again.";
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
        error instanceof Error ? error.message : "Failed to resend OTP. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="default-container-max-width flex h-full min-h-full w-full flex-col gap-(--section-gap)">
        <h2 className="font-ubuntu text-center text-2xl font-bold sm:text-3xl lg:text-4xl">
          Create Account {role}
        </h2>

        {step === 1 ? (
          <form
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
                label="Location"
                value={isLga}
                onValueChange={handleLgaChange}
                options={kadunaLga}
                required
              />
            </div>

            <div className="mx-auto mt-(--submit-button-mt) flex w-full max-w-sm flex-col">
              {isFormComplete ? (
                <SubmitPrimaryButton loading={submitting} type="submit">
                  Create Account
                </SubmitPrimaryButton>
              ) : (
                <SubmitSecondaryButton disabled type="button">
                  Create Account
                </SubmitSecondaryButton>
              )}
            </div>
          </form>
        ) : (
          <div className="default-page-max-width flex flex-col gap-(--section-gap)">
            <p className="font-roboto-slab text-center text-(--text-colour) lg:text-lg">
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
                <p className="text-destructive text-center text-sm font-medium">{otpError}</p>
              )}

              <div className="mt-8 flex w-full flex-col gap-(--gap-base)">
                <SubmitPrimaryButton
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6 || submitting}
                  loading={submitting}
                >
                  Verify OTP
                </SubmitPrimaryButton>

                <p className="text-center text-sm text-(--text-colour)">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    className="cursor-pointer font-medium text-(--black) decoration-2 underline-offset-4 hover:underline"
                    onClick={handleResendOtp}
                    disabled={submitting || cooldownSeconds > 0 || resendLocked}
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
          statusModal.variant === "success" ? "We're preparing your dashboard now." : undefined
        }
      />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-full w-full items-center justify-center">Loading...</div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
