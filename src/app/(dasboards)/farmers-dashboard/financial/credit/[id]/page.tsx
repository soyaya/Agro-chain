"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FADE_IN_VARIANT } from "~/types/constants";
import type { CreditPurchase, CreditPurchaseStatus, PaymentStatus } from "~/types/index";

export default function CreditPurchaseDetailPage() {
  const params = useParams();
  const purchaseId = params.id as string;

  // Mock data - replace with actual data fetching based on purchaseId
  const creditPurchase: CreditPurchase = {
    id: purchaseId,
    farmerId: "farmer-1",
    orderNumber: "CP-2024-001",
    items: [
      {
        productId: "prod-1",
        productName: "Premium Fish Feed (50kg)",
        category: "fertilizers",
        quantity: 10,
        unitPrice: 4500,
        totalPrice: 45000,
        supplier: "AgroSupply Ltd",
      },
    ],
    totalAmount: 45000,
    creditTerms: {
      creditLimit: 250000,
      interestRate: 5,
      paymentPeriodDays: 90,
      latePaymentFee: 1000,
    },
    status: "delivered",
    createdAt: new Date("2024-01-10"),
    deliveryAddress: "123 Farm Road, Kaduna State, Nigeria",
    paymentSchedule: [
      {
        dueDate: new Date("2024-02-10"),
        amount: 15750,
        status: "paid",
        paidAt: new Date("2024-02-08"),
      },
      {
        dueDate: new Date("2024-03-10"),
        amount: 15750,
        status: "pending",
      },
      {
        dueDate: new Date("2024-04-10"),
        amount: 15750,
        status: "pending",
      },
    ],
  };

  const getStatusConfig = (status: CreditPurchaseStatus) => {
    const configs = {
      pending: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
      approved: { label: "Approved", color: "text-blue-600", bgColor: "bg-blue-100", icon: CheckCircle },
      shipped: { label: "Shipped", color: "text-purple-600", bgColor: "bg-purple-100", icon: Truck },
      delivered: { label: "Delivered", color: "text-green-600", bgColor: "bg-green-100", icon: Package },
      completed: { label: "Completed", color: "text-gray-600", bgColor: "bg-gray-100", icon: CheckCircle },
    };
    return configs[status];
  };

  const getPaymentStatusConfig = (status: PaymentStatus) => {
    const configs = {
      pending: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100" },
      paid: { label: "Paid", color: "text-green-600", bgColor: "bg-green-100" },
      overdue: { label: "Overdue", color: "text-red-600", bgColor: "bg-red-100" },
      on_time: { label: "On Time", color: "text-green-600", bgColor: "bg-green-100" },
      late: { label: "Late", color: "text-orange-600", bgColor: "bg-orange-100" },
      missed: { label: "Missed", color: "text-red-600", bgColor: "bg-red-100" },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(creditPurchase.status);
  const StatusIcon = statusConfig.icon;
  const paidPayments = creditPurchase.paymentSchedule.filter(p => p.status === "paid").length;
  const totalPayments = creditPurchase.paymentSchedule.length;
  const totalWithInterest = creditPurchase.totalAmount * (1 + creditPurchase.creditTerms.interestRate / 100);

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Detail info components would go here, currently empty per the mock */}
    </div>
  );
}
