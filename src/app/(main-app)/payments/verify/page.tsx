"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { apiFetch } from "~/lib/api";

type VerifyStatus = "loading" | "success" | "failed";

function PaymentVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<VerifyStatus>(() =>
    reference ? "loading" : "failed",
  );
  const [message, setMessage] = useState(() =>
    reference ? "" : "No payment reference found.",
  );
  useEffect(() => {
    if (!reference) return;

    const verify = async () => {
      try {
        const response = await apiFetch<{
          status: string;
          message: string;
          data: { orderId: string; orderStatus: string; paymentStatus: string };
        }>(
          `/buyers/payments/verify?reference=${encodeURIComponent(reference)}`,
        );

        setStatus("success");
        setMessage(response.message);

        setTimeout(() => {
          router.push(`/buyers-dashboard/orders/${response.data.orderId}`);
        }, 2500);
      } catch (error) {
        setStatus("failed");
        setMessage(
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
        );
      }
    };

    void verify();
  }, [reference, router]);

  return (
    <div className="bg-gray-bg flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-(--white) p-12 text-center shadow-sm"
      >
        {status === "loading" && (
          <>
            <div className="border-gray-border border-t-theme-green-dark h-16 w-16 animate-spin rounded-full border-4" />
            <p className="font-ubuntu text-heading-colour text-xl font-bold">
              Verifying payment...
            </p>
            <p className="text-text-colour text-sm">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={64} className="text-theme-green-dark" />
            <p className="font-ubuntu text-heading-colour text-xl font-bold">
              Payment Confirmed!
            </p>
            <p className="text-text-colour text-sm">{message}</p>
            <p className="text-text-colour text-xs">
              Redirecting to your order...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle size={64} className="text-error-red" />
            <p className="font-ubuntu text-heading-colour text-xl font-bold">
              Payment Failed
            </p>
            <p className="text-text-colour text-sm">{message}</p>
            <button
              onClick={() => router.push("/buyers-dashboard/orders")}
              className="bg-theme-green-dark mt-4 rounded-full px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              View My Orders
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-gray-border border-t-theme-green-dark h-12 w-12 animate-spin rounded-full border-4" />
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}
