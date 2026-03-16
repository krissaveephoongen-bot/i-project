// ============================================================
// POST /api/auth/reset-password
// ============================================================
// Responsibilities (this file only):
//   1. Parse + validate the request body
//   2. Delegate to AuthService.resetPassword()
//   3. Return a success or error response
//
// What changed vs the original:
//   • Original used camelCase column names (`isDeleted`,
//     `resetToken`, `resetTokenExpiry`, `updatedAt`) which do
//     not exist in the snake_case Supabase schema — queries
//     silently returned no results, making reset always fail.
//   • All DB access is now inside AuthService / UserRepository
//     which uses the correct snake_case column names.
//   • Input validation is explicit and returns structured
//     error responses with machine-readable `code` fields.
//   • Password strength is validated before hitting the DB.
//   • No `any` types — all shapes come from lib/auth/types.ts.
//   • Proper typed AuthError is caught and forwarded, so the
//     caller gets meaningful status codes (400 vs 401 vs 500).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthService, AuthError } from "@/lib/auth/AuthService";
import type {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/lib/auth/types";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

const PASSWORD_MIN_LENGTH = 8;

// ----------------------------------------------------------
// Input validation
// ----------------------------------------------------------

interface ValidationOk {
  ok: true;
  data: ResetPasswordRequest;
}

interface ValidationFail {
  ok: false;
  message: string;
  field: string;
}

type ValidationResult = ValidationOk | ValidationFail;

function fail(message: string, field: string): ValidationFail {
  return { ok: false, message, field };
}

function validateBody(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return fail("Request body must be a JSON object", "body");
  }

  const raw = body as Record<string, unknown>;

  // --- token ---
  const token = typeof raw.token === "string" ? raw.token.trim() : "";
  if (!token) {
    return fail("Reset token is required", "token");
  }
  // Tokens are 64 hex characters (32 bytes from crypto.randomBytes)
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return fail("Invalid reset token format", "token");
  }

  // --- email ---
  const email =
    typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (!email) {
    return fail("Email address is required", "email");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("Invalid email address", "email");
  }

  // --- newPassword ---
  const newPassword =
    typeof raw.newPassword === "string" ? raw.newPassword : "";
  if (!newPassword) {
    return fail("New password is required", "newPassword");
  }
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return fail(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      "newPassword",
    );
  }

  // Basic strength hints — at least one letter and one number
  if (!/[a-zA-Z]/.test(newPassword)) {
    return fail("Password must contain at least one letter", "newPassword");
  }
  if (!/[0-9]/.test(newPassword)) {
    return fail("Password must contain at least one number", "newPassword");
  }

  return {
    ok: true,
    data: { token, email, newPassword },
  };
}

// ----------------------------------------------------------
// Route handler
// ----------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Parse request body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: "Request body must be valid JSON",
        code: "INVALID_BODY",
      },
      { status: 400 },
    );
  }

  // 2. Validate fields
  const validation = validateBody(rawBody);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Validation Error",
        message: validation.message,
        field: validation.field,
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const { token, email, newPassword } = validation.data;

  // 3. Delegate to AuthService
  try {
    const authService = getAuthService();
    await authService.resetPassword(token, email, newPassword);

    // 4. Return success
    const response: ResetPasswordResponse = {
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      // 400 / 401 — bad token, expired token, user not found
      if (error.statusCode < 500) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: error.statusCode },
        );
      }

      // 5xx — infrastructure problem, log and return generic message
      console.error(
        "[POST /api/auth/reset-password] Service error:",
        error.message,
      );
      return NextResponse.json(
        {
          error:
            "Unable to reset password at this time. Please try again later.",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    // Completely unexpected error — log server-side only
    console.error("[POST /api/auth/reset-password] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
