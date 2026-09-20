"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Camera, CheckCircle2, Clock, AlertTriangle, RefreshCw, Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { riderService, type RiderOrder, type RiderDemand } from "~/lib/services/rider.service";
import { uploadFile } from "~/lib/upload";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, deliveryPhotoGuidance } from "~/types/constants";
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
  fishVariant: string | null;
}

interface ItemUiState {
  pickupFile: File | null;
  handoffFile: File | null;
  submitting: boolean;
}

const defaultUiState: ItemUiState = {
  pickupFile: null,
  handoffFile: null,
  submitting: false,
};

// A plain <input type="file"> gives no feedback that an image was actually
// selected. This shows a clear "Upload Photo" affordance, then a thumbnail +
// retake control once one exists, so it's never ambiguous whether the photo
// step is done.
function DeliveryPhotoCapture({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  if (file && previewUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- ephemeral local blob: URL, not worth Next/Image's optimization pipeline
      <div className="flex items-center gap-3 rounded-lg border border-(--border-gray) bg-(--white) p-3">
        <img src={previewUrl} alt="Selected delivery photo" className="h-14 w-14 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-(--heading-colour)">{file.name}</p>
          <p className="flex items-center gap-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={12} /> Photo ready
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-(--border-gray) px-3 py-1.5 text-xs font-semibold text-(--text-colour) transition hover:border-(--theme-green-dark) hover:text-(--theme-green-dark)"
        >
          <RefreshCw size={12} /> Replace
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-(--border-gray) bg-(--white) px-4 py-3 text-sm font-semibold text-(--heading-colour) transition hover:border-(--theme-green-dark) hover:text-(--theme-green-dark)"
      >
        <UploadIcon size={16} /> {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </div>
  );
}

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
        fishVariant: o.fishVariant,
      }));
      const demandItems: DeliveryItem[] = (demandsRes.data.demands ?? []).map((d: RiderDemand) => ({
        key: `demand:${d.demandId}`,
        id: d.demandId,
        type: "demand",
        title: "Demand Delivery",
        buyerName: d.buyerName,
        deliveryAddress: d.deliveryAddress,
        fulfillmentStage: d.fulfillmentStage,
        fishVariant: d.fishVariant,
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

  const handleStartDelivery = async (item: DeliveryItem) => {
    const ui = getUi(item.key);
    if (!ui.pickupFile) return toast.error("Take a photo of the product before moving it.");
    patchUi(item.key, { submitting: true });
    try {
      const photoUrl = await uploadFile(ui.pickupFile);
      if (item.type === "order") await riderService.startDelivery(item.id, photoUrl);
      else await riderService.startDemandDelivery(item.id, photoUrl);
      toast.success("Delivery started.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start delivery");
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
          Orders and demands escalated to you for delivery. Photograph the product at pickup, then again at
          handoff — the buyer compares both before confirming, so no OTP is needed.
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
            const guidance = deliveryPhotoGuidance(item.fishVariant);
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
                  {item.fulfillmentStage === "escalated_to_rider" && (
                    <div className="flex flex-col gap-3">
                      <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        {guidance}
                      </p>
                      <DeliveryPhotoCapture
                        label="Upload Pickup Photo"
                        file={ui.pickupFile}
                        onChange={(f) => patchUi(item.key, { pickupFile: f })}
                      />
                      <button
                        onClick={() => handleStartDelivery(item)}
                        disabled={ui.submitting || !ui.pickupFile}
                        className="flex items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Camera size={14} />
                        {ui.submitting ? "Uploading..." : "Confirm Pickup & Start Delivery"}
                      </button>
                      {!ui.pickupFile && (
                        <p className="text-xs text-(--text-colour)">Upload a photo above to enable this button.</p>
                      )}
                    </div>
                  )}

                  {item.fulfillmentStage === "out_for_delivery" && (
                    <div className="flex flex-col gap-3">
                      <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        {guidance}
                      </p>
                      <DeliveryPhotoCapture
                        label="Upload Handoff Photo"
                        file={ui.handoffFile}
                        onChange={(f) => patchUi(item.key, { handoffFile: f })}
                      />
                      <button
                        onClick={() => handleCompleteHandoff(item)}
                        disabled={ui.submitting || !ui.handoffFile}
                        className="flex items-center justify-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Camera size={14} />
                        {ui.submitting ? "Uploading..." : "Complete Handoff"}
                      </button>
                      {!ui.handoffFile && (
                        <p className="text-xs text-(--text-colour)">Upload a photo above to enable this button.</p>
                      )}
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
