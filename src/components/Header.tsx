"use client";

import Link from "next/link";
import { ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import AppLogo from "./AppLogo";
import { useAuth } from "~/lib/auth-context";
import { useCart } from "~/components/marketplace/useCart";
import type { DashboardType } from "~/types/index";

const DASHBOARD_PATHS: Record<DashboardType, string> = {
  farmer: "/farmers-dashboard",
  buyer: "/buyers-dashboard",
  "cluster-farmer": "/cluster-dashboard",
  // Admin accounts have no dashboard in this app — see agrochain_admin.
  admin: "/login",
  rider: "/rider-dashboard",
};

export default function Header() {
  const { user, dashboardType, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="border-border/40 sticky top-0 left-0 z-50 w-full border-b bg-linear-to-b from-(--navbar-bg) to-(--navbar-bg)/10 backdrop-blur-sm supports-backdrop-filter:bg-(--navbar-bg)/60">
      <div className="mx-auto flex h-(--navbar-h) w-full max-w-7xl items-center justify-between gap-4 px-(--section-px) sm:px-(--section-px-sm) lg:px-(--section-px-lg)">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo />
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/marketplace"
            className="font-inter text-sm font-semibold text-(--text-colour) transition hover:text-(--theme-green-dark)"
          >
            Marketplace
          </Link>

          <Link
            href="/marketplace"
            aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-(--text-colour) transition hover:bg-black/5"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-(--theme-green-dark) text-xs font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={DASHBOARD_PATHS[dashboardType]}
                className="flex items-center gap-2 rounded-full border border-(--border-gray) px-4 py-2 text-sm font-semibold text-(--theme-green-dark) transition hover:bg-(--theme-green-dark) hover:text-white"
              >
                <UserIcon size={16} />
                Dashboard
              </Link>
              <button
                onClick={() => void logout()}
                aria-label="Logout"
                className="flex h-10 w-10 items-center justify-center rounded-full text-(--text-colour) transition hover:bg-black/5"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-(--border-gray) px-4 py-2 text-sm font-semibold text-(--text-colour) transition hover:bg-black/5"
              >
                Log In
              </Link>
              <Link
                href="/authentication"
                className="rounded-full bg-(--theme-green-dark) px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
