"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Package, Truck, Copy, Loader2 } from "lucide-react";
import { useCart } from "~/components/marketplace/useCart";
import { isSeedlingFishType } from "~/types/constants";
import { apiFetch } from "~/lib/api";
import { buyerService } from "~/lib/services/buyer.service";
import { walletService } from "~/lib/services/wallet.service";
import { BvnVerifyModal } from "~/components/marketplace/BvnVerifyModal";

type WalletGateState = "checking" | "needs-verification" | "ready";

// How long to auto-poll for the inbound transfer before falling back to a
// manual "Check again" button — the Pulse webhook is usually near-instant,
// but bank rails occasionally lag.
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

interface PendingPayment {
  orderId: string;
  grandTotal: number;
  amountToTransfer: number;
  transferFee: number;
}

interface TransferTarget {
  accountNumber: string;
  accountName: string | null;
  bankName: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [walletGate, setWalletGate] = useState<WalletGateState>("checking");
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [transferTarget, setTransferTarget] = useState<TransferTarget | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const pollStartedAt = useRef<number | null>(null);
  // Delivery is one consolidated trip for the whole order, not a per-item
  // choice — the buyer picks pickup or delivery once, and the price scales
  // with the order's total weight.
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  // Admin-configured, weight-tiered fee, fetched fresh so what the buyer sees
  // here always matches what the backend actually charges at checkout (it
  // recomputes this server-side and ignores any client-supplied value).
  const [realDeliveryFee, setRealDeliveryFee] = useState<number | null>(null);
  const [deliveryFeeError, setDeliveryFeeError] = useState(false);

