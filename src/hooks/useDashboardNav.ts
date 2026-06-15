import { useMemo } from "react";
import type {
  DashboardConfig,
  EnhancedDashboardConfig,
  DashboardNavLink,
  FinancialFeature,
} from "~/types/index";
import {
  hasFinancialServices,
  isFinancialFeatureEnabled,
  getFinancialNavigationItems,
  shouldShowFinancialServices,
  getFinancialNavigationBadges,
  isFinancialNavItemVisible,
  getActiveFinancialNavItem,
} from "~/lib/financial-services";

interface UseDashboardNavReturn {
  config: DashboardConfig | EnhancedDashboardConfig;
  activeItem: string;
  activeFinancialItem: string;
  navigationItems: DashboardNavLink[];
  financialItems: DashboardNavLink[];
  financialBadges: Record<string, string>;
  isFinancialFeatureEnabled: (feature: FinancialFeature) => boolean;
  isFinancialNavItemVisible: (itemHref: string) => boolean;
  hasFinancialServices: boolean;
  shouldShowFinancialServices: boolean;
}

/**
 * Enhanced dashboard navigation hook that supports both regular and financial services navigation
 */
export function useDashboardNav(
  config: DashboardConfig | EnhancedDashboardConfig,
  pathname: string,
): UseDashboardNavReturn {
  const activeItem = useMemo(() => {
    // Find the active navigation item based on pathname
    const findActiveItem = (items: DashboardNavLink[]): string => {
      for (const item of items) {
        if (pathname === item.href) {
          return item.label;
        }
        if (item.submenu) {
          for (const subItem of item.submenu) {
            if (pathname === subItem.href) {
              return item.label; // Return parent item label for submenu items
            }
          }
        }
        // Check if pathname starts with item href (for nested routes)
        if (pathname.startsWith(item.href) && item.href !== "/") {
          return item.label;
        }
      }
      return "";
    };

    return findActiveItem(config.navLinks);
  }, [config.navLinks, pathname]);

  const activeFinancialItem = useMemo(() => {
    return getActiveFinancialNavItem(config, pathname);
  }, [config, pathname]);

  const navigationItems = useMemo(() => {
    return config.navLinks;
  }, [config.navLinks]);

  const financialItems = useMemo(() => {
    return getFinancialNavigationItems(config);
  }, [config]);

  const financialBadges = useMemo(() => {
    return getFinancialNavigationBadges(config);
  }, [config]);

  const checkFinancialFeature = useMemo(() => {
    return (feature: FinancialFeature) =>
      isFinancialFeatureEnabled(config, feature);
  }, [config]);

  const checkFinancialNavItemVisibility = useMemo(() => {
    return (itemHref: string) => isFinancialNavItemVisible(config, itemHref);
  }, [config]);

  const hasFinancialServicesEnabled = useMemo(() => {
    return hasFinancialServices(config);
  }, [config]);

  const shouldShowFinancialServicesForPath = useMemo(() => {
    return shouldShowFinancialServices(pathname);
  }, [pathname]);

  return {
    config,
    activeItem,
    activeFinancialItem,
    navigationItems,
    financialItems,
    financialBadges,
    isFinancialFeatureEnabled: checkFinancialFeature,
    isFinancialNavItemVisible: checkFinancialNavItemVisibility,
    hasFinancialServices: hasFinancialServicesEnabled,
    shouldShowFinancialServices: shouldShowFinancialServicesForPath,
  };
}
