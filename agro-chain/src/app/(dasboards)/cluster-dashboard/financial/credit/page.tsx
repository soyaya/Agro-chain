"use client";

import { motion } from "framer-motion";
import { Plus, ShoppingCart, Package, Truck, CheckCircle, Clock, CreditCard } from "lucide-react";
import Link from "next/link";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import type { CreditPurchase, CreditPurchaseStatus } from "~/types/index";

export default function CreditPurchasesPage() {
  // Mock data - replace with actual data fetching
  const creditPurchases: CreditPurchase[] = [
    {
      id: "1",
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
      deliveryAddress: "123 Farm Road, Kaduna",
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
    },
    {
      id: "2",
      farmerId: "farmer-1",
      orderNumber: "CP-2024-002",
      items: [
        {
          productId: "prod-2",
          productName: "Water Pump System",
          category: "equipment",
          quantity: 1,
          unitPrice: 85000,
          totalPrice: 85000,
          supplier: "FarmTech Solutions",
        },
        {
          productId: "prod-3",
          productName: "Pond Aerator",
          category: "equipment",
          quantity: 2,
          unitPrice: 12000,
          totalPrice: 24000,
          supplier: "FarmTech Solutions",
        },
      ],
      totalAmount: 109000,
      creditTerms: {
        creditLimit: 250000,
        interestRate: 5,
        paymentPeriodDays: 120,
        latePaymentFee: 1000,
      },
      status: "shipped",
      createdAt: new Date("2024-01-20"),
      deliveryAddress: "123 Farm Road, Kaduna",
      paymentSchedule: [
        {
          dueDate: new Date("2024-02-20"),
          amount: 27250,
          status: "pending",
        },
        {
          dueDate: new Date("2024-03-20"),
          amount: 27250,
          status: "pending",
        },
        {
          dueDate: new Date("2024-04-20"),
          amount: 27250,
          status: "pending",
        },
        {
          dueDate: new Date("2024-05-20"),
          amount: 27250,
          status: "pending",
        },
      ],
    },
  ];

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

  const totalCreditUsed = creditPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const creditLimit = 250000;
  const availableCredit = creditLimit - totalCreditUsed;

  const stats = [
    {
      label: "Available Credit",
      value: `₦${availableCredit.toLocaleString()}`,
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Credit Limit",
      value: `₦${creditLimit.toLocaleString()}`,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Purchases",
      value: creditPurchases.length.toString(),
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Credit Used",
      value: `₦${totalCreditUsed.toLocaleString()}`,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
            Credit Purchases 🛒
          </h1>
          <p className="font-roboto-slab text-(--text-colour)">
            Buy agricultural supplies on credit with flexible payment terms
          </p>
        </div>
        <Link
          href="/cluster-dashboard/financial/credit/catalog"
          className="font-roboto-slab flex items-center gap-2 rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-(--space-md) text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90 focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none"
        >
          <Plus size={20} />
          <span>Browse Catalog</span>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-(--gap-lg) sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={SLIDE_UP_VARIANT}
              className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              <div className="mb-(--space-lg) flex items-center gap-(--space-md)">
                <div className={`rounded-xl p-(--space-md) ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
              <p className="font-ubuntu mb-1 text-2xl font-bold text-(--heading-colour)">
                {stat.value}
              </p>
              <p className="font-roboto-slab text-sm text-(--text-colour)">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Credit Usage Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h3 className="font-ubuntu mb-(--space-md) text-lg font-semibold text-(--heading-colour)">
          Credit Usage
        </h3>
        <div className="mb-(--space-sm)">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-roboto-slab text-(--text-colour)">
              ₦{totalCreditUsed.toLocaleString()} of ₦{creditLimit.toLocaleString()} used
            </span>
            <span className="font-roboto-slab font-medium text-(--heading-colour)">
              {((totalCreditUsed / creditLimit) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${(totalCreditUsed / creditLimit) * 100}%` }}
            />
          </div>
        </div>
        <p className="font-roboto-slab text-xs text-gray-500">
          You have ₦{availableCredit.toLocaleString()} available for new purchases
        </p>
      </motion.div>

      {/* Purchases List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Your Credit Purchases
        </h2>
        
        {creditPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-(--space-2xl) text-center">
            <ShoppingCart size={48} className="text-gray-300 mb-(--space-md)" />
            <p className="font-roboto-slab text-gray-500 mb-(--space-lg)">
              You haven&apos;t made any credit purchases yet
            </p>
            <Link
              href="/cluster-dashboard/financial/credit/catalog"
              className="font-roboto-slab rounded-xl bg-(--theme-green-dark) px-(--space-xl) py-(--space-md) text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90"
            >
              Browse Product Catalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-(--space-lg)">
            {creditPurchases.map((purchase) => {
              const statusConfig = getStatusConfig(purchase.status);
              const StatusIcon = statusConfig.icon;
              const paidPayments = purchase.paymentSchedule.filter(p => p.status === "paid").length;
              const totalPayments = purchase.paymentSchedule.length;
              
              return (
                <div
                  key={purchase.id}
                  className="rounded-xl border border-(--border-input) p-(--space-lg) cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:scale-105"
                >
                  <div className="flex flex-col gap-(--space-md)">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-(--space-md) mb-(--space-sm)">
                          <h3 className="font-ubuntu text-lg font-semibold text-(--heading-colour)">
                            {purchase.orderNumber}
                          </h3>
                          <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <p className="font-roboto-slab text-xs text-gray-500 mb-(--space-md)">
                          Ordered on {purchase.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-roboto-slab text-xs text-gray-500">Total Amount</p>
                        <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                          ₦{purchase.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Items */}
                    <div className="rounded-lg bg-gray-50 p-(--space-md)">
                      <p className="font-roboto-slab text-xs text-gray-600 mb-2">Items ({purchase.items.length})</p>
                      <div className="flex flex-col gap-2">
                        {purchase.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                                {item.productName}
                              </p>
                              <p className="font-roboto-slab text-xs text-gray-500">
                                Qty: {item.quantity} × ₦{item.unitPrice.toLocaleString()}
                              </p>
                            </div>
                            <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                              ₦{item.totalPrice.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Payment Progress */}
                    <div className="rounded-lg bg-blue-50 p-(--space-md)">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-roboto-slab text-xs text-blue-800">Payment Progress</p>
                        <p className="font-roboto-slab text-xs font-medium text-blue-900">
                          {paidPayments} of {totalPayments} payments made
                        </p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-blue-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${(paidPayments / totalPayments) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <Link
                      href={`/cluster-dashboard/financial/credit/${purchase.id}`}
                      className="font-roboto-slab rounded-lg border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-sm) text-center text-sm font-medium text-(--heading-colour) cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
