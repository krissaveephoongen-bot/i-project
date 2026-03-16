// ============================================================
// POST /api/auth/refresh
// ============================================================
// Responsibilities (this file only):
//   1. Extract the refresh token (from cookie OR Authorization header)
//   2. Delegate to AuthService.refreshTokens()
//   3. Set a fresh access-token HttpOnly cookie
//   4. Return the new access token in the JSON response
//
// What changed vs the original:
//   • Original mixed DB queries (auth_tokens table, users table)
//     directly inside the route handler — all moved to AuthService.
//   • Original relied on an `auth_tokens` DB table for revocation
//     tracking; replaced with stateless JWT verification + DB user
//     status check inside AuthService (simpler, no extra table needed
//     for the common case — add token revocation list later if needed).
//   • Refresh token is now read from an HttpOnly cookie first
//     (set by login/register routes) with Authorization header as
//     fallback for API-client / mobile usage.
//   • No `any` types — all shapes come from lib/auth/types.ts.
//   • Structured error codes returned on all failure paths.
//   • Route handler contains zero business logic.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthService, AuthError } from "@/lib/auth/AuthService";
import {
  extractTokenFromHeader,
  ACCESS_TOKEN_EXPIRY_SECONDS,
} from "@/lib/auth-utils";
import type { RefreshResponse } from "@/lib/auth/types";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from "@/app/api/auth/login/route";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ----------------------------------------------------------
// Helper: extract refresh token from request
//
// Priority order:
//   1. HttpOnly cookie `refresh_token`  (preferred — most secure)
//   2. Authorization: Bearer <token>    (fallback for API clients)
//   3. JSON body { refreshToken: "..." } (last resort for legacy callers)
// ----------------------------------------------------------

async function extractRefreshToken(
  request: NextRequest,
): Promise<string | null> {
  // 1. HttpOnly cookie (set by login / register routes)
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value ?? null;
  if (cookieToken?.trim()) return cookieToken.trim();

  // 2. Authorization header
  const authHeader = request.headers.get("authorization");
  const headerToken = extractTokenFromHeader(authHeader);
  if (headerToken) return headerToken;

  // 3. JSON body — consumed only once, so clone to avoid locking the stream
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.clone().json();
      const bodyToken =
        typeof body?.refreshToken === "string"
          ? body.refreshToken.trim()
          : null;
      if (bodyToken) return bodyToken;
    }
  } catch {
    // Body may be empty or non-JSON — not an error, just fall through
  }

  return null;
}

// ----------------------------------------------------------
// Helper: set fresh access-token cookie
// ----------------------------------------------------------

function setAccessTokenCookie(accessToken: string): void {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS,
  });
}

// ----------------------------------------------------------
// Route handler
// ----------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Extract refresh token from cookie / header / body
  const refreshToken = await extractRefreshToken(request);

  if (!refreshToken) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "Refresh token is required. " +
          "Send it via the refresh_token cookie or an Authorization: Bearer header.",
        code: "TOKEN_MISSING",
      },
      { status: 401 },
    );
  }

  // 2. Delegate to AuthService
  try {
    const authService = getAuthService();
    const { accessToken, expiresIn } =
      await authService.refreshTokens(refreshToken);

    // 3. Set fresh access-token cookie
    setAccessTokenCookie(accessToken);

    // 4. Return new access token in response body so API clients
    //    can update their in-memory token without reading cookies.
    const response: RefreshResponse = {
      accessToken,
      expiresIn,
      message: "Token refreshed successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      // 401 / 423 — invalid token, expired token, locked account, etc.
      if (error.statusCode < 500) {
        // Clear stale cookies on auth failure so the client is forced
        // back to the login page rather than retrying indefinitely.
        const cookieStore = cookies();
        cookieStore.delete(COOKIE_ACCESS_TOKEN);
        cookieStore.delete(COOKIE_REFRESH_TOKEN);

        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: error.statusCode },
        );
      }

      // 5xx — infrastructure problem
      console.error("[POST /api/auth/refresh] Service error:", error.message);
      return NextResponse.json(
        {
          error:
            "Unable to refresh token at this time. Please try again later.",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    // Completely unexpected error — log server-side only
    console.error("[POST /api/auth/refresh] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
