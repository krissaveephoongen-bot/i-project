"use client";

// ============================================================
// AuthProvider.tsx
// ============================================================
// Responsibilities:
//   • Hold the authenticated user + profile in React state
//   • Restore session on page load (reads JWT from storage,
//     verifies it with /api/auth/verify)
//   • Expose signIn / signUp / signOut / forgotPassword /
//     resetPassword to the rest of the app
//   • Store tokens in localStorage (rememberMe) or
//     sessionStorage (session-only)
//
// What changed vs the original:
//   • Removed USE_MOCK flag and all mock branches — dev
//     workflows should use a real local DB or a .env.local
//     with Supabase credentials
//   • `profile` field typed as AuthProfile | null, not `any`
//   • Token storage now handles the new { tokens: { accessToken,
//     refreshToken, expiresIn } } response shape from the API
//   • Added resetPassword() to the context
//   • Auth token key renamed from "auth_token" → "access_token"
//     to match the new cookie/header naming convention
//   • rememberedEmail is read/written only from localStorage
//     (intentional — it is a UI convenience, not a security token)
//   • All fetch error paths throw typed errors with the server's
//     `code` field forwarded so the UI can branch on it
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  AuthContextValue,
  AuthProfile,
  AuthUser,
  UserRole,
  LoginResponse,
  RegisterResponse,
  VerifyResponse,
} from "@/lib/auth/types";

// ----------------------------------------------------------
// Storage keys — defined once so they never drift
// ----------------------------------------------------------

const KEY_ACCESS_TOKEN = "access_token";
const KEY_REFRESH_TOKEN = "refresh_token";
const KEY_REMEMBERED_EMAIL = "remembered_email";

// ----------------------------------------------------------
// Typed API error
// ----------------------------------------------------------

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

// ----------------------------------------------------------
// Storage helpers
// ----------------------------------------------------------

function storeTokens(
  accessToken: string,
  refreshToken: string,
  persistent: boolean,
): void {
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(KEY_ACCESS_TOKEN, accessToken);
  storage.setItem(KEY_REFRESH_TOKEN, refreshToken);
}

function clearStoredTokens(): void {
  localStorage.removeItem(KEY_ACCESS_TOKEN);
  localStorage.removeItem(KEY_REFRESH_TOKEN);
  sessionStorage.removeItem(KEY_ACCESS_TOKEN);
  sessionStorage.removeItem(KEY_REFRESH_TOKEN);
}

function readStoredAccessToken(): string | null {
  return (
    localStorage.getItem(KEY_ACCESS_TOKEN) ??
    sessionStorage.getItem(KEY_ACCESS_TOKEN) ??
    null
  );
}

// ----------------------------------------------------------
// Generic fetch helper — throws AuthApiError on non-2xx
// ----------------------------------------------------------

async function authFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthApiError(
      data.error ?? data.message ?? `Request failed (${response.status})`,
      data.code ?? "UNKNOWN_ERROR",
      response.status,
    );
  }

  return data as T;
}

// ----------------------------------------------------------
// Context
// ----------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

// ----------------------------------------------------------
// Provider component
// ----------------------------------------------------------

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Prevent double-verification on React strict-mode double effect
  const verifyInProgress = useRef(false);

  // --------------------------------------------------------
  // Restore session on mount
  // --------------------------------------------------------

  useEffect(() => {
    if (verifyInProgress.current) return;
    verifyInProgress.current = true;

    const restoreSession = async () => {
      const token = readStoredAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authFetch<VerifyResponse>("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data.user);
        setProfile(data.profile ?? null);
      } catch (error) {
        // Token invalid or expired — wipe stored tokens so the user
        // is redirected to login on the next protected-route render
        clearStoredTokens();

        if (
          error instanceof AuthApiError &&
          error.statusCode !== 401 &&
          error.statusCode !== 403
        ) {
          // Log unexpected errors (network issues, 5xx) but don't
          // surface them to the user — just treat as "not logged in"
          console.error("[AuthProvider] Session restore failed:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // --------------------------------------------------------
  // Dispatch remembered-email event for the login form
  // (convenience UX feature — not a security mechanism)
  // --------------------------------------------------------

  useEffect(() => {
    const remembered = localStorage.getItem(KEY_REMEMBERED_EMAIL);
    if (remembered && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rememberedEmail", { detail: remembered }),
      );
    }
  }, []);

  // --------------------------------------------------------
  // signIn
  // --------------------------------------------------------

  const signIn = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const data = await authFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      storeTokens(
        data.tokens.accessToken,
        data.tokens.refreshToken,
        rememberMe,
      );

      if (rememberMe) {
        localStorage.setItem(KEY_REMEMBERED_EMAIL, email);
      } else {
        localStorage.removeItem(KEY_REMEMBERED_EMAIL);
      }

      setUser(data.user);
      setProfile(data.profile ?? null);
    },
    [],
  );

  // --------------------------------------------------------
  // signUp
  // --------------------------------------------------------

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
      role: UserRole = "employee",
    ) => {
      const data = await authFetch<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name, role }),
      });

      // Registration always uses session storage (no "rememberMe" on sign-up)
      storeTokens(data.tokens.accessToken, data.tokens.refreshToken, false);

      setUser(data.user);
      setProfile(data.profile ?? null);
    },
    [],
  );

  // --------------------------------------------------------
  // signOut
  // --------------------------------------------------------

  const signOut = useCallback(async () => {
    // Best-effort server-side cookie clearing — ignore errors so
    // the client state is always cleaned up even if the server is down
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // intentionally swallowed
    }

    clearStoredTokens();
    setUser(null);
    setProfile(null);
  }, []);

  // --------------------------------------------------------
  // forgotPassword
  // --------------------------------------------------------

  const forgotPassword = useCallback(async (email: string) => {
    await authFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    // Response is always a generic success message — nothing to do here
  }, []);

  // --------------------------------------------------------
  // resetPassword
  // --------------------------------------------------------

  const resetPassword = useCallback(
    async (token: string, email: string, newPassword: string) => {
      await authFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, email, newPassword }),
      });
      // Caller is responsible for redirecting to /login after success
    },
    [],
  );

  // --------------------------------------------------------
  // Context value
  // --------------------------------------------------------

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
