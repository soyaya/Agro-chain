"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText, Download, CheckCircle, Clock, Calendar, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FADE_IN_VARIANT } from "~/types/constants";
import type { LoanApplication, LoanApplicationStatus } from "~/types/index";

export default function LoanDetailPage() {
  const params = useParams();
  const loanId = params.id as string;

  // Mock data - replace with actual data fetching based on loanId
  const loanApplication: LoanApplication = {
    id: loanId,
    farmerId: "farmer-1",
    applicationNumber: "LOAN-2024-001",
    loanType: "equipment",
    requestedAmount: 150000,
    purpose: "Purchase of new fish pond equipment including aerators, water pumps, and feeding systems",
    farmDetails: {
      farmSize: 5,
      cropTypes: ["Catfish", "Tilapia"],
      estimatedYield: 10000,
      farmValue: 500000,
      equipment: [
        { name: "Water Pump", type: "equipment", value: 45000, condition: "good", purchaseDate: new Date("2022-03-15") },
        { name: "Pond Aerator", type: "equipment", value: 25000, condition: "good", purchaseDate: new Date("2023-01-10") },
        { name: "Feeding Machine", type: "equipment", value: 30000, condition: "fair", purchaseDate: new Date("2021-06-20") },
      ],
    },
    status: "under_review",
    submittedAt: new Date("2024-01-15"),
    documents: [
      { id: "1", type: "Farm Ownership", filename: "farm_deed.pdf", url: "#", uploadedAt: new Date("2024-01-15"), verified: true },
      { id: "2", type: "ID Card", filename: "national_id.pdf", url: "#", uploadedAt: new Date("2024-01-15"), verified: true },
      { id: "3", type: "Bank Statement", filename: "bank_statement.pdf", url: "#", uploadedAt: new Date("2024-01-15"), verified: false },
    ],
  };

  const getStatusConfig = (status: LoanApplicationStatus) => {
    const configs = {
      draft: { label: "Draft", color: "text-gray-600", bgColor: "bg-gray-100", icon: FileText },
      submitted: { label: "Submitted", color: "text-blue-600", bgColor: "bg-blue-100", icon: FileText },
      under_review: { label: "Under Review", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
      approved: { label: "Approved", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
      rejected: { label: "Rejected", color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle },
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

  const statusConfig = getStatusConfig(loanApplication.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/farmers-dashboard/financial/loans"
          className="inline-flex items-center gap-2 font-roboto-slab text-sm text-(--theme-green-dark) mb-(--space-md) hover:cursor-pointer ease-in-out transition-all duration-300 hover:gap-3"
        >
          <ArrowLeft size={16} />
          <span>Back to Loan Applications</span>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
              {loanApplication.applicationNumber}
            </h1>
            <p className="font-roboto-slab text-(--text-colour)">
              Loan application details and status
            </p>
          </div>
          <span className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
            <StatusIcon size={16} />
            {statusConfig.label}
          </span>
        </div>
      </motion.div>

      {/* Application Overview */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Application Overview
        </h2>
        
        <div className="grid grid-cols-1 gap-(--space-lg) sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-roboto-slab text-xs text-gray-500 mb-1">Loan Type</p>
            <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
              {getLoanTypeLabel(loanApplication.loanType)}
            </p>
          </div>
          <div>
            <p className="font-roboto-slab text-xs text-gray-500 mb-1">Requested Amount</p>
            <p className="font-ubuntu text-xl font-bold text-(--theme-green-dark)">
              ₦{loanApplication.requestedAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-roboto-slab text-xs text-gray-500 mb-1">Submitted Date</p>
            <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
              {loanApplication.submittedAt.toLocaleDateString()}
            </p>
          </div>
          {loanApplication.reviewedAt && (
            <div>
              <p className="font-roboto-slab text-xs text-gray-500 mb-1">Reviewed Date</p>
              <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
                {loanApplication.reviewedAt.toLocaleDateString()}
              </p>
            </div>
          )}
          {loanApplication.approvedAmount && (
            <div>
              <p className="font-roboto-slab text-xs text-gray-500 mb-1">Approved Amount</p>
              <p className="font-ubuntu text-xl font-bold text-green-600">
                ₦{loanApplication.approvedAmount.toLocaleString()}
              </p>
            </div>
          )}
          {loanApplication.interestRate && (
            <div>
              <p className="font-roboto-slab text-xs text-gray-500 mb-1">Interest Rate</p>
              <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
                {loanApplication.interestRate}% per annum
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-(--space-lg) pt-(--space-lg) border-t border-gray-200">
          <p className="font-roboto-slab text-xs text-gray-500 mb-2">Purpose</p>
          <p className="font-roboto-slab text-base text-(--heading-colour)">
            {loanApplication.purpose}
          </p>
        </div>
      </motion.div>

      {/* Repayment Terms (if approved) */}
      {loanApplication.repaymentTerms && (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-green-200 bg-green-50 p-(--space-xl) shadow-sm"
        >
          <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-green-900">
            Repayment Terms
          </h2>
          
          <div className="grid grid-cols-1 gap-(--space-lg) sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-roboto-slab text-xs text-green-700 mb-1">Duration</p>
              <p className="font-ubuntu text-2xl font-bold text-green-900">
                {loanApplication.repaymentTerms.durationMonths} months
              </p>
            </div>
            <div>
              <p className="font-roboto-slab text-xs text-green-700 mb-1">Monthly Payment</p>
              <p className="font-ubuntu text-2xl font-bold text-green-900">
                ₦{loanApplication.repaymentTerms.monthlyPayment.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-roboto-slab text-xs text-green-700 mb-1">Total Amount</p>
              <p className="font-ubuntu text-2xl font-bold text-green-900">
                ₦{loanApplication.repaymentTerms.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-roboto-slab text-xs text-green-700 mb-1">Start Date</p>
              <p className="font-roboto-slab text-base font-medium text-green-900">
                {loanApplication.repaymentTerms.startDate.toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Farm Collateral Details */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Farm Collateral Details
        </h2>
        
        <div className="grid grid-cols-1 gap-(--space-lg) sm:grid-cols-2 lg:grid-cols-4 mb-(--space-xl)">
          <div>
            <p className="font-roboto-slab text-xs text-gray-500 mb-1">Farm Size</p>
            <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
              {loanApplication.farmDetails.farmSize} hectares
            </p>
          </div>
          <div>
            <p className="font-roboto-slab text-xs text-gray-500 mb-1">Estimated Yield</p>
            <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
              {loanApplication.farmDetails.estimatedYield.toLocaleString()} kg/year
            </p>
          </div>
          <div>
            <p className="font-roboto-slab text-xs text-gray-500 mb-1">Farm Value</p>
            <p className="font-ubuntu text-lg font-bold text-(--theme-green-dark)">
              ₦{loanApplication.farmDetails.farmValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-roboto-slab text-xs text-gray-500 mb-1">Crop Types</p>
            <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
              {loanApplication.farmDetails.cropTypes.join(", ")}
            </p>
          </div>
        </div>
        
        {/* Equipment List */}
        {loanApplication.farmDetails.equipment.length > 0 && (
          <div>
            <h3 className="font-ubuntu mb-(--space-md) text-lg font-semibold text-(--heading-colour)">
              Farm Equipment
            </h3>
            <div className="flex flex-col gap-(--space-md)">
              {loanApplication.farmDetails.equipment.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-(--border-input) p-(--space-md) cursor-default ease-in-out transition-all duration-300 hover:shadow-sm hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-roboto-slab text-base font-medium text-(--heading-colour) mb-1">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-(--space-lg) text-sm">
                        <span className="font-roboto-slab text-gray-600">
                          Type: <span className="font-medium text-(--heading-colour)">{item.type}</span>
                        </span>
                        <span className="font-roboto-slab text-gray-600">
                          Condition: <span className={`font-medium capitalize ${
                            item.condition === "new" ? "text-green-600" :
                            item.condition === "good" ? "text-blue-600" :
                            item.condition === "fair" ? "text-yellow-600" : "text-red-600"
                          }`}>{item.condition}</span>
                        </span>
                        {item.purchaseDate && (
                          <span className="font-roboto-slab text-gray-600">
                            Purchased: {item.purchaseDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-ubuntu text-lg font-bold text-(--theme-green-dark)">
                      ₦{item.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Documents */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl border border-(--border-input) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-(--heading-colour)">
          Supporting Documents
        </h2>
        
        <div className="flex flex-col gap-(--space-md)">
          {loanApplication.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-(--border-input) p-(--space-lg) cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:scale-105"
            >
              <div className="flex items-center gap-(--space-md)">
                <div className="rounded-lg bg-blue-50 p-(--space-md)">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-roboto-slab text-base font-medium text-(--heading-colour) mb-1">
                    {doc.type}
                  </p>
                  <p className="font-roboto-slab text-sm text-gray-600">
                    {doc.filename} • Uploaded {doc.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-(--space-md)">
                {doc.verified ? (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    <CheckCircle size={14} />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                    <Clock size={14} />
                    Pending
                  </span>
                )}
                <button className="flex items-center gap-2 rounded-lg border border-(--border-gray) bg-(--white) px-(--space-lg) py-(--space-sm) text-sm font-medium text-(--heading-colour) hover:cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      {loanApplication.status === "draft" && (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col gap-(--space-md) sm:flex-row"
        >
          <button className="flex-1 rounded-xl bg-(--theme-green-dark) px-(--space-xl) py-(--space-lg) font-roboto-slab font-medium text-white cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90 focus:ring-2 focus:ring-(--theme-green-dark) focus:ring-offset-2 focus:outline-none">
            Submit Application
          </button>
          <button className="flex-1 rounded-xl border border-(--border-gray) bg-(--white) px-(--space-xl) py-(--space-lg) font-roboto-slab font-medium text-(--heading-colour) cursor-pointer ease-in-out transition-all duration-300 hover:bg-(--bg-pink) focus:ring-2 focus:ring-(--border-gray) focus:ring-offset-2 focus:outline-none">
            Edit Application
          </button>
        </motion.div>
      )}
    </div>
  );
}
