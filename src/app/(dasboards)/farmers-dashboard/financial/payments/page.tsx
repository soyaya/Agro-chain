"use client";

import { motion } from "framer-motion";
import { Receipt, CheckCircle, Clock, AlertCircle, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
import type { PaymentHistoryRecord, PaymentStatus } from "~/types/index";

export default function PaymentHistoryPage() {
  // Mock data - replace with actual data fetching
  const paymentHistory: PaymentHistoryRecord[] = [
    {
      date: new Date("2024-02-08"),
      type: "credit_payment",
      amount: 15750,
      status: "on_time",
      referenceId: "CP-2024-001",
    },
    {
      date: new Date("2024-02-01"),
      type: "loan_payment",
      amount: 6875,
      status: "on_time",
      referenceId: "LOAN-2023-045",
    },
    {
      date: new Date("2024-01-01"),
      type: "loan_payment",
      amount: 6875,
      status: "on_time",
      referenceId: "LOAN-2023-045",
    },
    {
      date: new Date("2023-12-15"),
      type: "credit_payment",
      amount: 12000,
      status: "late",
      referenceId: "CP-2023-089",
    },
  ];

  const upcomingPayments = [
    {
      dueDate: new Date("2024-03-01"),
      amount: 6875,
      type: "loan_payment" as const,
      referenceId: "LOAN-2023-045",
      description: "Equipment Loan - Monthly Payment",
    },
    {
      dueDate: new Date("2024-03-10"),
      amount: 15750,
      type: "credit_payment" as const,
      referenceId: "CP-2024-001",
      description: "Fish Feed Purchase - Installment 2/3",
    },
    {
      dueDate: new Date("2024-03-20"),
      amount: 27250,
      type: "credit_payment" as const,
      referenceId: "CP-2024-002",
      description: "Water Pump System - Installment 1/4",
    },
  ];

  const getStatusConfig = (status: PaymentStatus) => {
    const configs = {
      pending: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
      paid: { label: "Paid", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
      overdue: { label: "Overdue", color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle },
      on_time: { label: "On Time", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
      late: { label: "Late", color: "text-orange-600", bgColor: "bg-orange-100", icon: AlertCircle },
      missed: { label: "Missed", color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle },
    };
    return configs[status];
  };

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const onTimePayments = paymentHistory.filter(p => p.status === "on_time").length;
  const paymentRate = paymentHistory.length > 0 ? (onTimePayments / paymentHistory.length) * 100 : 0;

  const stats = [
    {
      label: "Total Paid",
      value: `₦${totalPaid.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Payment History",
      value: paymentHistory.length.toString(),
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "On-Time Rate",
      value: `${paymentRate.toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Upcoming Payments",
      value: upcomingPayments.length.toString(),
      icon: Calendar,
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
      >
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
          Payment History 💳
        </h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Track your payment history and upcoming dues
        </p>
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

      {/* Upcoming Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Upcoming Payments
        </h2>
        
        {upcomingPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-(--space-xl) text-center">
            <Calendar size={48} className="text-gray-300 mb-(--space-md)" />
            <p className="font-roboto-slab text-gray-500">
              No upcoming payments scheduled
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-(--space-md)">
            {upcomingPayments.map((payment, index) => {
              const daysUntilDue = Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntilDue <= 7;
              
              return (
                <div
                  key={index}
                  className={`rounded-xl border p-(--space-lg) cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:scale-105 ${
                    isUrgent ? "border-orange-300 bg-orange-50" : "border-(--border-input) bg-(--white)"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-(--space-sm) mb-2">
                        <Calendar size={16} className={isUrgent ? "text-orange-600" : "text-gray-500"} />
                        <p className="font-roboto-slab text-xs text-gray-500">
                          Due {payment.dueDate.toLocaleDateString()}
                        </p>
                        {isUrgent && (
                          <span className="rounded-full bg-orange-200 px-2 py-1 text-xs font-medium text-orange-800">
                            Due in {daysUntilDue} {daysUntilDue === 1 ? "day" : "days"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-ubuntu text-lg font-semibold text-(--heading-colour) mb-1">
                        {payment.description}
                      </h3>
                      <p className="font-roboto-slab text-sm text-gray-600">
                        Reference: {payment.referenceId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-ubuntu text-xl font-bold text-(--heading-colour)">
                        ₦{payment.amount.toLocaleString()}
                      </p>
                      <button className="mt-2 rounded-lg bg-(--theme-green-dark) px-(--space-lg) py-(--space-sm) text-sm font-medium text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90">
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Payment History
        </h2>
        
        {paymentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-(--space-xl) text-center">
            <Receipt size={48} className="text-gray-300 mb-(--space-md)" />
            <p className="font-roboto-slab text-gray-500">
              No payment history available
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-(--space-md)">
            {paymentHistory.map((payment, index) => {
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-(--border-input) p-(--space-lg) cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:scale-105"
                >
                  <div className="flex items-center gap-(--space-lg)">
                    <div className={`rounded-xl p-(--space-md) ${statusConfig.bgColor}`}>
                      <StatusIcon size={20} className={statusConfig.color} />
                    </div>
                    <div>
                      <h3 className="font-ubuntu text-base font-semibold text-(--heading-colour) mb-1">
                        {payment.type === "loan_payment" ? "Loan Payment" : "Credit Payment"}
                      </h3>
                      <p className="font-roboto-slab text-sm text-gray-600">
                        {payment.referenceId} • {payment.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-ubuntu text-lg font-bold text-(--heading-colour) mb-1">
                      ₦{payment.amount.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
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