  const totalWeightKg = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.weightKg, 0),
    [cart.items],
  );

  useEffect(() => {
    if (deliveryType !== "delivery") {
      setRealDeliveryFee(null);
      setDeliveryFeeError(false);
      return;
    }
    let mounted = true;
    setDeliveryFeeError(false);
    const firstListingId = cart.items[0]?.listingId;
    const params = new URLSearchParams({ totalWeightKg: String(totalWeightKg) });
    if (firstListingId) params.set("listingId", firstListingId);
    apiFetch<{ data: { deliveryFee: number } }>(`/marketplace/delivery-fee?${params.toString()}`)
      .then((res) => {
        if (mounted) setRealDeliveryFee(res.data.deliveryFee);
      })
      .catch(() => {
        // The real charge is still computed correctly server-side at
        // checkout — but showing a silent ₦0 here would be misleading, so
        // surface that the preview couldn't be confirmed instead.
        if (mounted) setDeliveryFeeError(true);
      });
    return () => {
      mounted = false;
    };
  }, [deliveryType, totalWeightKg, cart.items]);

  const deliveryFee = deliveryType === "delivery" ? (realDeliveryFee ?? 0) : 0;
  const deliveryFeeUnconfirmed = deliveryType === "delivery" && (deliveryFeeError || realDeliveryFee === null);
  const totalAmount = cart.subtotal + deliveryFee;

  const checkWallet = useCallback(() => {
    let cancelled = false;
    walletService
      .getWallet()
      .then((res) => {
        if (cancelled) return;
        setWalletGate("ready");
        setTransferTarget({
          accountNumber: res.data.accountNumber ?? "",
          accountName: res.data.accountName,
          bankName: res.data.bankName,
        });
      })
      .catch(() => {
        if (!cancelled) setWalletGate("needs-verification");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => checkWallet(), [checkWallet]);

  const handleBvnVerified = () => {
    setShowBvnModal(false);
    setWalletGate("checking");
    checkWallet();
  };

  const [showBvnModal, setShowBvnModal] = useState(false);
  // Open the moment the gate resolves to "needs-verification" — no extra
  // click needed to find out what to do next.
  useEffect(() => {
    if (walletGate === "needs-verification") setShowBvnModal(true);
  }, [walletGate]);

  const completePayment = useCallback(
    async (orderId: string) => {
      try {
        const paymentResponse = await buyerService.payOrderWithWallet(orderId);
        toast.success(
          paymentResponse.data.status === "completed"
            ? "Payment successful!"
            : "Payment is processing — you'll be notified once it's confirmed.",
        );
      } catch (paymentError) {
        const message =
          paymentError instanceof Error ? paymentError.message : "Failed to confirm payment";
        toast.error(`${message}. You can retry payment from your order.`);
      }
      router.push(`/buyers-dashboard/orders/${orderId}`);
    },
    [router],
  );

  // Poll the buyer's wallet balance while a transfer is pending, and complete
  // the order the moment enough has landed — no manual "I've paid" click.
  useEffect(() => {
    if (!pendingPayment || !polling) return;
    pollStartedAt.current ??= Date.now();

    let cancelled = false;
    const tick = async () => {
      try {
        const res = await walletService.getWallet();
        if (cancelled) return;
        if (res.data.balance >= pendingPayment.grandTotal) {
          setPolling(false);
          await completePayment(pendingPayment.orderId);
          return;
        }
      } catch {
        // Transient — just try again on the next tick.
      }
      if (Date.now() - (pollStartedAt.current ?? Date.now()) >= POLL_TIMEOUT_MS) {
        setPolling(false);
        setPollTimedOut(true);
        return;
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };
    let timer = setTimeout(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pendingPayment, polling, completePayment]);

  const handleCheckAgain = () => {
    setPollTimedOut(false);
    setPolling(true);
    pollStartedAt.current = Date.now();
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (deliveryType === "delivery") {
      if (!deliveryAddress.trim()) {
        setAddressError("Delivery address is required.");
        toast.error("Please provide a delivery address");
        return;
      }
      if (deliveryAddress.trim().length < 10) {
        setAddressError("Please provide a more specific delivery address.");
        toast.error("Delivery address looks too short");
        return;
      }
    }
    setAddressError(null);

    setSubmitting(true);
    try {
      const checkoutResponse = await apiFetch<{
        data: {
          order: { id: string; grand_total: number };
          transferFee: number;
          amountToTransfer: number;
        };
      }>("/marketplace/checkout", {
        method: "POST",
        body: JSON.stringify({
          deliveryType,
          deliveryAddress: deliveryType === "delivery" ? deliveryAddress : undefined,
          // deliveryFee is computed server-side from admin settings — not sent.
          cartItems: cart.items.map((item) => ({
            cartItemId: item.cartItemId ?? `${item.listingId}-${item.weightKg}-${item.variant}`,
            quantity: item.quantity,
          })),
          // The backend's `totalAmount` field is the pre-delivery subtotal —
          // it adds deliveryFee itself for grand_total. Sending the
          // fee-inclusive `totalAmount` here double-counts delivery.
          totalAmount: cart.subtotal,
        }),
      });

      const { order, transferFee, amountToTransfer } = checkoutResponse.data;
      cart.clearCart();

      // Try paying from whatever balance the buyer already has first — if
      // that succeeds there's no transfer to wait on at all.
      try {
        const paymentResponse = await buyerService.payOrderWithWallet(order.id);
        toast.success(
          paymentResponse.data.status === "completed"
            ? "Payment successful!"
            : "Payment is processing — you'll be notified once it's confirmed.",
        );
        router.push(`/buyers-dashboard/orders/${order.id}`);
        return;
      } catch {
        // Not enough balance yet — fall through to the transfer-and-wait flow.
      }

      setPendingPayment({
        orderId: order.id,
        grandTotal: Number(order.grand_total),
        amountToTransfer,
        transferFee,
      });
      setPolling(true);
      pollStartedAt.current = Date.now();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyAccountNumber = () => {
    if (!transferTarget?.accountNumber) return;
    void navigator.clipboard.writeText(transferTarget.accountNumber).then(() => {
      toast.success("Account number copied");
    });
  };

  if (pendingPayment) {
    return (
      <div className="min-h-screen bg-(--gray-bg)">
        <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg rounded-3xl bg-(--white) p-(--space-xl) shadow-sm"
          >
            <h1 className="font-ubuntu text-2xl font-bold text-(--heading-colour)">
              Complete your payment
            </h1>
            <p className="mt-1 text-sm text-(--text-colour)">
              Transfer the exact amount below to the account shown — your order completes
              automatically as soon as it lands.
            </p>

            <div className="mt-6 rounded-2xl border border-(--border-gray) p-4">
              <p className="text-xs text-(--text-colour)">Transfer to</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                  {transferTarget?.accountNumber || "—"}
                </p>
                <button
                  type="button"
                  onClick={handleCopyAccountNumber}
                  className="text-(--theme-green-dark)"
                  aria-label="Copy account number"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-sm text-(--text-colour)">
                {transferTarget?.accountName} {transferTarget?.bankName ? `• ${transferTarget.bankName}` : ""}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-green-50 p-4">
              <p className="text-xs text-(--text-colour)">Amount to transfer</p>
              <p className="font-ubuntu text-2xl font-bold text-(--theme-green-dark)">
                ₦{pendingPayment.amountToTransfer.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-(--text-colour)">
                Includes a ₦{pendingPayment.transferFee.toLocaleString()} transfer fee — send this
                exact amount, not just the order total, so the full ₦
                {pendingPayment.grandTotal.toLocaleString()} lands in your wallet.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-(--text-colour)">
              {polling ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Waiting for your transfer to arrive...
                </>
              ) : pollTimedOut ? (
                <span className="text-amber-600">
                  Still haven&apos;t seen it land — sent it already? Check again below.
                </span>
              ) : null}
            </div>

            {pollTimedOut && (
              <button
                type="button"
                onClick={handleCheckAgain}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90"
              >
                Check again
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push(`/buyers-dashboard/orders/${pendingPayment.orderId}`)}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-(--border-gray) text-sm font-semibold text-(--text-colour) transition hover:bg-(--gray-bg)"
            >
              View order instead
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--gray-bg)">
      <div className="container-max-width px-(--section-px) py-(--section-py) sm:px-(--section-px-sm) sm:py-(--section-py-sm) lg:px-(--section-px-lg) lg:py-(--section-py-lg)">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-(--gap-lg) lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-(--white) p-(--space-xl) shadow-sm">
              <h1 className="font-ubuntu text-2xl font-bold text-(--heading-colour)">
                Checkout
              </h1>
              <p className="mt-1 text-sm text-(--text-colour)">
                Review your cart and confirm delivery options.
              </p>

              {walletGate === "needs-verification" && (
                <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-(--heading-colour)">
                    Verify your BVN to pay by transfer
                  </p>
                  <p className="mt-1 text-xs text-(--text-colour)">
                    You&apos;ll need a verified wallet before you can pay — it only takes a
                    minute, and you&apos;ll come right back here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowBvnModal(true)}
                    className="mt-3 h-10 rounded-full bg-(--theme-green-dark) px-4 text-xs font-semibold text-white"
                  >
                    Verify now
                  </button>
                </div>
              )}

              {showBvnModal && (
                <BvnVerifyModal
                  onVerified={handleBvnVerified}
                  onClose={() => setShowBvnModal(false)}
                />
              )}

              <div className="mt-6 flex flex-col gap-4">
                {cart.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-(--border-gray) p-6 text-center text-sm text-(--text-colour)">
                    Your cart is empty.
                  </div>
                ) : (
                  cart.items.map((item, index) => (
                    <div
                      key={`${item.listingId ?? item.feedListingId}-${item.weightKg}-${item.variant}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-(--border-gray) p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-roboto-slab font-semibold text-(--heading-colour)">
                            {item.itemType === "feed" ? item.brandName : `${item.fishType} • ${item.variant}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.itemType === "feed"
                              ? `${item.quantity} bag${item.quantity === 1 ? "" : "s"}`
                              : `${item.processed ? "Processed" : "Unprocessed"} • ${
                                  item.fishType && isSeedlingFishType(item.fishType)
                                    ? `${item.weightKg} piece`
                                    : `${item.weightKg}kg`
                                } pack`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-(--heading-colour)">
                          ₦{Number(item.totalPrice).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span>
                          ₦{Number(item.pricePerUnit).toLocaleString()} {item.itemType === "feed" ? "per bag" : "per pack"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8">
                <h2 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                  Delivery
                </h2>
                <p className="mt-1 text-xs text-(--text-colour)">
                  One delivery covers your whole order — the fee scales with total weight
                  ({totalWeightKg}kg).
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                      deliveryType === "pickup"
                        ? "border-(--theme-green-dark) bg-green-50 text-(--theme-green-dark)"
                        : "border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                    }`}
                  >
                    <Package size={14} />
                    Pickup
                  </button>
                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                      deliveryType === "delivery"
                        ? "border-(--theme-green-dark) bg-green-50 text-(--theme-green-dark)"
                        : "border-(--border-gray) text-(--text-colour) hover:bg-(--gray-bg)"
                    }`}
                  >
                    <Truck size={14} />
                    Delivery
                  </button>
                </div>

                {deliveryType === "delivery" && (
                  <div className="mt-4">
                    <label
                      htmlFor="delivery-address"
                      className="text-sm font-medium text-(--heading-colour)"
                    >
                      Delivery Address
                    </label>
                    <textarea
                      id="delivery-address"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (addressError) setAddressError(null);
                      }}
                      className={`mt-2 h-24 w-full rounded-2xl border p-4 text-sm text-(--text-colour) outline-none transition ${
                        addressError
                          ? "border-red-400 focus:border-red-500"
                          : "border-(--border-input) focus:border-(--theme-green-dark)"
                      }`}
                      placeholder="Enter delivery address"
                    />
                    {addressError && (
                      <p className="mt-2 text-xs text-red-500">{addressError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-3xl bg-(--white) p-(--space-xl) shadow-sm">
              <h2 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                Order Summary
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-(--text-colour)">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-(--heading-colour)">
                    ₦{cart.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-(--heading-colour)">
                    {deliveryFeeUnconfirmed ? "Calculating..." : `₦${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                {deliveryFeeError && (
                  <p className="text-xs text-amber-600">
                    Couldn&apos;t confirm the exact delivery fee — it will be calculated correctly
                    when you place the order, and may differ from ₦{deliveryFee.toLocaleString()}.
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-(--border-gray) pt-3">
                  <span className="font-ubuntu text-base font-bold text-(--heading-colour)">
                    Total
                  </span>
                  <span className="font-ubuntu text-base font-bold text-(--theme-green-dark)">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || walletGate !== "ready"}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : walletGate === "checking"
                    ? "Checking wallet..."
                    : walletGate === "needs-verification"
                      ? "Verify BVN to continue"
                      : "Place Order"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
