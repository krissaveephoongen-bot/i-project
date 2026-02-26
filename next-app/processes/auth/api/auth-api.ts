import type {
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ForgotPasswordData,
  LoginResponse,
  RegisterResponse,
  VerifyResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ApiError,
} from "../model/types";

const API_BASE_URL = "/api/auth";

/**
 * Authentication API functions
 */
export class AuthApi {
  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        let msg = "เข้าสู่ระบบล้มเหลว";
        try {
          const body = await response.json();
          msg = body?.error || body?.message || msg;
        } catch {
          try {
            const text = await response.text();
            msg = text || msg;
          } catch {}
        }
        throw new Error(msg);
      }
      return response.json();
    } catch (e: any) {
      const message = String(e?.message || "").includes("Failed to fetch")
        ? "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่หรือเช็คการเชื่อมต่อ"
        : e?.message || "เข้าสู่ระบบล้มเหลว";
      throw new Error(message);
    }
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    return response.json();
  }

  /**
   * Verify authentication token
   */
  static async verify(): Promise<VerifyResponse> {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Token verification failed");
    }

    return response.json();
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  /**
   * Initiate password reset
   */
  static async forgotPassword(
    data: ForgotPasswordData,
  ): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Password reset request failed");
    }

    return response.json();
  }

  /**
   * Reset password using token
   */
  static async resetPassword(
    data: ResetPasswordData,
  ): Promise<ResetPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Password reset failed");
    }

    return response.json();
  }
}

// Convenience functions for direct use
export const login = AuthApi.login;
export const register = AuthApi.register;
export const verify = AuthApi.verify;
export const logout = AuthApi.logout;
export const forgotPassword = AuthApi.forgotPassword;
export const resetPassword = AuthApi.resetPassword;
