// ============================================================
// Auth Types — Single Source of Truth
// Replace all scattered `any` usages across the auth system
// ============================================================

// ----------------------------------------------------------
// Domain: User / Role
// ----------------------------------------------------------

export type UserRole = "admin" | "manager" | "employee";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  name_th?: string | null;
  role: UserRole;
  position?: string | null;
  department?: string | null;
  avatar?: string | null;
  phone?: string | null;
  hourly_rate?: number | null;
  timezone?: string | null;
  employee_code?: string | null;
  status?: string | null;
  is_active: boolean;
  is_deleted: boolean;
  failed_login_attempts: number;
  locked_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthProfile {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------
// Domain: JWT Payload
// ----------------------------------------------------------

export type TokenType = "access" | "refresh";

export interface JWTPayload {
  /** User's UUID from the database */
  sub: string;
  email: string;
  role: UserRole;
  type: TokenType;
  /** Issued-at (UNIX seconds) — set by jsonwebtoken */
  iat?: number;
  /** Expiry (UNIX seconds) — set by jsonwebtoken */
  exp?: number;
}

// ----------------------------------------------------------
// Domain: Token Pair
// ----------------------------------------------------------

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

// ----------------------------------------------------------
// Domain: Session (persisted client-side)
// ----------------------------------------------------------

export interface AuthSession {
  user: AuthUser;
  profile: AuthProfile | null;
  accessToken: string;
  refreshToken: string;
}

// ----------------------------------------------------------
// API Request shapes
// ----------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ----------------------------------------------------------
// API Response shapes
// ----------------------------------------------------------

export interface LoginResponse {
  user: AuthUser;
  profile: AuthProfile | null;
  tokens: TokenPair;
  message: string;
}

export interface RegisterResponse {
  user: AuthUser;
  profile: AuthProfile | null;
  tokens: TokenPair;
  message: string;
}

export interface VerifyResponse {
  user: AuthUser;
  profile: AuthProfile | null;
  valid: true;
  message: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  /** Only present in development builds */
  resetToken?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  ok: true;
}

// ----------------------------------------------------------
// Auth Context (React)
// ----------------------------------------------------------

export interface AuthContextValue {
  user: AuthUser | null;
  profile: AuthProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name?: string,
    role?: UserRole,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, newPassword: string) => Promise<void>;
}

// ----------------------------------------------------------
// Internal: DB row shape returned by Supabase queries
// (keeps raw DB columns isolated from the domain model)
// ----------------------------------------------------------

export interface UserRow {
  id: string;
  email: string;
  name: string;
  name_th: string | null;
  role: string;
  position: string | null;
  department: string | null;
  avatar: string | null;
  phone: string | null;
  hourly_rate: number | null;
  timezone: string | null;
  employee_code: string | null;
  status: string | null;
  is_active: boolean;
  is_deleted: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  // password columns — present in raw DB reads, stripped before responses
  password?: string | null;
  password_hash?: string | null;
  hashed_password?: string | null;
  // optional columns that may or may not exist depending on migrations
  reset_token?: string | null;
  reset_token_expiry?: string | null;
}

export interface ProfileRow {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------
// Guards / narrowing helpers
// ----------------------------------------------------------

export function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "manager" || value === "employee";
}

export function stripPasswordFields(row: UserRow): Omit<UserRow, "password" | "password_hash" | "hashed_password"> {
  const { password, password_hash, hashed_password, ...safe } = row;
  return safe;
}

/**
 * Map a raw UserRow to the domain AuthUser shape.
 * Ensures every optional field has the correct default so consumers
 * never have to deal with `undefined` vs `null` inconsistencies.
 */
export function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    name_th: row.name_th ?? null,
    role: isUserRole(row.role) ? row.role : "employee",
    position: row.position ?? null,
    department: row.department ?? null,
    avatar: row.avatar ?? null,
    phone: row.phone ?? null,
    hourly_rate: row.hourly_rate ?? null,
    timezone: row.timezone ?? null,
    employee_code: row.employee_code ?? null,
    status: row.status ?? null,
    is_active: row.is_active ?? true,
    is_deleted: row.is_deleted ?? false,
    failed_login_attempts: row.failed_login_attempts ?? 0,
    locked_until: row.locked_until ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Map a raw ProfileRow to the domain AuthProfile shape.
 */
export function toAuthProfile(row: ProfileRow): AuthProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    avatar_url: row.avatar_url ?? null,
    role: isUserRole(row.role) ? row.role : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
