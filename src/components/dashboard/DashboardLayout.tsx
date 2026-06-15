"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import type { DashboardConfig, EnhancedDashboardConfig } from "~/types/index";
import { FADE_IN_VARIANT } from "~/types/constants";
import { useAuth } from "~/lib/auth-context";
import Onboarding from "~/components/Onboarding";
import {
  NotificationsBell,
  NotificationsPanel,
} from "~/components/notifications/NotificationsPanel";

interface DashboardLayoutProps {
  children: ReactNode;
  config: DashboardConfig | EnhancedDashboardConfig;
}

const ONBOARDING_STEPS: Record<
  string,
  { heading: string; description: string }[]
> = {
  farmer: [
    {
      heading: "Welcome to Agro-chain",
      description:
        "You're now part of Nigeria's verified catfish marketplace. Let's get your farm set up.",
    },
    {
      heading: "Complete Your Profile",
      description:
        "Add your farm name, location, fish type, and capacity so your cluster farmer can verify you.",
    },
    {
      heading: "Create Your First Listing",
      description:
        "Once your profile is complete, list your available fish supply. Your cluster farmer will review and approve it within 24–48 hours.",
    },
    {
      heading: "You're Ready",
      description:
        "After approval, your listing goes live on the marketplace. Sit back and earn.",
    },
  ],
  "cluster-farmer": [
    {
      heading: "Welcome, Cluster Farmer",
      description:
        "You manage farmers and fulfill orders on Agro-chain. Here's a quick overview.",
    },
    {
      heading: "Manage Your Farmers",
      description:
        "Farmers in your area are assigned to you. Review and approve their supply listings from the Pending Approvals page.",
    },
    {
      heading: "List on the Marketplace",
      description:
        "Once you approve farmer supply, create marketplace listings on their behalf. Buyers order directly from you.",
    },
    {
      heading: "Fulfill Orders",
      description:
        "When orders come in, process, pack, and ship. Update order status in your dashboard as it progresses.",
    },
  ],
  buyer: [
    {
      heading: "Welcome to Agro-chain",
      description:
        "Browse and buy verified catfish directly from cluster farmers across Nigeria.",
    },
    {
      heading: "Browse the Marketplace",
      description:
        "All listings show verified sellers, fish type, weight, and admin-set pricing. No surprises.",
    },
    {
      heading: "Secure Checkout",
      description:
        "Pay via Paystack. Funds are held in escrow until you confirm delivery — your money is protected.",
    },
    {
      heading: "You're Ready to Buy",
      description:
        "Head to the marketplace and place your first order. Contact support if you need help.",
    },
  ],
  admin: [
    {
      heading: "Admin Panel",
      description:
        "You have full platform access. Manage users, listings, orders, and pricing from here.",
    },
    {
      heading: "Set Fish Prices",
      description:
        "All marketplace prices are derived from your per-kg config in Settings. Update them anytime.",
    },
    {
      heading: "Approve Cluster Applications",
      description:
        "Review and approve cluster farmer applications under Cluster Applications.",
    },
    {
      heading: "You're Set",
      description:
        "Monitor the platform health from Analytics and act on any flagged items.",
    },
  ],
};

