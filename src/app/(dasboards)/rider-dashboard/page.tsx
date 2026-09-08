"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Phone, Camera, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { riderService, type RiderOrder, type RiderDemand } from "~/lib/services/rider.service";
import { uploadFile } from "~/lib/upload";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";
import { useAuth } from "~/lib/auth-context";

const FULFILLMENT_STAGE_LABELS: Record<string, string> = {
  escalated_to_rider: "Awaiting pickup",
  out_for_delivery: "Out for delivery",
  delivered_awaiting_confirmation: "Delivered — awaiting buyer confirmation",
  completed: "Completed",
};

// Orders and demands run through the identical delivery protocol — normalize
// both into one shape so a single set of UI/handlers can drive either.
interface DeliveryItem {
  key: string;
  id: string;
  type: "order" | "demand";
  title: string;
  buyerName: string;
  deliveryAddress: string;
  fulfillmentStage: string;
  deliveryOtpVerifiedAt: string | null;
}

interface ItemUiState {
  otpSent: boolean;
  otpInput: string;
  arrivalOtpSent: boolean;
  arrivalOtpInput: string;
  pickupFile: File | null;
  handoffFile: File | null;
  submitting: boolean;
}

const defaultUiState: ItemUiState = {
  otpSent: false,
  otpInput: "",
  arrivalOtpSent: false,
  arrivalOtpInput: "",
  pickupFile: null,
  handoffFile: null,
  submitting: false,
};

