"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AuthUser, DashboardType } from "~/types/index";
import { authService, type BackendUser } from "~/lib/services/auth.service";

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

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        const backendUser = response.data.user;
        const mapped = mapBackendUser(backendUser);
        setUser(mapped);
        localStorage.setItem("auth_user", JSON.stringify(backendUser));
      } catch (error) {
        sessionStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token") ?? undefined;
      await authService.logout(refreshToken).catch(() => null);
    } finally {
      sessionStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("refresh_token");
      document.cookie = "currentUser=; path=/; max-age=0; samesite=lax";
      setUser(null);
      window.location.replace("/login");
    }
  };

  // Determine dashboard type based on user role and pathname
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
