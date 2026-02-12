// Authentication Types for Frontend
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  department?: string;
  position?: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ForgotPasswordData {
  email: string;
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
  lastLogin?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  message: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface VerifyResponse {
  user: AuthUser;
  valid: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string; // Only in development
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

// Form validation types
export interface LoginFormData extends LoginCredentials {}

export interface RegisterFormData extends RegisterData {}

export interface ForgotPasswordFormData extends ForgotPasswordData {}

export interface ResetPasswordFormData extends ResetPasswordData {}

// Hook return types
export interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  clearError: () => void;
}

// API function types
export type LoginApiFn = (credentials: LoginCredentials) => Promise<LoginResponse>;
export type RegisterApiFn = (data: RegisterData) => Promise<RegisterResponse>;
export type VerifyApiFn = () => Promise<VerifyResponse>;
export type ForgotPasswordApiFn = (data: ForgotPasswordData) => Promise<ForgotPasswordResponse>;
export type ResetPasswordApiFn = (data: ResetPasswordData) => Promise<ResetPasswordResponse>;