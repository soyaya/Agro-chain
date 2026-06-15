/**
 * Demonstration of the enhanced useDashboardNav hook
 * This file shows how to use the extended navigation functionality
 */

import { useDashboardNav } from "../hooks/useDashboardNav";
import {
  enhancedFarmerDashboardConfig,
  buyerDashboardConfig,
} from "../models/models";

// Example usage for farmer dashboard with financial services
function FarmerDashboardExample() {
  const pathname = "/farmers-dashboard/financial/loans";
  const nav = useDashboardNav(enhancedFarmerDashboardConfig, pathname);

  console.log("Navigation Demo Results:");
  console.log("Active Item:", nav.activeItem); // "Financial Services"
  console.log("Active Financial Item:", nav.activeFinancialItem); // "Loan Applications"
  console.log("Has Financial Services:", nav.hasFinancialServices); // true
  console.log(
    "Should Show Financial Services:",
    nav.shouldShowFinancialServices,
  ); // true
  console.log("Financial Items Count:", nav.financialItems.length); // > 0
  console.log("Loans Feature Enabled:", nav.isFinancialFeatureEnabled("loans")); // true
  console.log(
    "Credit Feature Enabled:",
    nav.isFinancialFeatureEnabled("credit"),
  ); // true

  return nav;
}

// Example usage for buyer dashboard (no financial services)
function BuyerDashboardExample() {
  const pathname = "/buyers-dashboard";
  const nav = useDashboardNav(buyerDashboardConfig, pathname);

  console.log("Buyer Dashboard Results:");
  console.log("Has Financial Services:", nav.hasFinancialServices); // false
  console.log("Financial Items Count:", nav.financialItems.length); // 0
  console.log(
    "Should Show Financial Services:",
    nav.shouldShowFinancialServices,
  ); // false

  return nav;
}

export { FarmerDashboardExample, BuyerDashboardExample };
