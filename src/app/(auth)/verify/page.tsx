"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

type VerifyState = "form" | "verifying" | "done";

export default function VerifyIdentity() {
  const router = useRouter();
  const [bvn, setBvn] = useState<string>("");
  const [creditConsent, setCreditConsent] = useState<boolean>(false);
  const [verifyState, setVerifyState] = useState<VerifyState>("form");
  const [doneMessage, setDoneMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (bvn.length !== 11) {
      setErrorMessage("BVN must be exactly 11 digits.");
      return;
    }
    setErrorMessage(null);
    setVerifyState("verifying");
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

      setDoneMessage("Verification submitted!");
      setVerifyState("done");
      toast.success("Verification submitted! Redirecting...");
      setTimeout(() => router.push(getDashboardPath()), 2400);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed. Please try again.";
      setErrorMessage(message);
      setVerifyState("form");
      toast.error(message);
    }
  };

  const handleSkip = () => {
    setDoneMessage("Skipped.");
    setVerifyState("done");
    setTimeout(() => router.push(getDashboardPath()), 1800);
  };

  const slideVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <AnimatePresence mode="wait">
      {verifyState === "verifying" && (
        <motion.div
          key="verifying"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="space-y-6 py-20 text-center"
        >
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-theme-green-dark" />
          <h2 className="font-ubuntu text-xl font-semibold text-heading-colour">
            We&apos;re verifying your identity
          </h2>
          <p className="font-roboto-slab text-sm text-text-colour">
            This usually takes a few seconds...
          </p>
        </motion.div>
      )}

      {verifyState === "done" && (
        <motion.div
          key="done"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="space-y-6 py-12 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          >
            <CheckCircle2 className="mx-auto h-16 w-16 text-theme-green-dark" />
          </motion.div>
          <h2 className="font-ubuntu text-2xl font-bold text-heading-colour">Great job!</h2>
          <p className="font-roboto-slab text-text-colour">{doneMessage} Let&apos;s head to your dashboard!</p>
          <p className="font-roboto-slab text-sm text-text-colour">Redirecting in a few seconds...</p>
        </motion.div>
      )}

      {verifyState === "form" && (
        <motion.div
          key="form"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <form className="default-page-max-width mx-auto flex w-full flex-col gap-(--gap-2xl)">
            <div className="flex flex-col gap-4">
              <DynamicInput
                label="Bank Verification Number (BVN)"
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                maxLength={11}
                placeholder="Enter 11-digit BVN"
              />

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={creditConsent}
                  onChange={(e) => setCreditConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                />
                <span className="font-roboto-slab text-sm leading-relaxed text-text-colour">
                  I consent to a credit check being performed using my BVN data to assess my
                  creditworthiness on the Agro-chain platform.
                </span>
              </label>
            </div>

            {errorMessage && (
              <p className="text-center text-sm text-error-red">{errorMessage}</p>
            )}

            <div className="mt-(--submit-button-mt) grid grid-cols-2 gap-4">
              <SubmitSecondaryButton onClick={handleSkip} className="h-14 rounded-full">
                Skip for now
              </SubmitSecondaryButton>
              <SubmitPrimaryButton
                onClick={handleVerify}
                disabled={!bvn.trim() || bvn.length !== 11}
              >
                Verify
              </SubmitPrimaryButton>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
