"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import type { DashboardConfig, EnhancedDashboardConfig } from "~/types/index";
import { FADE_IN_VARIANT } from "~/types/constants";
import { useAuth } from "~/lib/auth-context";

interface DashboardLayoutProps {
  children: ReactNode;
  config: DashboardConfig | EnhancedDashboardConfig;
}

export function DashboardLayout({ children, config }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { logout, user } = useAuth();

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

  return (
    <div className="relative min-h-screen w-full bg-gray-50">
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
              "fixed top-0 left-0 z-50 flex h-full min-h-screen w-full max-w-70 flex-col border-r border-gray-200/50 bg-(--white)/95 shadow-xl backdrop-blur-sm lg:sticky lg:shadow-none",
              "lg:translate-x-70",
            )}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-gray-200/50 px-(--space-base) py-(--space-lg) sm:px-(--space-xl)">
              <Link
                href="/"
                className="font-ubuntu text-2xl font-bold text-green-700 transition-colors hover:text-green-800"
                aria-label="Go to home"
              >
                AgroChain
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
                aria-label="Close sidebar"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Dashboard Title */}
            {/* <div className="border-b border-gray-200/50 bg-linear-to-br from-green-50/50 to-transparent px-6 py-5">
              <h2 className="font-ubuntu text-lg font-bold text-gray-900">{config.title}</h2>
              <p className="font-roboto-slab mt-1 text-sm text-gray-600">{config.description}</p>
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
                    hasSubmenu && link.submenu?.some((subLink) => pathname === subLink.href);
                  const isParentActive = isActive || isSubmenuActive;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "font-roboto-slab group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isParentActive
                            ? "cursor-default bg-green-700 text-white"
                            : "cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                        aria-current={isParentActive ? "page" : undefined}
                      >
                        <Icon
                          size={20}
                          className={cn(
                            isParentActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-gray-700",
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
                                      ? "cursor-default bg-green-100 text-green-800"
                                      : "cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                                  )}
                                  aria-current={isSubActive ? "page" : undefined}
                                >
                                  <SubIcon
                                    size={16}
                                    className={cn(
                                      isSubActive
                                        ? "text-green-700"
                                        : "text-gray-400 group-hover:text-gray-600",
                                    )}
                                  />
                                  <span className="flex-1">{subLink.label}</span>
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
            <div className="border-t border-gray-200/50 px-4 py-5">
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
            <header className="sticky top-0 z-30 border-b border-gray-200/50 bg-(--white)/80 shadow-sm backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-(--space-base) py-(--space-sm)">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <Menu size={24} className="text-gray-700" />
                  </button>
                  <div>
                    <h1 className="font-ubuntu text-xl font-bold text-gray-900 lg:text-2xl">
                      {config.title}
                    </h1>
                    <p className="font-roboto-slab hidden text-sm text-gray-600 sm:block">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Header Actions - User Profile */}
                <div className="flex items-center gap-3">
                  <div className="flex cursor-pointer items-center gap-3 rounded-full px-3 py-2 transition-colors hover:bg-gray-100">
                    {/* User Avatar */}
                    <div className="relative">
                      <div className="font-ubuntu flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-green-700 text-sm font-semibold text-white">
                        <span>{initials || "U"}</span>
                      </div>
                      <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    </div>

                    {/* User Name - Hidden on mobile */}
                    <div className="hidden lg:block">
                      <p className="font-roboto-slab text-sm font-medium text-gray-900">
                        {displayName}
                      </p>
                      <p className="font-roboto-slab text-xs text-gray-600">{roleLabel}</p>
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
            <footer className="mx-auto w-full max-w-7xl border-t border-gray-200/50 bg-(--white)/50 p-(--space-xl) backdrop-blur-sm">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="font-roboto-slab text-sm text-gray-600">
                  © 2024 AgroChain. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <Link
                    href="/privacy"
                    className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/support"
                    className="font-roboto-slab text-sm text-gray-600 transition-colors hover:text-gray-900"
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