export function DashboardLayout({ children, config }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { logout, user, dashboardType } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (user.profileComplete) return;
    const key = `onboarding_done_${user.id}`;
    if (!localStorage.getItem(key)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingFinish = () => {
    if (user?.id) {
      localStorage.setItem(`onboarding_done_${user.id}`, "1");
    }
    setShowOnboarding(false);
  };

  const displayName = user?.fullName ?? "User";
  const roleLabel = user?.isClusterFarmer
    ? "Cluster Farmer"
    : user?.role === "buyer"
      ? "Buyer"
      : user?.role === "admin"
        ? "Admin"
        : "Farmer";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleLogout = () => void logout();

  const onboardingSteps =
    ONBOARDING_STEPS[dashboardType] ?? ONBOARDING_STEPS.buyer;

  return (
    <div className="bg-gray-bg relative min-h-screen w-full">
      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-(--black)/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              className="border-gray-border relative mx-4 w-full max-w-lg rounded-3xl border bg-(--white) shadow-2xl"
            >
              <button
                onClick={handleOnboardingFinish}
                className="text-muted-text hover:bg-gray-bg hover:text-text-colour absolute top-4 right-4 rounded-full p-2 transition-colors"
                aria-label="Skip onboarding"
              >
                <X size={18} />
              </button>
              <Onboarding
                steps={onboardingSteps}
                onFinish={handleOnboardingFinish}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 cursor-pointer bg-(--black)/50 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="relative h-full w-full">
        <div className="relative mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{
              x: isSidebarOpen ? 0 : "-100%",
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "border-gray-border/50 fixed top-0 left-0 z-50 flex h-full min-h-screen w-full max-w-70 flex-col border-r bg-(--white)/95 shadow-xl backdrop-blur-sm lg:sticky lg:shadow-none",
              "lg:translate-x-70",
            )}
          >
            {/* Sidebar Header */}
            <div className="border-gray-border/50 flex items-center justify-between border-b px-(--space-base) py-(--space-lg) sm:px-(--space-xl)">
              <Link
                href="/"
                className="font-ubuntu text-theme-green-dark text-2xl font-bold transition-colors hover:opacity-80"
                aria-label="Go to home"
              >
                AgroChain
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="hover:bg-gray-bg rounded-lg p-2 transition-colors lg:hidden"
                aria-label="Close sidebar"
              >
                <X size={20} className="text-text-colour" />
              </button>
            </div>

            {/* Dashboard Title */}
            {/* <div className="border-b border-gray-border/50 bg-linear-to-br from-green-50/50 to-transparent px-6 py-5">
              <h2 className="font-ubuntu text-lg font-bold text-heading-colour">{config.title}</h2>
              <p className="font-roboto-slab mt-1 text-sm text-text-colour">{config.description}</p>
            </div> */}

            {/* Navigation Links */}
            <nav
              className="flex-1 overflow-y-auto px-4 py-6"
              role="navigation"
              aria-label="Dashboard navigation"
            >
              <ul className="flex flex-col gap-2">
                {config.navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  const hasSubmenu = link.submenu && link.submenu.length > 0;
                  const isSubmenuActive =
                    hasSubmenu &&
                    link.submenu?.some((subLink) => pathname === subLink.href);
                  const isParentActive = isActive || isSubmenuActive;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "font-roboto-slab group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isParentActive
                            ? "bg-theme-green-dark cursor-default text-white"
                            : "text-text-colour-2 hover:bg-gray-bg hover:text-heading-colour cursor-pointer",
                        )}
                        aria-current={isParentActive ? "page" : undefined}
                      >
                        <Icon
                          size={20}
                          className={cn(
                            isParentActive
                              ? "text-white"
                              : "text-muted-text group-hover:text-text-colour-2",
                          )}
                        />
                        <span className="flex-1">{link.label}</span>
                        {isParentActive && <ChevronRight size={16} />}
                      </Link>

                      {/* Submenu */}
                      {hasSubmenu && (
                        <ul className="mt-2 ml-6 space-y-1">
                          {link.submenu?.map((subLink) => {
                            const SubIcon = subLink.icon;
                            const isSubActive = pathname === subLink.href;

                            return (
                              <li key={subLink.href}>
                                <Link
                                  href={subLink.href}
                                  onClick={() => setIsSidebarOpen(false)}
                                  className={cn(
                                    "font-roboto-slab group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                    isSubActive
                                      ? "bg-green-tint text-theme-green-dark cursor-default"
                                      : "text-text-colour hover:bg-gray-bg hover:text-heading-colour cursor-pointer",
                                  )}
                                  aria-current={
                                    isSubActive ? "page" : undefined
                                  }
                                >
                                  <SubIcon
                                    size={16}
                                    className={cn(
                                      isSubActive
                                        ? "text-theme-green-dark"
                                        : "text-muted-text group-hover:text-text-colour",
                                    )}
                                  />
                                  <span className="flex-1">
                                    {subLink.label}
                                  </span>
                                  {subLink.badge && (
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                      {subLink.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="border-gray-border/50 border-t px-4 py-5">
              <button
                onClick={handleLogout}
                className={cn(
                  "font-roboto-slab flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  "text-error-red hover:bg-red-50 hover:text-red-700",
                  "focus:ring-1 focus:ring-red-500 focus:ring-offset-2 focus:outline-none",
                )}
                aria-label="Logout"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="relative flex min-h-screen w-full flex-col">
            {/* Header - Always visible */}
            <header className="border-gray-border/50 sticky top-0 z-30 border-b bg-(--white)/80 shadow-sm backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-(--space-base) py-(--space-sm)">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="hover:bg-gray-bg cursor-pointer rounded-lg p-2 transition-colors lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <Menu size={24} className="text-text-colour-2" />
                  </button>
                  <div>
                    <h1 className="font-ubuntu text-heading-colour text-xl font-bold lg:text-2xl">
                      {config.title}
                    </h1>
                    <p className="font-roboto-slab text-text-colour hidden text-sm sm:block">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <div className="relative">
                    <NotificationsBell
                      onClick={() => setNotifOpen((o) => !o)}
                    />
                    <NotificationsPanel
                      isOpen={notifOpen}
                      onClose={() => setNotifOpen(false)}
                    />
                  </div>

                  {/* User Profile */}
                  <div className="hover:bg-gray-bg flex cursor-pointer items-center gap-3 rounded-full px-3 py-2 transition-colors">
                    <div className="relative">
                      <div className="font-ubuntu bg-theme-green-dark flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white">
                        <span>{initials || "U"}</span>
                      </div>
                      <div className="bg-theme-green-light absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="font-roboto-slab text-heading-colour text-sm font-medium">
                        {displayName}
                      </p>
                      <p className="font-roboto-slab text-text-colour text-xs">
                        {roleLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <motion.main
              initial="hidden"
              animate="visible"
              variants={FADE_IN_VARIANT}
              transition={{ duration: 0.3 }}
              className="relative w-full flex-1 p-(--space-base)"
            >
              {children}
            </motion.main>

            {/* Footer */}
            <footer className="border-gray-border/50 mx-auto w-full max-w-7xl border-t bg-(--white)/50 p-(--space-xl) backdrop-blur-sm">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="font-roboto-slab text-text-colour text-sm">
                  © 2024 AgroChain. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <Link
                    href="/privacy"
                    className="font-roboto-slab text-text-colour hover:text-heading-colour text-sm transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="font-roboto-slab text-text-colour hover:text-heading-colour text-sm transition-colors"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/support"
                    className="font-roboto-slab text-text-colour hover:text-heading-colour text-sm transition-colors"
                  >
                    Support
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
