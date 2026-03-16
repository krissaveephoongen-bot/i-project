// ============================================================
// POST /api/auth/login
// ============================================================
// Responsibilities (this file only):
//   1. Parse + validate the request body
//   2. Delegate to AuthService.login()
//   3. Set HttpOnly cookies (access + refresh)
//   4. Return the JSON response
//
// Business logic (lockout, password hashing, profile upsert,
// JWT generation) lives entirely in AuthService.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthService, AuthError } from "@/lib/auth/AuthService";
import type { LoginRequest, LoginResponse } from "@/lib/auth/types";
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from "@/lib/auth-utils";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Cookie names — defined once so every route uses the same strings
export const COOKIE_ACCESS_TOKEN = "access_token";
export const COOKIE_REFRESH_TOKEN = "refresh_token";

// ----------------------------------------------------------
// Helper: parse request body
// Supports both application/json and application/x-www-form-urlencoded
// ----------------------------------------------------------

async function parseBody(
  request: NextRequest,
): Promise<Record<string, unknown>> {
  const text = await request.text();

  if (!text.trim()) {
    throw new Error("Empty request body");
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(text));
  }

  // Default: attempt JSON parse
  try {
    return JSON.parse(text);
  } catch {
    // Last-resort: try form-encoded anyway
    try {
      return Object.fromEntries(new URLSearchParams(text));
    } catch {
      throw new Error(
        "Unable to parse request body as JSON or form-encoded data",
      );
    }
  }
}

// ----------------------------------------------------------
// Helper: validate login fields
// ----------------------------------------------------------

interface ValidationResult {
  ok: true;
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ValidationError {
  ok: false;
  message: string;
}

function validateLoginBody(
  body: Record<string, unknown>,
): ValidationResult | ValidationError {
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rememberMe = body.rememberMe === true || body.rememberMe === "true";

  if (!email) {
    return { ok: false, message: "Email is required" };
  }

  // Basic email format guard — full validation is done by the DB unique constraint
  if (!email.includes("@")) {
    return { ok: false, message: "Invalid email address" };
  }

  if (!password) {
    return { ok: false, message: "Password is required" };
  }

  if (password.length < 1) {
    return { ok: false, message: "Password is required" };
  }

  return { ok: true, email, password, rememberMe };
}

// ----------------------------------------------------------
// Helper: set auth cookies
// ----------------------------------------------------------

function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean,
): void {
  const cookieStore = cookies();

  // Access token — short-lived (24 h)
  cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    // If rememberMe, persist for the full token lifetime; otherwise session cookie
    ...(rememberMe ? { maxAge: ACCESS_TOKEN_EXPIRY_SECONDS } : {}),
  });

  // Refresh token — longer-lived (7 d), scoped to the refresh endpoint
  cookieStore.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/api/auth/refresh",
    ...(rememberMe ? { maxAge: REFRESH_TOKEN_EXPIRY_SECONDS } : {}),
  });
}

// ----------------------------------------------------------
// Route handler
// ----------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Parse body
  let body: Record<string, unknown>;
  try {
    body = await parseBody(request);
  } catch (parseError) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message:
          parseError instanceof Error
            ? parseError.message
            : "Invalid request body",
        code: "INVALID_BODY",
      },
      { status: 400 },
    );
  }

  // 2. Validate fields
  const validation = validateLoginBody(body);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: validation.message,
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  const { email, password, rememberMe } = validation;

  // 3. Delegate to AuthService
  try {
    const authService = getAuthService();

    const loginReq: LoginRequest = { email, password, rememberMe };
    const session = await authService.login(loginReq);

    // 4. Set HttpOnly cookies
    setAuthCookies(session.accessToken, session.refreshToken, rememberMe);

    // 5. Build response
    // The token field is kept in the JSON body so the client-side
    // AuthProvider can also store it in sessionStorage / localStorage
    // for SPA-style in-memory access (e.g. attaching to fetch headers).
    const response: LoginResponse = {
      user: session.user,
      profile: session.profile,
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
      message: "Login successful",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }

    // Unexpected error — log server-side, return generic message to client
    console.error("[POST /api/auth/login] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
