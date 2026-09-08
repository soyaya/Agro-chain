"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package, CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { buyerService, type BackendDemand, type BuyerOrderTrackingEvent } from "~/lib/services/buyer.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

const FULFILLMENT_STAGE_LABELS: Record<string, string> = {
  awaiting_farmer_dispatch: "Awaiting acceptance",
  at_cluster_office: "Cluster farmer is sourcing your order",
  ready_for_pickup: "Ready for pickup at the cluster office",
  escalated_to_rider: "Escalated to a delivery rider",
  out_for_delivery: "Out for delivery",
  delivered_awaiting_confirmation: "Delivered — please confirm receipt",
  completed: "Completed",
};

export default function DemandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const demandId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [demand, setDemand] = useState<BackendDemand | null>(null);
  const [tracking, setTracking] = useState<BuyerOrderTrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    if (!demandId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const [demandRes, trackingRes] = await Promise.all([
        buyerService.getDemand(demandId),
        buyerService.getDemandTracking(demandId),
      ]);
      setDemand(demandRes.data.demand);
      setTracking(trackingRes.data.tracking ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load demand");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandId]);

  const handlePay = async () => {
    if (!demandId) return;
    setPaying(true);
    try {
      await buyerService.payDemandWithWallet(demandId);
      toast.success("Payment successful. Your demand is now live.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!demandId) return;
    setConfirming(true);
    try {
      await buyerService.confirmDemandReceipt(demandId);
      toast.success("Receipt confirmed. Thanks!");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm receipt");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <LoadingState message="Loading demand details..." size="lg" />;

  if (errorMessage || !demand) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load demand"
        description={errorMessage ?? "Demand not found."}
        actionLabel="Back to Demands"
        actionHref="/buyers-dashboard/demands"
        size="lg"
      />
    );
  }

  const canConfirmReceipt = ["ready_for_pickup", "delivered_awaiting_confirmation"].includes(
    demand.fulfillmentStage,
  );

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/buyers-dashboard/demands")}
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Demands
          </button>
          <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour) capitalize">
            {demand.fishVariant.replace("_", " ")} Demand
          </h1>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
            demand.status === "fulfilled"
              ? "bg-green-100 text-green-700"
              : demand.status === "cancelled" || demand.status === "declined"
                ? "bg-gray-100 text-gray-600"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {demand.status}
        </span>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Summary */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-(--heading-colour)">Order Summary</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm text-(--text-colour)">
                <span>{demand.quantityPieces ? "Quantity" : "Weight"}</span>
                <span>{demand.quantityPieces ? `${demand.quantityPieces} pieces` : `${demand.weightKg} kg`}</span>
              </div>
              <div className="flex justify-between text-sm text-(--text-colour)">
                <span>Price per {demand.quantityPieces ? "piece" : "kg"}</span>
                <span>₦{demand.pricePerUnit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-(--text-colour)">
                <span>Subtotal</span>
                <span>₦{demand.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-(--text-colour)">
                <span>Delivery Fee</span>
                <span>₦{demand.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="font-ubuntu font-bold text-(--heading-colour)">Total</span>
                <span className="font-ubuntu text-xl font-bold text-(--theme-green-dark)">
                  ₦{demand.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tracking timeline — driven by real DemandTracking events */}
          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-(--heading-colour)">Tracking History</h2>
            {tracking.length === 0 ? (
              <p className="font-roboto-slab text-sm text-(--text-colour)">No tracking events yet.</p>
            ) : (
              <div className="relative ml-4 space-y-6 border-l-2 border-green-200 pb-2">
                {tracking.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[25px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-green-100">
                      {idx === tracking.length - 1 ? (
                        <Clock size={16} className="text-green-600" />
                      ) : (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                    </div>
                    <div className="ml-8">
                      <p className="font-roboto-slab font-semibold text-(--heading-colour) capitalize">
                        {event.status.replace("_", " ")}
                      </p>
                      <p className="font-roboto-slab text-sm text-(--text-colour)">{event.message}</p>
                      <p className="font-roboto-slab text-xs text-gray-400">
                        {new Date(event.createdAt).toLocaleString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Confirm receipt */}
          {canConfirmReceipt && (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              <h2 className="font-ubuntu mb-2 text-xl font-bold text-(--heading-colour)">Confirm Receipt</h2>
              <p className="font-roboto-slab mb-4 text-sm text-(--text-colour)">
                {demand.fulfillmentMethod === "pickup"
                  ? "Confirm you've picked up your order from the cluster farmer's office."
                  : "Confirm the rider delivered your order."}
              </p>
              <button
                onClick={handleConfirmReceipt}
                disabled={confirming}
                className="flex h-12 w-full items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {confirming ? "Confirming..." : "Confirm Receipt"}
              </button>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-(--heading-colour)">Fulfillment</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Method</p>
                <p className="font-roboto-slab font-medium text-(--heading-colour) capitalize">
                  {demand.fulfillmentMethod}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Current Stage</p>
                <p className="font-roboto-slab font-medium text-(--heading-colour)">
                  {FULFILLMENT_STAGE_LABELS[demand.fulfillmentStage] ?? demand.fulfillmentStage}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">
                  {demand.fulfillmentMethod === "pickup" ? "Your Address" : "Delivery Address"}
                </p>
                <p className="font-roboto-slab leading-relaxed font-medium text-(--heading-colour)">
                  {demand.deliveryAddress}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={FADE_IN_VARIANT}
            className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
          >
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-(--heading-colour)">Payment</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    demand.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {demand.paymentStatus}
                </span>
              </div>
              {demand.paymentStatus !== "paid" && demand.status === "pending" && (
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-(--theme-green-dark) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {paying ? "Paying..." : `Pay ₦${demand.grandTotal.toLocaleString()}`}
                </button>
              )}
            </div>
          </motion.div>

          {demand.notes && (
            <motion.div
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              <h2 className="font-ubuntu mb-2 flex items-center gap-2 text-xl font-bold text-(--heading-colour)">
                <FileText size={18} /> Notes
              </h2>
              <p className="font-roboto-slab text-sm text-(--text-colour)">{demand.notes}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
