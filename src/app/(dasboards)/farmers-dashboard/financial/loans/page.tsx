"use client";

// === Coming Soon — existing content preserved below
// import { motion } from "framer-motion";
// import { Plus, FileText, Clock, CheckCircle, XCircle, DollarSign, Calendar } from "lucide-react";
// import Link from "next/link";
// import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
// import type { LoanApplication, LoanApplicationStatus } from "~/types/index";

import { ComingSoon } from "~/components/shared/ComingSoon";

export default function LoanApplicationsPage() {
  return <ComingSoon />;

  /* === Original content (preserved, not deleted)
  // Mock data - replace with actual data fetching
  const loanApplications: LoanApplication[] = [
    {
      id: "1",
      farmerId: "farmer-1",
      applicationNumber: "LOAN-2024-001",
      loanType: "equipment",
      requestedAmount: 150000,
      purpose: "Purchase of new fish pond equipment",
      farmDetails: {
        farmSize: 5,
        cropTypes: ["Catfish", "Tilapia"],
        estimatedYield: 10000,
        farmValue: 500000,
        equipment: [],
      },
      status: "under_review",
      submittedAt: new Date("2024-01-15"),
      documents: [],
    },
    {
      id: "2",
      farmerId: "farmer-1",
      applicationNumber: "LOAN-2023-045",
      loanType: "seed",
      requestedAmount: 75000,
      purpose: "Purchase of fingerlings for new season",
      farmDetails: {
        farmSize: 5,
        cropTypes: ["Catfish"],
        estimatedYield: 8000,
        farmValue: 500000,
        equipment: [],
      },
      status: "approved",
      submittedAt: new Date("2023-12-01"),
      reviewedAt: new Date("2023-12-05"),
      approvedAmount: 75000,
      interestRate: 8.5,
      repaymentTerms: {
        durationMonths: 12,
        monthlyPayment: 6875,
        totalAmount: 82500,
        startDate: new Date("2024-01-01"),
      },
      documents: [],
    },
  ];

  const getStatusConfig = (status: LoanApplicationStatus) => {
    const configs = {
      draft: { label: "Draft", color: "text-gray-600", bgColor: "bg-gray-100", icon: FileText },
      submitted: { label: "Submitted", color: "text-blue-600", bgColor: "bg-blue-100", icon: FileText },
      under_review: { label: "Under Review", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
      approved: { label: "Approved", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
      rejected: { label: "Rejected", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
      disbursed: { label: "Disbursed", color: "text-purple-600", bgColor: "bg-purple-100", icon: DollarSign },
    };
    return configs[status];
  };

  const getLoanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      equipment: "Equipment",
      seed: "Seeds/Fingerlings",
      fertilizer: "Fertilizer/Feed",
      expansion: "Farm Expansion",
      emergency: "Emergency",
    };
    return labels[type] || type;
  };

  const stats = [
    {
      label: "Total Applications",
      value: loanApplications.length.toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Under Review",
      value: loanApplications.filter(l => l.status === "under_review").length.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Approved",
      value: loanApplications.filter(l => l.status === "approved").length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Approved Amount",
      value: `₦${loanApplications.filter(l => l.status === "approved").reduce((sum, l) => sum + (l.approvedAmount || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
            Loan Applications 📋
          </h1>
          <p className="font-roboto-slab text-(--text-colour)">
            Apply for agricultural loans and track your applications
          </p>
        </div>
        <Link
          href="/farmers-dashboard/financial/loans/apply"
          className="font-roboto-slab flex items-center gap-2 rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-(--space-md) text-white hover:cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90 focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none"
        >
          <Plus size={20} />
          <span>New Application</span>
        </Link>
      </motion.div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Your Loan Applications
        </h2>
        
        {loanApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-(--space-2xl) text-center">
            <FileText size={48} className="text-gray-300 mb-(--space-md)" />
            <p className="font-roboto-slab text-gray-500 mb-(--space-lg)">
              You haven&apos;t submitted any loan applications yet
            </p>
            <Link
              href="/farmers-dashboard/financial/loans/apply"
              className="font-roboto-slab rounded-xl bg-(--theme-green-dark) px-(--space-xl) py-(--space-md) text-white hover:cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90"
            >
              Apply for Your First Loan
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-(--space-lg)">
            {loanApplications.map((application) => {
              const statusConfig = getStatusConfig(application.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={application.id}
                  className="rounded-xl border border-(--border-input) p-(--space-lg) cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:scale-105"
                >
                  <div className="flex flex-col gap-(--space-md) sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-(--space-md) mb-(--space-sm)">
                        <h3 className="font-ubuntu text-lg font-semibold text-(--heading-colour)">
                          {application.applicationNumber}
                        </h3>
                        <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-(--space-sm) sm:grid-cols-2 mb-(--space-md)">
                        <div>
                          <p className="font-roboto-slab text-xs text-gray-500">Loan Type</p>
                          <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                            {getLoanTypeLabel(application.loanType)}
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-xs text-gray-500">Requested Amount</p>
                          <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                            ₦{application.requestedAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-roboto-slab text-xs text-gray-500">Submitted</p>
                          <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                            {application.submittedAt.toLocaleDateString()}
                          </p>
                        </div>
                        {application.approvedAmount && (
                          <div>
                            <p className="font-roboto-slab text-xs text-gray-500">Approved Amount</p>
                            <p className="font-roboto-slab text-sm font-medium text-green-600">
                              ₦{application.approvedAmount.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="font-roboto-slab text-sm text-(--text-colour)">
                        <span className="font-medium">Purpose:</span> {application.purpose}
                      </p>
                      {application.repaymentTerms && (
                        <div className="mt-(--space-md) rounded-lg bg-green-50 p-(--space-md)">
                          <p className="font-roboto-slab text-xs text-green-800 mb-2">Repayment Terms</p>
                          <div className="grid grid-cols-2 gap-(--space-sm) sm:grid-cols-3">
                            <div>
                              <p className="font-roboto-slab text-xs text-green-600">Duration</p>
                              <p className="font-roboto-slab text-sm font-medium text-green-900">
                                {application.repaymentTerms.durationMonths} months
                              </p>
                            </div>
                            <div>
                              <p className="font-roboto-slab text-xs text-green-600">Monthly Payment</p>
                              <p className="font-roboto-slab text-sm font-medium text-green-900">
                                ₦{application.repaymentTerms.monthlyPayment.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="font-roboto-slab text-xs text-green-600">Interest Rate</p>
                              <p className="font-roboto-slab text-sm font-medium text-green-900">
                                {application.interestRate}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/farmers-dashboard/financial/loans/${application.id}`}
                      className="font-roboto-slab rounded-lg border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-sm) text-center text-sm font-medium text-(--heading-colour) hover:cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none"
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
  */
}
