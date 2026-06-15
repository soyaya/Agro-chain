/**
 * Example component showing how to use the enhanced navigation hook
 * This component demonstrates financial services navigation integration
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDashboardNav } from "~/hooks/useDashboardNav";
import type { DashboardConfig, EnhancedDashboardConfig } from "~/types/index";
import { cn } from "~/lib/utils";

interface EnhancedNavigationProps {
  config: DashboardConfig | EnhancedDashboardConfig;
}

export function EnhancedNavigation({ config }: EnhancedNavigationProps) {
  const pathname = usePathname();
  const nav = useDashboardNav(config, pathname);

  return (
    <div className="space-y-6">
      {/* Standard Navigation */}
      <div>
        <h3 className="text-heading-colour mb-3 text-sm font-medium">
          Dashboard
        </h3>
        <nav className="space-y-1">
          {nav.navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = nav.activeItem === item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-tint text-heading-colour"
                    : "text-text-colour-2 hover:bg-gray-bg",
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Financial Services Navigation */}
      {nav.hasFinancialServices && nav.shouldShowFinancialServices && (
        <div>
          <h3 className="text-heading-colour mb-3 text-sm font-medium">
            Financial Services
          </h3>
          <nav className="space-y-1">
            {nav.financialItems.map((item) => {
              const Icon = item.icon;
              const isActive = nav.activeFinancialItem === item.label;
              const isVisible = nav.isFinancialNavItemVisible(item.href);

              if (!isVisible) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-text-colour-2 hover:bg-gray-bg",
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {nav.financialBadges[item.href] && (
                    <span className="ml-auto rounded-full bg-orange-500 px-2 py-1 text-xs text-white">
                      {nav.financialBadges[item.href]}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Feature Status Display */}
      {nav.hasFinancialServices && (
        <div className="border-gray-border border-t pt-4">
          <h4 className="text-muted-text mb-2 text-xs font-medium">
            Financial Features
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Loans:</span>
              <span
                className={
                  nav.isFinancialFeatureEnabled("loans")
                    ? "text-theme-green-dark"
                    : "text-muted-text"
                }
              >
                {nav.isFinancialFeatureEnabled("loans")
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Credit:</span>
              <span
                className={
                  nav.isFinancialFeatureEnabled("credit")
                    ? "text-theme-green-dark"
                    : "text-muted-text"
                }
              >
                {nav.isFinancialFeatureEnabled("credit")
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payments:</span>
              <span
                className={
                  nav.isFinancialFeatureEnabled("payments")
                    ? "text-theme-green-dark"
                    : "text-muted-text"
                }
              >
                {nav.isFinancialFeatureEnabled("payments")
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
