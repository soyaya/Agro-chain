"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { procurementService, type ProcurementOrderRow } from "~/lib/services/procurement.service";
import { useAuth } from "~/lib/auth-context";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";
import { formatStatus, statusColorClass } from "~/types/constants";

export default function ProcurementOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProcurementOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await procurementService.getOrders(1, 100);
      setOrders(res.data.orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleClaim = async (orderId: string) => {
    setBusyId(orderId);
    try {
      await procurementService.claimOrder(orderId);
      toast.success("Order claimed.");
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to claim order");
    } finally {
      setBusyId(null);
    }
  };

  const handleReceive = async (orderId: string) => {
    setBusyId(orderId);
    try {
      await procurementService.receiveOrder(orderId);
      toast.success("Order received.");
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to receive order");
    } finally {
      setBusyId(null);
    }
  };

  const handleReadyForPickup = async (orderId: string) => {
    setBusyId(orderId);
    try {
      await procurementService.markReadyForPickup(orderId);
      toast.success("Marked ready for pickup.");
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingState message="Loading orders..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Orders</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Every order platform-wide. Only orders with no cluster farmer available — or one that declined — can be
          claimed. Your own area surfaces first.
        </p>
      </motion.div>

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="Orders will appear here as buyers check out." size="lg" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-(--border-gray) bg-(--white) shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-(--border-gray) text-(--text-colour)">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Farmer</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const isMine = o.procurementOfficerId === user?.id;
                return (
                  <tr key={o.orderId} className={`border-b border-(--border-gray) last:border-0 ${!o.eligible && !isMine ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-(--heading-colour)">{o.orderNumber}</td>
                    <td className="px-4 py-3">{o.buyerName}</td>
                    <td className="px-4 py-3">{o.farmerName}</td>
                    <td className="px-4 py-3 text-xs text-(--text-colour)">
                      {o.farmerLga}, {o.farmerState}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorClass(o.status)}`}>
                        {formatStatus(o.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-(--text-colour)">{o.fulfillmentStage.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">₦{Number(o.grandTotal).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {isMine && o.fulfillmentStage === "dispatched_to_cluster" ? (
                        <button
                          onClick={() => handleReceive(o.orderId)}
                          disabled={busyId === o.orderId}
                          className="font-roboto-slab rounded-lg bg-(--theme-green-dark) px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          Receive
                        </button>
                      ) : isMine && o.fulfillmentStage === "at_cluster_office" && o.fulfillmentMethod === "pickup" ? (
                        <button
                          onClick={() => handleReadyForPickup(o.orderId)}
                          disabled={busyId === o.orderId}
                          className="font-roboto-slab rounded-lg bg-(--theme-green-dark) px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          Ready for pickup
                        </button>
                      ) : isMine ? (
                        <span className="font-roboto-slab text-xs text-(--text-colour)">You&apos;re handling this</span>
                      ) : o.eligible ? (
                        <button
                          onClick={() => handleClaim(o.orderId)}
                          disabled={busyId === o.orderId}
                          className="font-roboto-slab rounded-lg bg-(--theme-green-dark) px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          Take this order
                        </button>
                      ) : (
                        <span className="font-roboto-slab text-xs text-(--text-colour)">
                          {o.hasClusterFarmer && !o.clusterDeclined ? "Cluster farmer handling this" : "Already claimed"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
