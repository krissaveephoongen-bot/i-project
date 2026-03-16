// ============================================================
// POST /api/auth/register
// ============================================================
// Responsibilities (this file only):
//   1. Parse + validate the request body
//   2. Delegate to AuthService.register()
//   3. Set HttpOnly cookies (access + refresh)
//   4. Return the JSON response
//
// What changed vs the original:
//   • Removed the fragile "password variant loop" that tried
//     inserting with 5 different column name combinations.
//     The DB schema must have a `password` column — period.
//   • No more `any` types — all shapes come from lib/auth/types.
//   • Proper JWT tokens are issued (via AuthService) instead of
//     returning user.id as the "token".
//   • Profile upsert is handled inside AuthService, not here.
//   • Input validation is explicit and returns structured errors.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthService, AuthError } from "@/lib/auth/AuthService";
import type {
  RegisterRequest,
  RegisterResponse,
  UserRole,
} from "@/lib/auth/types";
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from "@/lib/auth-utils";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from "@/app/api/auth/login/route";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const VALID_ROLES: UserRole[] = ["admin", "manager", "employee"];
const PASSWORD_MIN_LENGTH = 8;

// ----------------------------------------------------------
// Input validation
// ----------------------------------------------------------

interface ValidationOk {
  ok: true;
  data: RegisterRequest;
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

function validateRegisterBody(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return fail("Request body must be a JSON object", "body");
  }

  const raw = body as Record<string, unknown>;

  // --- email ---
  const email =
    typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (!email) {
    return fail("Email is required", "email");
  }
  // RFC-5322 simplified check — real validation happens at the DB level
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("Invalid email address", "email");
  }

  // --- password ---
  const password = typeof raw.password === "string" ? raw.password : "";
  if (!password) {
    return fail("Password is required", "password");
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return fail(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      "password",
    );
  }

  // --- name (optional, falls back to email inside AuthService) ---
  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim()
      : undefined;

  // --- role (optional, defaults to "employee") ---
  let role: UserRole = "employee";
  if (raw.role !== undefined) {
    if (!VALID_ROLES.includes(raw.role as UserRole)) {
      return fail(`Role must be one of: ${VALID_ROLES.join(", ")}`, "role");
    }
    role = raw.role as UserRole;
  }

  // --- optional profile fields ---
  const department =
    typeof raw.department === "string" && raw.department.trim()
      ? raw.department.trim()
      : undefined;

  const position =
    typeof raw.position === "string" && raw.position.trim()
      ? raw.position.trim()
      : undefined;

  const phone =
    typeof raw.phone === "string" && raw.phone.trim()
      ? raw.phone.trim()
      : undefined;

  const avatar =
    typeof raw.avatar === "string" && raw.avatar.trim()
      ? raw.avatar.trim()
      : undefined;

  return {
    ok: true,
    data: { email, password, name, role, department, position, phone, avatar },
  };
}

// ----------------------------------------------------------
// Helper: set auth cookies (mirrors login route)
// ----------------------------------------------------------

function setAuthCookies(accessToken: string, refreshToken: string): void {
  const cookieStore = cookies();

  cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS,
  });

  cookieStore.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
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
  const validation = validateRegisterBody(rawBody);
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

  // 3. Delegate to AuthService
  try {
    const authService = getAuthService();
    const session = await authService.register(validation.data);

    // 4. Set HttpOnly cookies
    setAuthCookies(session.accessToken, session.refreshToken);

    // 5. Build response
    const response: RegisterResponse = {
      user: session.user,
      profile: session.profile,
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
      message: "Registration successful",
    };

    return NextResponse.json(response, { status: 201 });
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

    // Unexpected error — log server-side only
    console.error("[POST /api/auth/register] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
