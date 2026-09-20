export type WalletPaymentStatus = "processing" | "failed" | null | undefined;
export type BasePaymentStatus = "pending" | "paid" | "refunded" | "failed" | string;

interface PaymentStatusBadgeProps {
  paymentStatus: BasePaymentStatus;
  walletPaymentStatus?: WalletPaymentStatus;
  className?: string;
}

/**
 * Order/Demand.payment_status only ever becomes "paid" once AutoRamp confirms
 * completion — a wallet transfer left "processing" (the common case) leaves
 * it sitting at "pending" indefinitely, identical to "never attempted to
 * pay." walletPaymentStatus (from the buyer.service demand/order responses)
 * carries the real in-flight state so this can tell the two apart instead of
 * showing a bare, misleading "Pending".
 */
export function PaymentStatusBadge({ paymentStatus, walletPaymentStatus, className }: PaymentStatusBadgeProps) {
  const state = resolvePaymentDisplayState(paymentStatus, walletPaymentStatus);
  return (
    <div className={className}>
      <span
        className={`font-roboto-slab inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase ${state.badgeClassName}`}
      >
        {state.label}
      </span>
      {state.helperText && (
        <p className="font-roboto-slab mt-1 text-xs text-gray-500">{state.helperText}</p>
      )}
    </div>
  );
}

interface PaymentDisplayState {
  label: string;
  badgeClassName: string;
  helperText?: string;
}

function resolvePaymentDisplayState(
  paymentStatus: BasePaymentStatus,
  walletPaymentStatus: WalletPaymentStatus,
): PaymentDisplayState {
  if (paymentStatus === "paid") {
    return { label: "Paid", badgeClassName: "bg-green-100 text-green-700" };
  }
  if (paymentStatus === "refunded") {
    return { label: "Refunded", badgeClassName: "bg-gray-100 text-gray-600" };
  }
  if (walletPaymentStatus === "processing") {
    return {
      label: "Payment Processing",
      badgeClassName: "bg-blue-100 text-blue-700",
      helperText: "Hang tight — we're confirming this with your bank. No need to pay again.",
    };
  }
  if (walletPaymentStatus === "failed" || paymentStatus === "failed") {
    return {
      label: "Payment Failed",
      badgeClassName: "bg-red-100 text-red-700",
      helperText: "That attempt didn't go through — you can safely try again.",
    };
  }
  return { label: "Not Yet Paid", badgeClassName: "bg-yellow-100 text-yellow-700" };
}

/** Drives whether/how a "Pay" button should render alongside the badge above. */
export function getPayButtonState(
  paymentStatus: BasePaymentStatus,
  walletPaymentStatus: WalletPaymentStatus,
): { show: boolean; label: string } {
  if (paymentStatus === "paid" || paymentStatus === "refunded") return { show: false, label: "" };
  if (walletPaymentStatus === "processing") return { show: false, label: "" };
  if (walletPaymentStatus === "failed") return { show: true, label: "Retry Payment" };
  return { show: true, label: "Pay" };
}
