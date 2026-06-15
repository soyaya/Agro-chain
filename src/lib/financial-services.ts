import type {
  EnhancedDashboardConfig,
  FinancialFeature,
  DashboardConfig,
} from "~/types/index";

/**
 * Check if a dashboard configuration has financial services enabled
 */
export function hasFinancialServices(
  config: DashboardConfig | EnhancedDashboardConfig,
): config is EnhancedDashboardConfig {
  return (
    "financialServices" in config && config.financialServices !== undefined
  );
}

/**
 * Check if a specific financial feature is enabled for a dashboard configuration
 */
export function isFinancialFeatureEnabled(
  config: DashboardConfig | EnhancedDashboardConfig,
  feature: FinancialFeature,
): boolean {
  if (!hasFinancialServices(config) || !config.financialServices?.enabled) {
    return false;
  }

  const { loanServices, creditServices } = config.financialServices;

  switch (feature) {
    case "loans":
      return (
        loanServices.applicationEnabled ||
        loanServices.trackingEnabled ||
        loanServices.historyEnabled
      );
    case "credit":
      return (
        creditServices.purchaseEnabled ||
        creditServices.catalogEnabled ||
        creditServices.paymentTrackingEnabled
      );
    case "payments":
      return (
        loanServices.historyEnabled || creditServices.paymentTrackingEnabled
      );
    case "profile":
      return true; // Always available if financial services are enabled
    default:
      return false;
  }
}

/**
 * Get financial navigation items based on configuration
 */
export function getFinancialNavigationItems(
  config: DashboardConfig | EnhancedDashboardConfig,
) {
  if (!hasFinancialServices(config)) {
    return [];
  }

  // Find the financial services navigation item and return its submenu items
  const financialNavItem = config.navLinks.find(
    (link) =>
      link.href.includes("/financial") || link.label === "Financial Services",
  );

  if (financialNavItem && financialNavItem.submenu) {
    return financialNavItem.submenu;
  }

  // Fallback: return any navigation items that contain 'financial' in the href
  return config.navLinks.filter(
    (link) =>
      link.href.includes("/financial") ||
      (link.submenu &&
        link.submenu.some((subLink) => subLink.href.includes("/financial"))),
  );
}

/**
 * Check if financial services should be displayed for a given pathname
 */
export function shouldShowFinancialServices(pathname: string): boolean {
  // Only show financial services for farmer and cluster farmer dashboards
  return (
    pathname.startsWith("/farmers-dashboard") ||
    pathname.startsWith("/cluster-dashboard")
  );
}

/**
 * Get financial navigation badges based on current state
 * This would typically integrate with real-time data in a production app
 */
export function getFinancialNavigationBadges(
  config: DashboardConfig | EnhancedDashboardConfig,
): Record<string, string> {
  if (!hasFinancialServices(config)) {
    return {};
  }

  // In a real application, these would be fetched from APIs
  // For now, return empty badges - can be extended later
  return {};
}

/**
 * Check if a specific financial navigation item should be visible
 */
export function isFinancialNavItemVisible(
  config: DashboardConfig | EnhancedDashboardConfig,
  itemHref: string,
): boolean {
  if (!hasFinancialServices(config) || !config.financialServices?.enabled) {
    return false;
  }

  const { loanServices, creditServices } = config.financialServices;

  // Check specific navigation items based on their href
  if (itemHref.includes("/loans")) {
    return (
      loanServices.applicationEnabled ||
      loanServices.trackingEnabled ||
      loanServices.historyEnabled
    );
  }

  if (itemHref.includes("/credit")) {
    return creditServices.purchaseEnabled || creditServices.catalogEnabled;
  }

  if (itemHref.includes("/payments")) {
    return loanServices.historyEnabled || creditServices.paymentTrackingEnabled;
  }

  if (itemHref.includes("/profile")) {
    return true; // Always visible if financial services are enabled
  }

  // Default to visible for other financial items
  return true;
}

/**
 * Get the active financial navigation item based on pathname
 */
export function getActiveFinancialNavItem(
  config: DashboardConfig | EnhancedDashboardConfig,
  pathname: string,
): string {
  if (!hasFinancialServices(config)) {
    return "";
  }

  const financialItems = getFinancialNavigationItems(config);

  for (const item of financialItems) {
    if (pathname === item.href) {
      return item.label;
    }
    // Check if pathname starts with item href (for nested routes)
    if (pathname.startsWith(item.href) && item.href !== "/") {
      return item.label;
    }
  }

  return "";
}
