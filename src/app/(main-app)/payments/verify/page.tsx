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

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const response = await apiFetch<{
          status: string;
          message: string;
          data: { orderId: string; orderStatus: string; paymentStatus: string };
        }>(`/buyers/payments/verify?reference=${encodeURIComponent(reference)}`);

        setOrderId(response.data.orderId);
        setStatus("success");
        setMessage(response.message);

        setTimeout(() => {
          router.push(`/buyers-dashboard/orders/${response.data.orderId}`);
        }, 2500);
      } catch (error) {
        setStatus("failed");
        setMessage(error instanceof Error ? error.message : "Payment verification failed.");
      }
    };

    void verify();
  }, [reference, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--gray-bg)">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-(--white) p-12 text-center shadow-sm"
      >
        {status === "loading" && (
          <>
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-(--border-gray) border-t-(--theme-green-dark)" />
            <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">
              Verifying payment...
            </p>
            <p className="text-sm text-(--text-colour)">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={64} className="text-(--theme-green-dark)" />
            <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">
              Payment Confirmed!
            </p>
            <p className="text-sm text-(--text-colour)">{message}</p>
            <p className="text-xs text-(--text-colour)">Redirecting to your order...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle size={64} className="text-(--error-red)" />
            <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">Payment Failed</p>
            <p className="text-sm text-(--text-colour)">{message}</p>
            <button
              onClick={() => router.push("/buyers-dashboard/orders")}
              className="mt-4 rounded-full bg-(--theme-green-dark) px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-(--border-gray) border-t-(--theme-green-dark)" />
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}
