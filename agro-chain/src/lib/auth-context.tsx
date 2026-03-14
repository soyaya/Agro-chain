"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AuthUser, DashboardType } from "~/types/index";

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
    // Fetch user data from API or localStorage
    const fetchUser = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/me');
        // const data = await response.json();
        
        // Mock user data for now
        const mockUser: AuthUser = {
          id: "1",
          fullName: "John Doe",
          phoneNumber: "+234 801 234 5678",
          email: "john.doe@example.com",
          role: "farmer",
          isClusterFarmer: false,
          profileComplete: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setUser(mockUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
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
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
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

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  
  return context;
}
