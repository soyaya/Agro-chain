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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import Link from "next/link";
import { cn } from "~/lib/utils";

//=== Step 1 Schema
const phoneSchema = z.object({
  phone: z
    .string()
    .regex(
      /^(0|\+234)[789][01]\d{8}$/,
      "Please enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)",
    ),
});

type PhoneForm = z.infer<typeof phoneSchema>;

//=== Main Component
export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
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
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: { phone: "" },
  });

  // === Step 1: Send OTP
  const onSendOtp = async (data: PhoneForm) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Real API call → /api/auth/send-otp
      console.log("Sending OTP to:", data.phone);
      await new Promise((r) => setTimeout(r, 1400)); // simulate network

      toast.success(`OTP sent to ${data.phone}`);
      setPhoneNumber(data.phone);
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP. Please try again.");
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
      console.log(`Verifying OTP: ${otp} for phone: ${phoneNumber}`);
      await new Promise((r) => setTimeout(r, 1600));

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone: phoneNumber, otp }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      const roleFromBackend = data.role as "Farmer" | "Buyer" | "Cluster Farmer";

      setSuccess(true);
      setStatusModal({ open: true, variant: "success" });

      localStorage.setItem(
        "currentUser",
        JSON.stringify({ phone: phoneNumber, role: roleFromBackend }),
      );

      toast.success("Login successful!");

      const isCluster = data.isClusterFarmer === true || roleFromBackend === "Cluster Farmer" || data.role === "Farmer & Cluster";
      
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
  }, [loading, success, otp, phoneNumber, router]);

  //===Auto-submit OTP when 6 digits entered
  useEffect(() => {
    if (step === 2 && otp.length === 4 && !loading && !success) {
      void handleVerify();
    }
  }, [otp, step, loading, success, handleVerify]);

  const hasOtpError = !!error;

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
                Enter your phone number to receive a verification code
              </p>

              <DynamicInput
                fieldType="tel"
                label="Phone Number"
                placeholder="08012345678"
                error={errors.phone?.message}
                {...register("phone")}
                required
                disabled={loading}
              />

              <div className="mt-16 flex w-full flex-col gap-(--gap-base)">
                <SubmitPrimaryButton loading={loading} disabled={!isValid || loading} type="submit">
                  Send OTP
                </SubmitPrimaryButton>

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
                Enter the OTP sent to the provided number
              </p>

              <div className="flex flex-col items-center gap-6">
                <InputOTP
                  maxLength={4}
                  value={otp}
                  onChange={setOtp}
                  containerClassName={cn("gap-3", hasOtpError && "animate-shake")}
                >
                  <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} aria-invalid={hasOtpError} />
                    <InputOTPSlot index={1} aria-invalid={hasOtpError} />
                  </InputOTPGroup>

                  <InputOTPGroup className="py-(--space-lg) *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={2} aria-invalid={hasOtpError} />
                    <InputOTPSlot index={3} aria-invalid={hasOtpError} />
                  </InputOTPGroup>
                </InputOTP>

                {error && (
                  <p className="text-destructive text-center text-sm font-medium">{error}</p>
                )}

                <div className="mt-16 flex w-full flex-col gap-(--gap-base)">
                  <SubmitPrimaryButton
                    onClick={handleVerify}
                    disabled={otp.length < 6 || loading || success}
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
                      onClick={() => setStep(1)}
                      disabled={loading || success}
                    >
                      Send again
                    </button>
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
