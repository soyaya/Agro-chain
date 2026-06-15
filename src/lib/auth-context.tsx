"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { AuthUser, DashboardType } from "~/types/index";
import { authService, type BackendUser } from "~/lib/services/auth.service";
import { ApiError } from "~/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  dashboardType: DashboardType;
  updateUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readCurrentUserCookie(): AuthUser | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(/(?:^|; )current_user=([^;]*)/);
    if (!match) return null;
    const parsed = JSON.parse(decodeURIComponent(match[1]!)) as {
      id?: string;
      role?: string;
      fullName?: string;
      isClusterFarmer?: boolean;
    };
    if (!parsed.role) return null;
    const mappedRole = (
      parsed.role === "cluster" || parsed.role === "pending"
        ? "farmer"
        : parsed.role
    ) as AuthUser["role"];
    return {
      id: parsed.id ?? "",
      fullName: parsed.fullName ?? "",
      phoneNumber: "",
      email: "",
      role: mappedRole,
      isClusterFarmer: parsed.isClusterFarmer ?? false,
      profileComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Seed from cookie immediately so the header never flashes "User"
  const [user, setUser] = useState<AuthUser | null>(readCurrentUserCookie);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieUser = readCurrentUserCookie();

    const fetchUser = async () => {
      try {
        // Always attempt getMe - the auth_token httpOnly cookie is sent automatically.
        // A 401 means no valid session, which is fine.
        const response = await authService.getMe();
        setUser(mapBackendUser(response.data.user));
      } catch (error) {
        // 401 = not logged in (expected)
        // status 0 = network error / backend not running (expected in dev)
        // anything else is unexpected - log it
        const isExpected =
          error instanceof ApiError &&
          (error.status === 401 || error.status === 0);
        if (!isExpected) {
          console.error("Failed to fetch user session:", error);
        }
        // Only clear if we couldn't get a cookie fallback either
        if (!cookieUser) setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUser();
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

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
