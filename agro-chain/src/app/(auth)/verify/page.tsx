"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyIdentity() {
  const router = useRouter();
  const [bvn, setBvn] = useState<string>("");
  const [creditCheck, setCreditCheck] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [skipped, setSkipped] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bvn, creditConsent: creditCheck === "true" || creditCheck === "on" }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setSuccess(true);
      toast.success("Verification successful!");
      setTimeout(() => router.push("/dashboard"), 2400);
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
    setTimeout(() => router.push("/dashboard"), 1800);
  };

  if (success || skipped) {
    return (
      <div className="space-y-6 py-12 text-center">
        {success ? <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" /> : null}
        <h2 className="text-2xl font-bold">Great job!</h2>
        <p className="text-muted-foreground">
          Your verification is {skipped ? "skipped" : "successful"}. Let&apos;s head to your
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
        <div className="flex flex-col gap-2">
          <DynamicInput
            label="Bank Verification Number (BVN)"
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
            maxLength={11}
            placeholder="Enter 11-digit BVN"
          />
          {/* This Should be a Checkbox */}
          {/* <DynamicInput
            label="Credit Check Consent"
            value={creditCheck}
            onChange={(e) => setCreditCheck(e.target.value)}
            placeholder="e.g. I consent to credit check"
          /> */}
          <DynamicInput
            label="Credit Check Consent (type YES to consent)"
            value={creditCheck}
            onChange={(e) => setCreditCheck(e.target.value)}
            placeholder="YES"
          />
        </div>
        {errorMessage && (
          <p className="text-center text-sm text-(--error-red)">{errorMessage}</p>
        )}

        <div className="mt-(--submit-button-mt) grid grid-cols-2 gap-4">
          <SubmitSecondaryButton  onClick={handleSkip} className="h-14 rounded-full">
            Skip for now
          </SubmitSecondaryButton>
          <SubmitPrimaryButton onClick={handleVerify} disabled={!bvn.trim() || verifying}>
            Verify
          </SubmitPrimaryButton>
        </div>
      </form>
    </div>
  );
}
