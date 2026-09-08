"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "~/lib/auth-context";
import { getDashboardPath } from "~/lib/dashboard-path";

type Step = "bvn" | "otp";

export default function VerifyIdentity() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("bvn");
  const [bvn, setBvn] = useState<string>("");
  const [creditConsent, setCreditConsent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [skipped, setSkipped] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitBvn = async () => {
    if (bvn.length !== 11) {
      setErrorMessage("BVN must be exactly 11 digits.");
      return;
    }
    if (!creditConsent) {
      setErrorMessage("Please consent to the credit check before continuing.");
      return;
    }
    setVerifying(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bvn, creditConsent }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      if (data?.data?.otpSent) {
        toast.success("OTP sent to your phone.");
        setStep("otp");
      } else {
        toast.error(data.message || "We couldn't send the OTP. Please try again.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (otp.trim().length < 4) {
      setErrorMessage("Enter the OTP sent to your phone.");
      return;
    }
    setVerifying(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setSuccess(true);
      toast.success("Verification complete — your wallet is ready!");
      setTimeout(() => router.push(getDashboardPath(user)), 2400);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OTP verification failed. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      setVerifying(false);
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    setTimeout(() => router.push(getDashboardPath(user)), 1800);
  };

  if (success || skipped) {
    return (
      <div className="space-y-6 py-12 text-center">
        {success ? <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" /> : null}
        <h2 className="text-2xl font-bold">Great job!</h2>
        <p className="text-muted-foreground">
          Your verification is {skipped ? "skipped" : "submitted"}. Let&apos;s head to your
          dashboard!
        </p>
        <p className="text-muted-foreground text-sm">Redirecting in a few seconds...</p>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="space-y-6 py-20 text-center">
        <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
        <h2 className="text-xl font-semibold">
          {step === "bvn" ? "We're verifying your identity" : "Confirming your OTP"}
        </h2>
        <p className="text-muted-foreground text-sm">This usually takes a few seconds...</p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div>
        <form className="default-page-max-width mx-auto flex w-full flex-col gap-(--gap-2xl)">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Enter the OTP sent to your phone</h2>
            <DynamicInput
              label="One-Time Password"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              placeholder="Enter OTP"
            />
          </div>

          {errorMessage && (
            <p className="text-center text-sm text-(--error-red)">{errorMessage}</p>
          )}

          <div className="mt-(--submit-button-mt) grid grid-cols-2 gap-4">
            <SubmitSecondaryButton onClick={handleSubmitBvn} className="h-14 rounded-full">
              Resend OTP
            </SubmitSecondaryButton>
            <SubmitPrimaryButton onClick={handleSubmitOtp} disabled={otp.trim().length < 4 || verifying}>
              Verify
            </SubmitPrimaryButton>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <form className="default-page-max-width mx-auto flex w-full flex-col gap-(--gap-2xl)">
        <div className="flex flex-col gap-4">
          <DynamicInput
            label="Bank Verification Number (BVN)"
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
            maxLength={11}
            placeholder="Enter 11-digit BVN"
          />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={creditConsent}
              onChange={(e) => setCreditConsent(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-(--text-colour) leading-relaxed">
              I consent to a credit check being performed using my BVN data to assess my
              creditworthiness on the AgroChain platform.
            </span>
          </label>
        </div>

        {errorMessage && (
          <p className="text-center text-sm text-(--error-red)">{errorMessage}</p>
        )}

        <div className="mt-(--submit-button-mt) grid grid-cols-2 gap-4">
          <SubmitSecondaryButton onClick={handleSkip} className="h-14 rounded-full">
            Skip for now
          </SubmitSecondaryButton>
          <SubmitPrimaryButton
            onClick={handleSubmitBvn}
            disabled={!bvn.trim() || bvn.length !== 11 || !creditConsent || verifying}
          >
            Verify
          </SubmitPrimaryButton>
        </div>
      </form>
    </div>
  );
}
