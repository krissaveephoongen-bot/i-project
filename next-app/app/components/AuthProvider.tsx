"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "employee";
  department?: string;
  position?: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name?: string,
    role?: "admin" | "manager" | "employee",
  ) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Toggle mock auth for development/verification when DB is not available
const USE_MOCK = false;

export function useAuth() {
  const context = useContext(AuthContext);
  if (context !== undefined) return context;
  const fallback: AuthContextType = {
    user: null,
    profile: null,
    loading: false,
    signIn: async (email: string, password: string, rememberMe = false) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Login failed");
      }
      const data = await response.json();
      if (rememberMe) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("remembered_email", email);
      } else {
        sessionStorage.setItem("auth_token", data.token);
        localStorage.removeItem("remembered_email");
      }
    },
    signUp: async (email, password, name, role = "employee") => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Register failed");
      }
      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
    },
    signOut: async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
    },
    forgotPassword: async (email: string) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to send password reset email");
      }
    },
  };
  return fallback;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkUser = async () => {
      try {
        if (USE_MOCK) {
          // Simulate a logged-in user for dev/demo
          const mockUser: User = {
            id: "mock-user-1",
            email: "demo@example.com",
            name: "Demo User",
            role: "manager",
          };
          setUser(mockUser);
          setLoading(false);
          return;
        }

        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token");
        const rememberedEmail = localStorage.getItem("remembered_email");

        if (token) {
          // Verify token with backend
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setProfile(data.profile || null);
          } else {
            // Token invalid, remove it
            localStorage.removeItem("auth_token");
          }
        }

        // Store remembered email for login form
        if (rememberedEmail) {
          // This will be used by the login component
          window.dispatchEvent(
            new CustomEvent("rememberedEmail", { detail: rememberedEmail }),
          );
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false,
  ) => {
    if (USE_MOCK) {
      const mockUser: User = {
        id: "mock-user-1",
        email,
        name: "Demo User",
        role: "manager",
      };
      setUser(mockUser);
      if (rememberMe) localStorage.setItem("auth_token", "mock-token");
      else sessionStorage.setItem("auth_token", "mock-token");
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();

    // Store token and user
    if (rememberMe) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("remembered_email", email);
    } else {
      sessionStorage.setItem("auth_token", data.token);
      localStorage.removeItem("remembered_email");
    }

    setUser(data.user);
    setProfile(data.profile || null);
  };

  const signOut = async () => {
    if (USE_MOCK) {
      setUser(null);
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      return;
    }

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }

    // Clear local storage and state
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    setUser(null);
    setProfile(null);
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string,
    role: "admin" | "manager" | "employee" = "employee",
  ) => {
    if (USE_MOCK) {
      const mockUser: User = {
        id: `mock-user-${Date.now()}`,
        email,
        name: name || "New User",
        role,
      };
      setUser(mockUser);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Register failed");
    }
    const data = await response.json();
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
    setProfile(data.profile || null);
  };

  const forgotPassword = async (email: string) => {
    if (USE_MOCK) return;

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send password reset email");
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
