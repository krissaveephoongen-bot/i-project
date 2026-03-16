// ============================================================
// POST /api/auth/logout
// ============================================================
// Responsibilities (this file only):
//   1. Clear the access_token and refresh_token HttpOnly cookies
//   2. Return a simple { ok: true } JSON response
//
// What changed vs the original:
//   • Original only deleted the old `auth_token` cookie (the one
//     that stored the raw user UUID). The new auth system uses two
//     separate cookies — access_token and refresh_token — both of
//     which must be cleared on logout.
//   • Cookie names are imported from the login route so they are
//     defined in exactly one place and can never drift out of sync.
//   • Cookie deletion options (path, sameSite, secure) mirror the
//     settings used when the cookies were SET, which is required
//     by some browsers to guarantee the cookie is actually removed.
//   • If the client also stores the access token in sessionStorage /
//     localStorage (for SPA header attachment), that is the client's
//     responsibility — we cannot touch client-side storage from a
//     server route handler.
//   • No auth check is performed: logging out an already-unauthenticated
//     session is a no-op, not an error.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { LogoutResponse } from "@/lib/auth/types";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from "@/app/api/auth/login/route";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ----------------------------------------------------------
// Helper: clear a single cookie by name
//
// When deleting a cookie the Set-Cookie header MUST specify the
// same Path (and Domain, if set) that was used when creating it.
// Using a maxAge of 0 / expires in the past is the reliable
// cross-browser way to instruct the client to drop the cookie.
// ----------------------------------------------------------

function clearCookie(name: string, path: string = "/"): void {
  const cookieStore = cookies();

  // next/headers `delete()` works in most cases, but explicitly
  // setting an expired cookie is the safest cross-browser approach.
  cookieStore.set(name, "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path,
    // maxAge: 0 tells the browser to delete the cookie immediately
    maxAge: 0,
  });
}

// ----------------------------------------------------------
// Route handler
// ----------------------------------------------------------

export async function POST(_request: NextRequest): Promise<NextResponse> {
  // Clear access token (path: "/")
  clearCookie(COOKIE_ACCESS_TOKEN, "/");

  // Clear refresh token (path: "/api/auth/refresh" — must match
  // the path used when the cookie was set, otherwise the browser
  // will not delete it)
  clearCookie(COOKIE_REFRESH_TOKEN, "/api/auth/refresh");

  const response: LogoutResponse = { ok: true };

  return NextResponse.json(response, { status: 200 });
}
