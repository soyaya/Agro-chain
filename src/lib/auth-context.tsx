"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser, DashboardType } from "~/types/index";
import { authService, type BackendUser } from "~/lib/services/auth.service";
import { ApiError } from "~/lib/api";
import { getDashboardPath, getDashboardSection } from "~/lib/dashboard-path";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  dashboardType: DashboardType;
  updateUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Always attempt getMe — the auth_token httpOnly cookie is sent automatically.
        // A 401 means no valid session, which is fine.
        const response = await authService.getMe();
        setUser(mapBackendUser(response.data.user));
      } catch (error) {
        // 401 = not logged in (expected)
        // status 0 = network error / backend not running (expected in dev)
        // anything else is unexpected — log it
        const isUnauthenticated = error instanceof ApiError && error.status === 401;
        const isExpected = isUnauthenticated || (error instanceof ApiError && error.status === 0);
        if (!isExpected) {
          console.error("Failed to fetch user session:", error);
        }
        setUser(null);
        if (isUnauthenticated && typeof document !== "undefined") {
          // The httpOnly access/refresh cookies are already gone or invalid server-side,
          // but the non-httpOnly `current_user` routing cookie (read by proxy.ts to decide
          // whether to bounce /login and /register away) can outlive the real session —
          // e.g. the account was deleted, or another device logged out all sessions.
          // Clear it here so the middleware stops treating this browser as authenticated.
          document.cookie = "current_user=; Max-Age=0; path=/";
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUser();
  }, []);

  // A stale session (cleared above) may have already let the middleware serve a
  // protected dashboard page for this request. Send the user to login instead of
  // leaving them on a dashboard that can never load real data.
  useEffect(() => {
    if (isLoading || user) return;
    const isDashboardRoute = /^\/(farmers|buyers|cluster|rider)-dashboard/.test(pathname);
    if (isDashboardRoute) {
      router.replace("/login");
    }
  }, [isLoading, user, pathname, router]);

  // A role change that happens mid-session (e.g. a farmer's cluster
  // application getting approved) doesn't retroactively fix a dashboard
  // section the user is already sitting on, a bookmark, or a stale
  // role-based routing cookie from their last login — this check runs on
  // every dashboard page load and self-corrects regardless of how they got
  // there. `getMe()` is the source of truth, not the URL.
  useEffect(() => {
    if (isLoading || !user) return;
    const currentSection = getDashboardSection(pathname);
    if (!currentSection) return;
    const correctSection = getDashboardPath(user);
    if (currentSection !== correctSection) {
      router.replace(correctSection);
    }
  }, [isLoading, user, pathname, router]);

  // Admin-invited accounts (riders) must replace their temporary password
  // before touching any dashboard, regardless of which page they land on.
  useEffect(() => {
    if (!isLoading && user?.mustSetPassword && pathname !== "/set-password") {
      router.replace("/set-password");
    }
  }, [isLoading, user, pathname, router]);

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      window.location.replace("/login");
    }
  };

  const getDashboardType = (): DashboardType => {
    if (!user) return "farmer";
    if (user.role === "admin") return "admin";
    if (user.role === "buyer") return "buyer";
    if (user.role === "rider") return "rider";
    if (user.isClusterFarmer) return "cluster-farmer";
    return "farmer";
  };

  const value: AuthContextType = {
    user,
    isLoading,
    dashboardType: getDashboardType(),
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function mapBackendUser(user: BackendUser): AuthUser {
  const mappedRole: AuthUser["role"] =
    user.role === "cluster" || user.role === "pending" ? "farmer" : user.role;

  return {
    id: user.id,
    fullName: user.full_name,
    phoneNumber: user.phone_number,
    email: user.email,
    role: mappedRole,
    isClusterFarmer: user.is_cluster_farmer || user.role === "cluster",
    profileComplete: user.profile_completed,
    mustSetPassword: user.must_set_password,
    riderApproved: user.rider_approved,
    locationState: user.location_state,
    locationLga: user.location_lga,
    locationWard: user.location_ward,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
