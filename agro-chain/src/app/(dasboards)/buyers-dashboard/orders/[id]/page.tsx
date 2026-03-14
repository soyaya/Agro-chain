"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, FileText } from "lucide-react";
import type { Order, OrderStatus } from "~/types";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT, STATUS_COLORS } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// Mock data to match what's in /orders/page.tsx
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    buyerId: "buyer-1",
    buyerName: "John Smith",
    buyerPhone: "08012345678",
    clusterFarmerId: "cluster-1",
    clusterFarmerName: "Green Valley Farms",
    items: [
      {
        listingId: "1",
        fishType: "Catfish",
        weightKg: 5,
        quantity: 10,
        pricePerUnit: 7000,
        totalPrice: 70000,
      },
    ],
    totalAmount: 70000,
    deliveryAddress: "123 Main Street, Kaduna",
    deliveryOption: "Delivery within state",
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-05"),
  },
  {
    id: "ORD-002",
    buyerId: "buyer-1",
    buyerName: "John Smith",
    buyerPhone: "08012345678",
    clusterFarmerId: "cluster-2",
    clusterFarmerName: "Blue Ocean Fisheries",
    items: [
      {
        listingId: "2",
        fishType: "Tilapia",
        weightKg: 2,
        quantity: 20,
        pricePerUnit: 2800,
        totalPrice: 56000,
      },
    ],
    totalAmount: 56000,
    deliveryAddress: "123 Main Street, Kaduna",
    deliveryOption: "Pickup from warehouse",
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Card",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "ORD-003",
    buyerId: "buyer-1",
    buyerName: "John Smith",
    buyerPhone: "08012345678",
    clusterFarmerId: "cluster-1",
    clusterFarmerName: "Green Valley Farms",
    items: [
      {
        listingId: "3",
        fishType: "Mackerel",
        weightKg: 3,
        quantity: 15,
        pricePerUnit: 4200,
        totalPrice: 63000,
      },
    ],
    totalAmount: 63000,
    deliveryAddress: "123 Main Street, Kaduna",
    deliveryOption: "Express delivery",
    status: "pending",
    paymentStatus: "pending",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
  },
];

const statusIcons: Record<OrderStatus, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching the order
    const loadOrder = () => {
      setLoading(true);
      setTimeout(() => {
        const found = mockOrders.find((o) => o.id === params.id);
        setOrder(found || null);
        setLoading(false);
      }, 600);
    };

    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingState message="Loading order details..." size="lg" />;
  }

  if (!order) {
    return (
      <EmptyState
        icon={Package}
        title="Order Not Found"
        description="We couldn't find the order you're looking for."
        actionLabel="Back to Orders"
        actionHref="/buyers-dashboard/orders"
        size="lg"
      />
    );
  }

  const StatusIcon = statusIcons[order.status];
  const statusColor = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/buyers-dashboard/orders")}
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Orders
          </button>
          <h1 className="font-ubuntu text-3xl font-bold text-gray-900">Order Details</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${statusColor}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FileText size={16} />
            Invoice
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Order Items */}
          <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Items Ordered</h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="font-roboto-slab font-semibold text-gray-900">{item.fishType}</p>
                      <p className="font-roboto-slab text-sm text-gray-500">
                        {item.weightKg}kg Pack × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 text-left sm:text-right">
                    <p className="font-roboto-slab font-bold text-gray-900">
                      ₦{item.totalPrice.toLocaleString()}
                    </p>
                    <p className="font-roboto-slab text-xs text-gray-500">
                      ₦{item.pricePerUnit.toLocaleString()} per pack
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₦{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="font-ubuntu font-bold text-gray-900">Total</span>
                <span className="font-ubuntu font-bold text-green-600 text-xl">
                  ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Tracking */}
          <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Order Tracking</h2>
            <div className="relative border-l-2 border-green-200 ml-4 space-y-8 pb-4 mt-6">
              
              <div className="relative">
                <div className="absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-green-100">
                  <Package size={20} className="text-green-600" />
                </div>
                <div className="ml-10">
                  <h3 className="font-roboto-slab font-bold text-gray-900">Order Placed</h3>
                  <p className="font-roboto-slab text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Clock size={20} className={['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="ml-10">
                  <h3 className={`font-roboto-slab font-bold ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-gray-900' : 'text-gray-400'}`}>Processing</h3>
                  <p className="font-roboto-slab text-sm text-gray-500">Supplier is preparing your order</p>
                </div>
              </div>
              
              <div className="relative">
                <div className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Truck size={20} className={['shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="ml-10">
                  <h3 className={`font-roboto-slab font-bold ${['shipped', 'delivered'].includes(order.status) ? 'text-gray-900' : 'text-gray-400'}`}>Shipped</h3>
                  <p className="font-roboto-slab text-sm text-gray-500">Your order is on the way</p>
                </div>
              </div>

              <div className="relative">
                <div className={`absolute -left-[25px] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${order.status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CheckCircle size={20} className={order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="ml-10">
                  <h3 className={`font-roboto-slab font-bold ${order.status === 'delivered' ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</h3>
                  <p className="font-roboto-slab text-sm text-gray-500">Order successfully delivered</p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Order Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Order ID</p>
                <p className="font-roboto-slab font-medium text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Date Placed</p>
                <p className="font-roboto-slab font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Supplier</p>
                <p className="font-roboto-slab font-medium text-gray-900">{order.clusterFarmerName}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Delivery Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Delivery Type</p>
                <p className="font-roboto-slab font-medium text-gray-900">{order.deliveryOption}</p>
              </div>
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Shipping Address</p>
                <p className="font-roboto-slab font-medium text-gray-900 leading-relaxed">
                  {order.deliveryAddress}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-ubuntu mb-4 text-xl font-bold text-gray-900">Payment Check</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-roboto-slab mb-1 text-sm text-gray-500">Payment Status</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="font-roboto-slab mb-1 text-sm text-gray-500">Payment Method</p>
                  <p className="font-roboto-slab font-medium text-gray-900">{order.paymentMethod}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
