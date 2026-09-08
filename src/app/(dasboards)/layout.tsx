"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/DashboardLayout";
import { CartProvider } from "~/components/marketplace/useCart";
import {
  buyerDashboardConfig,
  enhancedFarmerDashboardConfig,
  enhancedClusterFarmerDashboardConfig,
  riderDashboardConfig,
} from "~/models/models";

interface DashboardsLayoutProps {
  children: ReactNode;
}

export default function DashboardsLayout({ children }: DashboardsLayoutProps) {
  const pathname = usePathname();

  // Determine which dashboard config to use based on pathname
  let config = enhancedFarmerDashboardConfig; // Default to enhanced farmer config

  if (pathname.startsWith("/cluster-dashboard")) {
    config = enhancedClusterFarmerDashboardConfig;
  } else if (pathname.startsWith("/buyers-dashboard")) {
    config = buyerDashboardConfig;
  } else if (pathname.startsWith("/farmers-dashboard")) {
    config = enhancedFarmerDashboardConfig;
  } else if (pathname.startsWith("/rider-dashboard")) {
    config = riderDashboardConfig;
  }

  return (
    <CartProvider>
      <DashboardLayout config={config}>{children}</DashboardLayout>
    </CartProvider>
  );
}
