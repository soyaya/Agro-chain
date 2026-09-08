"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Truck } from "lucide-react";
import { toast } from "sonner";
import { farmerService, type FarmerOrder } from "~/lib/services/farmer.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

const FULFILLMENT_STAGE_LABELS: Record<string, string> = {
  awaiting_farmer_dispatch: "Awaiting your dispatch",
  dispatched_to_cluster: "Dispatched — awaiting cluster receipt",
  at_cluster_office: "At cluster office",
  ready_for_pickup: "Ready for buyer pickup",
  escalated_to_rider: "Escalated to rider",
  out_for_delivery: "Out for delivery",
  delivered_awaiting_confirmation: "Delivered — awaiting buyer confirmation",
  completed: "Completed",
};

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await farmerService.getOrders();
        if (mounted) setOrders(res.data.orders ?? []);
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDispatch = async (orderId: string) => {
    setDispatching(orderId);
    try {
      await farmerService.dispatchOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, fulfillmentStage: "dispatched_to_cluster" } : o)),
      );
      toast.success("Marked dispatched to your cluster's office.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setDispatching(null);
    }
  };

  if (loading) return <LoadingState message="Loading your orders..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load orders"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">My Orders</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Orders placed against your listings. Once paid, move the physical product to your
          cluster's office so it can be picked up or delivered.
        </p>
      </motion.div>

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="Orders will appear here once buyers purchase your listings." size="lg" />
      ) : (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              variants={FADE_IN_VARIANT}
              className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
                    Order #{order.orderId.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-(--text-colour)">{order.buyerName}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 capitalize">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-(--text-colour)">
                <p>
                  {order.quantity} units{order.weightKg ? ` • ${order.weightKg}kg` : ""}
                </p>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
                {order.listingId && (
                  <Link
                    href={`/farmers-dashboard/listings/${order.listingId}`}
                    className="w-fit font-medium text-(--theme-green-dark) capitalize hover:underline"
                  >
                    From listing: {order.listingFishType?.replace(/_/g, " ") ?? "View listing"}
                  </Link>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-(--border-gray) bg-(--gray-bg) p-3">
                <p className="font-roboto-slab mb-2 text-xs font-medium text-(--text-colour)">
                  {FULFILLMENT_STAGE_LABELS[order.fulfillmentStage] ?? order.fulfillmentStage}
                </p>
                {order.fulfillmentStage === "awaiting_farmer_dispatch" && (
                  <button
                    onClick={() => handleDispatch(order.orderId)}
                    disabled={dispatching === order.orderId}
                    className="flex items-center gap-2 rounded-full bg-(--theme-green-dark) px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    <Truck size={14} />
                    Mark Dispatched to Cluster Office
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
