"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

type Step = "bvn" | "otp";

interface BvnVerifyModalProps {
  onVerified: () => void;
  onClose: () => void;
}

/**
 * Same BVN → OTP flow as /verify/page.tsx, but inline on checkout — a buyer
 * who hits the "no wallet yet" gate here shouldn't be bounced to a separate
 * page with no way back to what they were doing.
 */
export function BvnVerifyModal({ onVerified, onClose }: BvnVerifyModalProps) {
  const [step, setStep] = useState<Step>("bvn");
  const [bvn, setBvn] = useState("");
  const [creditConsent, setCreditConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bvn, creditConsent }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Verification failed");

      if (data?.data?.otpSent) {
        toast.success("OTP sent to your phone.");
        setStep("otp");
      } else {
        setErrorMessage(data.message || "We couldn't send the OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (otp.trim().length < 4) {
      setErrorMessage("Enter the OTP sent to your phone.");
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "OTP verification failed");

      toast.success("Verification complete — your wallet is ready!");
      onVerified();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "OTP verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-(--white) p-(--space-xl) shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-(--text-colour) hover:bg-(--gray-bg)"
        >
          <X size={18} />
        </button>

        <h2 className="font-ubuntu text-xl font-bold text-(--heading-colour)">
          {step === "bvn" ? "Verify your BVN to pay by transfer" : "Enter the OTP sent to your phone"}
        </h2>
        <p className="mt-1 text-sm text-(--text-colour)">
          {step === "bvn"
            ? "This sets up your wallet's transfer account — it only takes a minute, and you'll come right back here."
            : "Check your phone for the one-time code."}
        </p>

        {step === "bvn" ? (
          <div className="mt-6 flex flex-col gap-4">
            <input
              value={bvn}
              onChange={(e) => {
                setBvn(e.target.value.replace(/\D/g, "").slice(0, 11));
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter 11-digit BVN"
              inputMode="numeric"
              className="h-12 rounded-xl border border-(--border-input) px-4 text-sm outline-none focus:border-(--theme-green-dark)"
            />
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={creditConsent}
                onChange={(e) => setCreditConsent(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm leading-relaxed text-(--text-colour)">
                I consent to a credit check being performed using my BVN data to assess my
                creditworthiness on the AgroChain platform.
              </span>
            </label>

            {errorMessage && <p className="text-sm text-(--error-red)">{errorMessage}</p>}

            <button
              type="button"
              onClick={handleSubmitBvn}
              disabled={submitting || !bvn || bvn.length !== 11 || !creditConsent}
              className="flex h-12 items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : "Verify BVN"}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <input
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter OTP"
              inputMode="numeric"
              className="h-12 rounded-xl border border-(--border-input) px-4 text-sm outline-none focus:border-(--theme-green-dark)"
            />

            {errorMessage && <p className="text-sm text-(--error-red)">{errorMessage}</p>}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSubmitBvn}
                disabled={submitting}
                className="flex h-12 items-center justify-center rounded-full border border-(--border-gray) text-sm font-semibold text-(--text-colour) transition hover:bg-(--gray-bg) disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={handleSubmitOtp}
                disabled={submitting || otp.trim().length < 4}
                className="flex h-12 items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
