"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import type { DashboardConfig, EnhancedDashboardConfig } from "~/types/index";
import { FADE_IN_VARIANT } from "~/types/constants";

interface DashboardLayoutProps {
  children: ReactNode;
  config: DashboardConfig | EnhancedDashboardConfig;
}

export function DashboardLayout({ children, config }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-gray-50 via-white to-gray-100">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-br from-green-400 to-blue-500 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-tr from-purple-400 to-pink-500 blur-3xl"
        />
      </div>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 cursor-pointer z-40 bg-(--black)/50 backdrop-blur-sm lg:hidden"
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
            <div className="flex items-center justify-between border-b border-gray-200/50 px-(--space-base) sm:px-(--space-xl) py-(--space-lg)">
              <Link
                href="/"
                className="font-ubuntu bg-linear-to-r from-green-600 to-green-800 bg-clip-text text-2xl font-bold text-transparent transition-all hover:from-green-700 hover:to-green-900"
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
                  const isSubmenuActive = hasSubmenu && link.submenu?.some(subLink => pathname === subLink.href);
                  const isParentActive = isActive || isSubmenuActive;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "font-roboto-slab group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isParentActive
                            ? "bg-linear-to-r cursor-default from-green-600 to-green-700 text-white shadow-lg shadow-green-600/30"
                            : "text-gray-700 cursor-pointer hover:bg-gray-100 hover:text-gray-900",
                        )}
                        aria-current={isParentActive ? "page" : undefined}
                      >
                        {isParentActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-xl bg-linear-to-r from-green-600 to-green-700"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <Icon
                          size={20}
                          className={cn(
                            "relative z-10 group-hover:scale-105 transition-all ease-in-out duration-300",
                            isParentActive ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                          )}
                        />
                        <span className="relative z-10 flex-1">{link.label}</span>
                        {isParentActive && <ChevronRight size={16} className="relative z-10" />}
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
                                      ? "bg-green-100 text-green-800 cursor-default"
                                      : "text-gray-600 cursor-pointer hover:bg-gray-50 hover:text-gray-800"
                                  )}
                                  aria-current={isSubActive ? "page" : undefined}
                                >
                                  <SubIcon size={16} className={cn(isSubActive ? "text-green-700" : "text-gray-400 group-hover:text-gray-600")} />
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
            <div className="border-t border-gray-200/50 bg-linear-to-br from-red-50/30 to-transparent px-4 py-5">
              <button
                onClick={handleLogout}
                className={cn(
                  "font-roboto-slab flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  "text-(--error-red) hover:bg-red-50 hover:text-red-700",
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
                    className="rounded-lg p-2 cursor-pointer transition-colors hover:bg-gray-100 lg:hidden"
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
                      <div className="font-ubuntu flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-green-600 to-green-800 text-sm font-semibold text-white">
                        {/* Placeholder - will show initials or uploaded image */}
                        <span>JD</span>
                      </div>
                      <div className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    </div>

                    {/* User Name - Hidden on mobile */}
                    <div className="hidden lg:block">
                      <p className="font-roboto-slab text-sm font-medium text-gray-900">John Doe</p>
                      <p className="font-roboto-slab text-xs text-gray-600">Farmer</p>
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