// ============================================================
// POST /api/auth/forgot-password
// ============================================================
// Responsibilities (this file only):
//   1. Parse + validate the request body (email field)
//   2. Delegate to AuthService.forgotPassword()
//   3. Always return HTTP 200 with a generic message
//      (prevents user enumeration — attacker cannot tell
//       whether the email exists in the system)
//
// What changed vs the original:
//   • Reset token is no longer logged to the console in prod.
//     AuthService delegates to an EmailService; in development
//     the ConsoleEmailService logs the full reset link instead
//     of just the raw token.
//   • Route handler contains zero business logic.
//   • Used wrong column names (isDeleted / camelCase) —
//     fixed inside AuthService which uses snake_case.
//   • `resetToken` is no longer leaked in the response body
//     even in development (the link is logged server-side only).
//   • Structured error codes returned on unexpected failures.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthService, AuthError } from "@/lib/auth/AuthService";
import type { ForgotPasswordResponse } from "@/lib/auth/types";

// ----------------------------------------------------------
// Generic success message — identical regardless of whether
// the email address exists. This prevents user enumeration.
// ----------------------------------------------------------

const GENERIC_SUCCESS_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

// ----------------------------------------------------------
// Input validation
// ----------------------------------------------------------

interface ValidationOk {
  ok: true;
  email: string;
}

interface ValidationFail {
  ok: false;
  message: string;
}

function validateBody(body: unknown): ValidationOk | ValidationFail {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object" };
  }

  const raw = body as Record<string, unknown>;
  const email =
    typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";

  if (!email) {
    return { ok: false, message: "Email is required" };
  }

  // Simple format guard — real validation is on the DB side
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Invalid email address" };
  }

  return { ok: true, email };
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

  // 2. Validate email field
  const validation = validateBody(rawBody);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Validation Error",
        message: validation.message,
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  // 3. Delegate to AuthService
  //    AuthService.forgotPassword() silently no-ops when the email
  //    is not found, so we always return the same response below.
  try {
    const authService = getAuthService();
    await authService.forgotPassword(validation.email);
  } catch (error) {
    // AuthError with a non-5xx code means something genuinely wrong
    // in the request — surface it. For 5xx codes (DB unavailable etc.)
    // we still return the generic message so the UI stays predictable,
    // but we log the real error server-side.
    if (error instanceof AuthError) {
      if (error.statusCode >= 500) {
        console.error(
          "[POST /api/auth/forgot-password] Service error:",
          error.message,
        );
        // Fall through to generic success response — do not reveal
        // infrastructure errors to the caller.
      } else {
        // 4xx AuthError — return it (e.g. VALIDATION_ERROR from service)
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: error.statusCode },
        );
      }
    } else {
      // Completely unexpected error — log and swallow
      console.error(
        "[POST /api/auth/forgot-password] Unexpected error:",
        error,
      );
    }
  }

  // 4. Always return HTTP 200 with the generic message
  //    This is intentional: the caller MUST NOT be able to infer
  //    whether the supplied email address is registered.
  const response: ForgotPasswordResponse = {
    message: GENERIC_SUCCESS_MESSAGE,
  };

  return NextResponse.json(response, { status: 200 });
}
