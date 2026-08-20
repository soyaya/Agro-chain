"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function getDashboardPath(): string {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
    if (!raw) return "/farmers-dashboard";
    const user = JSON.parse(raw) as { role?: string; is_cluster_farmer?: boolean };
    if (user.role === "admin") return "/admin-dashboard";
    if (user.is_cluster_farmer || user.role === "cluster") return "/cluster-dashboard";
    if (user.role === "buyer") return "/buyers-dashboard";
    return "/farmers-dashboard";
  } catch {
    return "/farmers-dashboard";
  }
}

export default function VerifyIdentity() {
  const router = useRouter();
  const [bvn, setBvn] = useState<string>("");
  const [creditConsent, setCreditConsent] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [skipped, setSkipped] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (bvn.length !== 11) {
      setErrorMessage("BVN must be exactly 11 digits.");
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

      setSuccess(true);
      if (data?.data?.wallet) {
        toast.success("Verification complete — your wallet is ready!");
      } else if (data?.data?.walletError) {
        toast.success("Verification submitted — wallet setup will finish shortly.");
      } else {
        toast.success("Verification submitted! Redirecting...");
      }
      setTimeout(() => router.push(getDashboardPath()), 2400);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      setVerifying(false);
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    setTimeout(() => router.push(getDashboardPath()), 1800);
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
        <h2 className="text-xl font-semibold">We&apos;re verifying your identity</h2>
        <p className="text-muted-foreground text-sm">This usually takes a few seconds...</p>
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
            onClick={handleVerify}
            disabled={!bvn.trim() || bvn.length !== 11 || verifying}
          >
            Verify
          </SubmitPrimaryButton>
        </div>
      </form>
    </div>
  );
}
