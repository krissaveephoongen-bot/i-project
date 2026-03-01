// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  department?: string;
  position?: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  lastLogin?: Date;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginResponse {
  user: AuthUser;
  token: string; // For backward compatibility
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: AuthUser;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

// Password reset types
export interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: Date;
}

// User status types
export type UserStatus = "active" | "inactive" | "locked" | "deleted";

export interface UserAccountStatus {
  isActive: boolean;
  isDeleted: boolean;
  lockedUntil?: Date;
  failedLoginAttempts: number;
}

// JWT payload interface
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}
