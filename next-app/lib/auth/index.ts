// ============================================================
// lib/auth/index.ts — Barrel export
// ============================================================
// Single import point for the entire auth library.
// Consumers should import from "@/lib/auth" instead of
// reaching into sub-files directly.
//
// Usage examples:
//   import { getAuthService, AuthError } from "@/lib/auth"
//   import type { AuthUser, AuthContextValue } from "@/lib/auth"
// ============================================================

// ----------------------------------------------------------
// Service + errors
// ----------------------------------------------------------

export {
  AuthService,
  AuthError,
  AuthErrors,
  getAuthService,
} from "./AuthService";

export type { EmailService } from "./AuthService";

// ----------------------------------------------------------
// Domain types
// ----------------------------------------------------------

export type {
  // User / Role
  UserRole,
  AuthUser,
  AuthProfile,

  // JWT
  TokenType,
  JWTPayload,

  // Session
  TokenPair,
  AuthSession,

  // API request shapes
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,

  // API response shapes
  LoginResponse,
  RegisterResponse,
  VerifyResponse,
  RefreshResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  LogoutResponse,

  // React context
  AuthContextValue,

  // Internal DB row types (used by repositories / tests)
  UserRow,
  ProfileRow,
} from "./types";

// ----------------------------------------------------------
// Runtime helpers / guards
// ----------------------------------------------------------

export {
  isUserRole,
  stripPasswordFields,
  toAuthUser,
  toAuthProfile,
} from "./types";
