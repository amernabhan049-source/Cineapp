"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserSession } from "@/lib/auth";

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (role: "USER" | "ADMIN") => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("cinebook_user_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setIsLoading(false);
          return;
        }
      }
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch (e) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("cinebook_user_session");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch (err) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const saveUserSession = (userObj: UserSession | null) => {
    setUser(userObj);
    if (typeof window !== "undefined") {
      if (userObj) {
        localStorage.setItem("cinebook_user_session", JSON.stringify(userObj));
      } else {
        localStorage.removeItem("cinebook_user_session");
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock / direct authentication fallback for static sites
      const role = email.toLowerCase().includes("admin") ? "ADMIN" : "USER";
      const userObj: UserSession = {
        id: role === "ADMIN" ? "u-admin-0001" : "u-customer-0001",
        email: email.trim().toLowerCase(),
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        role,
      };
      saveUserSession(userObj);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Login failed" };
    }
  };

  const loginDemo = async (role: "USER" | "ADMIN") => {
    try {
      const demoUser: UserSession =
        role === "ADMIN"
          ? {
              id: "u-admin-0001",
              email: "admin@cinebook.com",
              name: "CineBook Administrator",
              role: "ADMIN",
            }
          : {
              id: "u-customer-0001",
              email: "customer@cinebook.com",
              name: "Alex Morgan",
              role: "USER",
              phone: "(212) 555-0199",
            };
      saveUserSession(demoUser);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Demo login failed" };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      const newUser: UserSession = {
        id: `u-${Date.now()}`,
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        role: "USER",
        phone: formData.phone,
      };
      saveUserSession(newUser);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Registration failed" };
    }
  };

  const logout = async () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginDemo,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
