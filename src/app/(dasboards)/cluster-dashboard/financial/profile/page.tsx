"use client";

// === Coming Soon - existing content preserved below
// import { motion } from "framer-motion";
// import { TrendingUp, TrendingDown, Minus, CreditCard, DollarSign, Receipt, AlertCircle, CheckCircle } from "lucide-react";
// import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";
// import type { FarmerFinancialProfile, RiskLevel } from "~/types/index";

import { ComingSoon } from "~/components/shared/ComingSoon";

export default function FinancialProfilePage() {
  return <ComingSoon />;

  /* === Original content (preserved, not deleted)
  // Mock data - replace with actual data fetching
  const financialProfile: FarmerFinancialProfile = {
    farmerId: "farmer-1",
    creditScore: 720,
    creditLimit: 250000,
    availableCredit: 96000,
    totalLoansActive: 2,
    totalCreditPurchases: 2,
    paymentHistory: [],
    riskAssessment: {
      riskLevel: "low",
      factors: [
        { factor: "Payment History", impact: "positive", weight: 0.35 },
        { factor: "Credit Utilization", impact: "positive", weight: 0.25 },
        { factor: "Farm Value", impact: "positive", weight: 0.20 },
        { factor: "Years of Experience", impact: "positive", weight: 0.15 },
        { factor: "Active Loans", impact: "neutral", weight: 0.05 },
      ],
      lastAssessment: new Date("2024-02-01"),
      nextReview: new Date("2024-03-01"),
    },
    lastUpdated: new Date("2024-02-15"),
  };

  const getCreditScoreConfig = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "text-theme-green-dark", bgColor: "bg-green-tint", description: "You have excellent credit standing" };
    if (score >= 700) return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-50", description: "You have good credit standing" };
    if (score >= 650) return { label: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-50", description: "You have fair credit standing" };
    return { label: "Poor", color: "text-red-600", bgColor: "bg-red-50", description: "Your credit needs improvement" };
  };

  const getRiskLevelConfig = (level: RiskLevel) => {
    const configs = {
      low: { label: "Low Risk", color: "text-theme-green-dark", bgColor: "bg-green-tint", icon: CheckCircle },
      medium: { label: "Medium Risk", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: AlertCircle },
      high: { label: "High Risk", color: "text-red-600", bgColor: "bg-red-50", icon: AlertCircle },
    };
    return configs[level];
  };

  const getImpactIcon = (impact: string) => {
    if (impact === "positive") return TrendingUp;
    if (impact === "negative") return TrendingDown;
    return Minus;
  };

  const creditScoreConfig = getCreditScoreConfig(financialProfile.creditScore);
  const riskConfig = getRiskLevelConfig(financialProfile.riskAssessment.riskLevel);
  const creditUtilization = ((financialProfile.creditLimit - financialProfile.availableCredit) / financialProfile.creditLimit) * 100;

  const stats = [
    {
      label: "Credit Score",
      value: financialProfile.creditScore.toString(),
      icon: TrendingUp,
      color: creditScoreConfig.color,
      bgColor: creditScoreConfig.bgColor,
      subtitle: creditScoreConfig.label,
    },
    {
      label: "Credit Limit",
      value: `₦${financialProfile.creditLimit.toLocaleString()}`,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Available Credit",
      value: `₦${financialProfile.availableCredit.toLocaleString()}`,
      icon: DollarSign,
      color: "text-theme-green-dark",
      bgColor: "bg-green-tint",
    },
    {
      label: "Active Loans",
      value: financialProfile.totalLoansActive.toString(),
      icon: Receipt,
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
      >
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-heading-colour">
          Financial Profile 📊
        </h1>
        <p className="font-roboto-slab text-text-colour">
          View your credit score, risk assessment, and financial standing
        </p>
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
              className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm cursor-default ease-in-out transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              <div className="mb-(--space-lg) flex items-center gap-(--space-md)">
                <div className={`rounded-xl p-(--space-md) ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
              <p className="font-ubuntu mb-1 text-2xl font-bold text-heading-colour">
                {stat.value}
              </p>
              <p className="font-roboto-slab text-sm text-text-colour">{stat.label}</p>
              {stat.subtitle && (
                <p className={`font-roboto-slab text-xs mt-1 ${stat.color}`}>{stat.subtitle}</p>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-heading-colour">
          Credit Score Overview
        </h2>
        <div className="flex flex-col gap-(--space-lg) lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="mb-(--space-md)">
              <div className="flex items-center justify-between mb-2">
                <span className="font-roboto-slab text-sm text-text-colour">Credit Score Range</span>
                <span className="font-roboto-slab text-sm font-medium text-heading-colour">
                  {financialProfile.creditScore} / 850
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-gray-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    financialProfile.creditScore >= 750 ? "bg-theme-green-dark" :
                    financialProfile.creditScore >= 700 ? "bg-blue-600" :
                    financialProfile.creditScore >= 650 ? "bg-yellow-600" : "bg-red-600"
                  }`}
                  style={{ width: `${(financialProfile.creditScore / 850) * 100}%` }}
                />
              </div>
            </div>
            <div className={`rounded-lg p-(--space-md) ${creditScoreConfig.bgColor}`}>
              <p className={`font-ubuntu text-lg font-semibold mb-1 ${creditScoreConfig.color}`}>
                {creditScoreConfig.label} Credit Score
              </p>
              <p className="font-roboto-slab text-sm text-text-colour-2">
                {creditScoreConfig.description}
              </p>
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="rounded-xl border border-input-border p-(--space-lg) bg-gray-bg">
              <p className="font-roboto-slab text-xs text-text-colour mb-2">Score Breakdown</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="font-roboto-slab text-sm text-text-colour-2">Poor</span>
                  <span className="font-roboto-slab text-sm text-muted-text">300-649</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-roboto-slab text-sm text-text-colour-2">Fair</span>
                  <span className="font-roboto-slab text-sm text-muted-text">650-699</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-roboto-slab text-sm text-text-colour-2">Good</span>
                  <span className="font-roboto-slab text-sm text-muted-text">700-749</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-roboto-slab text-sm text-text-colour-2">Excellent</span>
                  <span className="font-roboto-slab text-sm text-muted-text">750-850</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <h2 className="font-ubuntu mb-(--space-lg) text-xl font-semibold text-heading-colour">
          Credit Utilization
        </h2>
        <div className="mb-(--space-md)">
          <div className="flex items-center justify-between mb-2">
            <span className="font-roboto-slab text-sm text-text-colour">
              ₦{(financialProfile.creditLimit - financialProfile.availableCredit).toLocaleString()} of ₦{financialProfile.creditLimit.toLocaleString()} used
            </span>
            <span className="font-roboto-slab text-sm font-medium text-heading-colour">
              {creditUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                creditUtilization < 30 ? "bg-theme-green-dark" :
                creditUtilization < 50 ? "bg-blue-600" :
                creditUtilization < 75 ? "bg-yellow-600" : "bg-red-600"
              }`}
              style={{ width: `${creditUtilization}%` }}
            />
          </div>
        </div>
        <p className="font-roboto-slab text-sm text-text-colour">
          {creditUtilization < 30 ? "Excellent! Keep your utilization below 30% for the best credit score." :
           creditUtilization < 50 ? "Good utilization rate. Try to keep it below 30% for better credit." :
           creditUtilization < 75 ? "Consider paying down some balances to improve your credit score." :
           "High utilization. Pay down balances to improve your credit standing."}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl border border-input-border bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="flex items-center justify-between mb-(--space-lg)">
          <h2 className="font-ubuntu text-xl font-semibold text-heading-colour">
            Risk Assessment
          </h2>
          <span className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${riskConfig.bgColor} ${riskConfig.color}`}>
            <riskConfig.icon size={16} />
            {riskConfig.label}
          </span>
        </div>
        <div className="flex flex-col gap-(--space-md)">
          {financialProfile.riskAssessment.factors.map((factor, index) => {
            const ImpactIcon = getImpactIcon(factor.impact);
            const impactColor = factor.impact === "positive" ? "text-theme-green-dark" :
                               factor.impact === "negative" ? "text-red-600" : "text-text-colour";
            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-input-border p-(--space-md) cursor-default ease-in-out transition-all duration-300 hover:shadow-sm hover:scale-105"
              >
                <div className="flex items-center gap-(--space-md)">
                  <ImpactIcon size={20} className={impactColor} />
                  <span className="font-roboto-slab text-sm font-medium text-heading-colour">
                    {factor.factor}
                  </span>
                </div>
                <div className="flex items-center gap-(--space-md)">
                  <span className={`font-roboto-slab text-xs capitalize ${impactColor}`}>
                    {factor.impact}
                  </span>
                  <div className="h-2 w-20 rounded-full bg-gray-border overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.impact === "positive" ? "bg-theme-green-dark" :
                        factor.impact === "negative" ? "bg-red-600" : "bg-gray-600"
                      }`}
                      style={{ width: `${factor.weight * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-(--space-lg) rounded-lg bg-blue-50 p-(--space-md)">
          <p className="font-roboto-slab text-xs text-blue-800">
            Last assessed: {financialProfile.riskAssessment.lastAssessment.toLocaleDateString()} •
            Next review: {financialProfile.riskAssessment.nextReview.toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
  */
}