export default function RiderDashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uiState, setUiState] = useState<Record<string, ItemUiState>>({});

  const load = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [ordersRes, demandsRes] = await Promise.all([riderService.getOrders(), riderService.getDemands()]);
      const orderItems: DeliveryItem[] = (ordersRes.data.orders ?? []).map((o: RiderOrder) => ({
        key: `order:${o.orderId}`,
        id: o.orderId,
        type: "order",
        title: `Order #${o.orderNumber}`,
        buyerName: o.buyerName,
        deliveryAddress: o.deliveryAddress,
        fulfillmentStage: o.fulfillmentStage,
        deliveryOtpVerifiedAt: o.deliveryOtpVerifiedAt,
      }));
      const demandItems: DeliveryItem[] = (demandsRes.data.demands ?? []).map((d: RiderDemand) => ({
        key: `demand:${d.demandId}`,
        id: d.demandId,
        type: "demand",
        title: "Demand Delivery",
        buyerName: d.buyerName,
        deliveryAddress: d.deliveryAddress,
        fulfillmentStage: d.fulfillmentStage,
        deliveryOtpVerifiedAt: d.deliveryOtpVerifiedAt,
      }));
      setItems([...orderItems, ...demandItems]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getUi = (key: string): ItemUiState => uiState[key] ?? defaultUiState;
  const patchUi = (key: string, patch: Partial<ItemUiState>) => {
    setUiState((prev) => ({ ...prev, [key]: { ...getUi(key), ...patch } }));
  };

  const handleSendPhoneOtp = async (item: DeliveryItem) => {
    patchUi(item.key, { submitting: true });
    try {
      if (item.type === "order") await riderService.sendPhoneOtp(item.id);
      else await riderService.sendDemandPhoneOtp(item.id);
      patchUi(item.key, { otpSent: true, submitting: false });
      toast.success("OTP sent to buyer's phone.");
    } catch (error) {
      patchUi(item.key, { submitting: false });
      toast.error(error instanceof Error ? error.message : "Failed to send OTP");
    }
  };

  const handleStartDelivery = async (item: DeliveryItem) => {
    const ui = getUi(item.key);
    if (!ui.otpInput.trim()) return toast.error("Enter the OTP the buyer read out to you.");
    if (!ui.pickupFile) return toast.error("Take a photo of the product before moving it.");
    patchUi(item.key, { submitting: true });
    try {
      const photoUrl = await uploadFile(ui.pickupFile);
      if (item.type === "order") await riderService.startDelivery(item.id, ui.otpInput.trim(), photoUrl);
      else await riderService.startDemandDelivery(item.id, ui.otpInput.trim(), photoUrl);
      toast.success("Delivery started.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start delivery");
    } finally {
      patchUi(item.key, { submitting: false });
    }
  };

  const handleSendArrivalOtp = async (item: DeliveryItem) => {
    patchUi(item.key, { submitting: true });
    try {
      if (item.type === "order") await riderService.sendArrivalOtp(item.id);
      else await riderService.sendDemandArrivalOtp(item.id);
      patchUi(item.key, { arrivalOtpSent: true, submitting: false });
      toast.success("Arrival OTP sent to buyer's phone.");
    } catch (error) {
      patchUi(item.key, { submitting: false });
      toast.error(error instanceof Error ? error.message : "Failed to send arrival OTP");
    }
  };

  const handleVerifyArrivalOtp = async (item: DeliveryItem) => {
    const ui = getUi(item.key);
    if (!ui.arrivalOtpInput.trim()) return toast.error("Enter the OTP the buyer read out to you.");
    patchUi(item.key, { submitting: true });
    try {
      if (item.type === "order") await riderService.verifyArrivalOtp(item.id, ui.arrivalOtpInput.trim());
      else await riderService.verifyDemandArrivalOtp(item.id, ui.arrivalOtpInput.trim());
      toast.success("Buyer identity confirmed.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      patchUi(item.key, { submitting: false });
    }
  };

  const handleCompleteHandoff = async (item: DeliveryItem) => {
    const ui = getUi(item.key);
    if (!ui.handoffFile) return toast.error("Take a photo of the product at handoff.");
    patchUi(item.key, { submitting: true });
    try {
      const photoUrl = await uploadFile(ui.handoffFile);
      if (item.type === "order") await riderService.completeHandoff(item.id, photoUrl);
      else await riderService.completeDemandHandoff(item.id, photoUrl);
      toast.success("Handoff completed. Awaiting buyer confirmation.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete handoff");
    } finally {
      patchUi(item.key, { submitting: false });
    }
  };

  if (loading) return <LoadingState message="Loading your deliveries..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={Truck}
        title="Unable to load deliveries"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => void load()}
        size="lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">My Deliveries</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Orders and demands escalated to you for delivery. Work through each step in order —
          verify the buyer's phone, pick up the product, confirm identity on arrival, then hand it over.
        </p>
      </motion.div>

      {user?.riderApproved === false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-(--space-lg)"
        >
          <Clock size={20} className="shrink-0 text-yellow-600" />
          <p className="font-roboto-slab text-sm text-yellow-800">
            Your rider account is awaiting approval from a cluster farmer in your area. You won't be
            assigned any deliveries until you're approved.
          </p>
        </motion.div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Truck} title="No deliveries assigned" description="Escalated orders and demands will appear here." size="lg" />
      ) : (
        <motion.div variants={STAGGER_CONTAINER_VARIANT} initial="hidden" animate="visible" className="flex flex-col gap-4">
          {items.map((item) => {
            const ui = getUi(item.key);
            return (
              <motion.div
                key={item.key}
                variants={FADE_IN_VARIANT}
                className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">{item.title}</h3>
                    <p className="text-sm text-(--text-colour)">{item.buyerName}</p>
                    <p className="text-sm text-(--text-colour)">{item.deliveryAddress}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {FULFILLMENT_STAGE_LABELS[item.fulfillmentStage] ?? item.fulfillmentStage}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-(--border-gray) bg-(--gray-bg) p-4">
                  {item.fulfillmentStage === "escalated_to_rider" && !ui.otpSent && (
                    <button
                      onClick={() => handleSendPhoneOtp(item)}
                      disabled={ui.submitting}
                      className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Phone size={14} />
                      Send OTP to Buyer's Phone
                    </button>
                  )}

                  {item.fulfillmentStage === "escalated_to_rider" && ui.otpSent && (
                    <div className="flex flex-col gap-3">
                      <p className="font-roboto-slab text-xs text-(--text-colour)">
                        Ask the buyer to read back the OTP sent to their phone, then photograph the product (kg/size visible) before moving it.
                      </p>
                      <input
                        type="text"
                        placeholder="Enter OTP from buyer"
                        value={ui.otpInput}
                        onChange={(e) => patchUi(item.key, { otpInput: e.target.value })}
                        className="rounded-lg border border-(--border-gray) px-3 py-2 text-sm"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => patchUi(item.key, { pickupFile: e.target.files?.[0] ?? null })}
                        className="text-xs"
                      />
                      <button
                        onClick={() => handleStartDelivery(item)}
                        disabled={ui.submitting}
                        className="flex items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <Camera size={14} />
                        Confirm Pickup & Start Delivery
                      </button>
                    </div>
                  )}

                  {item.fulfillmentStage === "out_for_delivery" && !item.deliveryOtpVerifiedAt && !ui.arrivalOtpSent && (
                    <button
                      onClick={() => handleSendArrivalOtp(item)}
                      disabled={ui.submitting}
                      className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <ShieldCheck size={14} />
                      Send Arrival OTP
                    </button>
                  )}

                  {item.fulfillmentStage === "out_for_delivery" && !item.deliveryOtpVerifiedAt && ui.arrivalOtpSent && (
                    <div className="flex flex-col gap-3">
                      <p className="font-roboto-slab text-xs text-(--text-colour)">
                        Ask the buyer to read back the OTP just sent to their phone to confirm their identity.
                      </p>
                      <input
                        type="text"
                        placeholder="Enter OTP from buyer"
                        value={ui.arrivalOtpInput}
                        onChange={(e) => patchUi(item.key, { arrivalOtpInput: e.target.value })}
                        className="rounded-lg border border-(--border-gray) px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => handleVerifyArrivalOtp(item)}
                        disabled={ui.submitting}
                        className="flex items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <ShieldCheck size={14} />
                        Verify Buyer Identity
                      </button>
                    </div>
                  )}

                  {item.fulfillmentStage === "out_for_delivery" && item.deliveryOtpVerifiedAt && (
                    <div className="flex flex-col gap-3">
                      <p className="flex items-center gap-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} /> Buyer identity confirmed
                      </p>
                      <p className="font-roboto-slab text-xs text-(--text-colour)">
                        Photograph the product at handoff (kg/size visible) before completing the delivery.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => patchUi(item.key, { handoffFile: e.target.files?.[0] ?? null })}
                        className="text-xs"
                      />
                      <button
                        onClick={() => handleCompleteHandoff(item)}
                        disabled={ui.submitting}
                        className="flex items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <Camera size={14} />
                        Complete Handoff
                      </button>
                    </div>
                  )}

                  {item.fulfillmentStage === "delivered_awaiting_confirmation" && (
                    <p className="flex items-center gap-1 text-xs font-semibold text-blue-700">
                      <CheckCircle2 size={14} /> Delivered — awaiting buyer confirmation
                    </p>
                  )}

                  {item.fulfillmentStage === "completed" && (
                    <p className="flex items-center gap-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={14} /> Completed
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
