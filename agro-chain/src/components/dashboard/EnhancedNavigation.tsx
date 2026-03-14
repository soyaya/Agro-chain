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
        <h3 className="text-sm font-medium text-gray-900 mb-3">Dashboard</h3>
        <nav className="space-y-1">
          {nav.navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = nav.activeItem === item.label;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-100 text-green-900"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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
          <h3 className="text-sm font-medium text-gray-900 mb-3">Financial Services</h3>
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
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {nav.financialBadges[item.href] && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
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
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Financial Features</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Loans:</span>
              <span className={nav.isFinancialFeatureEnabled('loans') ? 'text-green-600' : 'text-gray-400'}>
                {nav.isFinancialFeatureEnabled('loans') ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Credit:</span>
              <span className={nav.isFinancialFeatureEnabled('credit') ? 'text-green-600' : 'text-gray-400'}>
                {nav.isFinancialFeatureEnabled('credit') ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payments:</span>
              <span className={nav.isFinancialFeatureEnabled('payments') ? 'text-green-600' : 'text-gray-400'}>
                {nav.isFinancialFeatureEnabled('payments') ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}