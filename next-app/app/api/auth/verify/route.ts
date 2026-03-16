// ============================================================
// GET /api/auth/verify
// ============================================================
// Responsibilities (this file only):
//   1. Extract + validate the Authorization header
//   2. Delegate token verification to AuthService
//   3. Return the verified user + profile as JSON
//
// What changed vs the original:
//   • The original used `token === userId` — a UUID stored in
//     the DB was used as the "token". Anyone knowing a valid
//     user UUID could authenticate as that user.
//   • This version verifies a real HS256-signed JWT using the
//     shared `JWT_SECRET`, so forgery is cryptographically
//     infeasible.
//   • Auth logic is fully delegated to AuthService — the route
//     handler only speaks HTTP.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthService, AuthError } from "@/lib/auth/AuthService";
import { extractTokenFromHeader } from "@/lib/auth-utils";
import type { VerifyResponse } from "@/lib/auth/types";

// Force dynamic rendering — this endpoint reads live DB state
// and must never be statically cached.
export const dynamic = "force-dynamic";

// ----------------------------------------------------------
// Route handler
// ----------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Extract token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: authHeader
          ? "Invalid Authorization header format. Expected: Bearer <token>"
          : "Authorization header is missing",
        code: "TOKEN_MISSING",
      },
      { status: 401 },
    );
  }

  // 2. Delegate to AuthService
  try {
    const authService = getAuthService();
    const session = await authService.verifyAccessToken(token);

    const response: VerifyResponse = {
      user: session.user,
      profile: session.profile,
      valid: true,
      message: "Token is valid",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }

    // Unexpected error — log server-side only, return generic message
    console.error("[GET /api/auth/verify] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
