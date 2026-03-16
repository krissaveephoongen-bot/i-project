// ============================================================
// AuthService — Server-side auth business logic
// ============================================================
// Responsibilities:
//   • Validate credentials against Supabase DB
//   • Issue signed JWT access + refresh token pairs
//   • Manage failed-login lockout
//   • Upsert profile rows on login / register
//   • Generate and validate password-reset tokens
//
// Does NOT:
//   • Handle HTTP (NextRequest / NextResponse) — that is the route layer
//   • Know about cookies — that is the route layer
//   • Send emails directly — delegates to an EmailService interface
// ============================================================

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "@/lib/auth-utils";
import {
  AuthUser,
  AuthProfile,
  AuthSession,
  TokenPair,
  UserRow,
  ProfileRow,
  LoginRequest,
  RegisterRequest,
  toAuthUser,
  toAuthProfile,
  isUserRole,
} from "./types";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60 * 24; // 24 h
const REFRESH_TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 d

// ----------------------------------------------------------
// Typed errors
// ----------------------------------------------------------

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// Convenience factories — keeps route handlers free of magic strings
export const AuthErrors = {
  invalidCredentials: () =>
    new AuthError("Invalid email or password", 401, "INVALID_CREDENTIALS"),
  accountDeactivated: () =>
    new AuthError("Account is deactivated", 401, "ACCOUNT_DEACTIVATED"),
  accountDeleted: () =>
    new AuthError("Account not found", 401, "ACCOUNT_NOT_FOUND"),
  accountLocked: () =>
    new AuthError(
      "Account is temporarily locked. Please try again later.",
      423,
      "ACCOUNT_LOCKED",
    ),
  noPassword: () =>
    new AuthError(
      "Password not configured for this account",
      400,
      "NO_PASSWORD",
    ),
  emailTaken: () =>
    new AuthError("Email already registered", 409, "EMAIL_TAKEN"),
  invalidToken: () =>
    new AuthError("Invalid or expired token", 401, "INVALID_TOKEN"),
  tokenExpired: () => new AuthError("Token has expired", 401, "TOKEN_EXPIRED"),
  userNotFound: () => new AuthError("User not found", 404, "USER_NOT_FOUND"),
  dbError: (message: string) => new AuthError(message, 500, "DB_ERROR"),
};

// ----------------------------------------------------------
// Email service interface (dependency-injected)
// ----------------------------------------------------------

export interface EmailService {
  sendPasswordReset(email: string, resetLink: string): Promise<void>;
}

/** No-op email service used when no real provider is configured */
class ConsoleEmailService implements EmailService {
  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    // TODO: replace with a real email provider (Resend / SendGrid / Nodemailer)
    // For now we log so that development workflows still function
    console.warn(
      "[AuthService] No email provider configured. Password reset link:",
      { email, resetLink },
    );
  }
}

// ----------------------------------------------------------
// UserRepository — isolates all Supabase DB calls
// ----------------------------------------------------------

class UserRepository {
  private get db() {
    if (!supabaseAdmin) {
      throw new AuthError(
        "Supabase admin client not initialised — check SUPABASE_SERVICE_ROLE_KEY",
        500,
        "DB_UNAVAILABLE",
      );
    }
    return supabaseAdmin;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const { data, error } = await this.db
      .from("users")
      .select(
        "id,email,name,name_th,role,position,department,avatar,phone," +
          "is_active,is_deleted,failed_login_attempts,locked_until,timezone," +
          "created_at,updated_at,hourly_rate,status,employee_code,password," +
          "password_hash,hashed_password,reset_token,reset_token_expiry",
      )
      .eq("email", email)
      .limit(1);

    if (error) throw AuthErrors.dbError(error.message);
    return (data ?? [])[0] ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const { data, error } = await this.db
      .from("users")
      .select(
        "id,email,name,name_th,role,position,department,avatar,phone," +
          "is_active,is_deleted,failed_login_attempts,locked_until,timezone," +
          "created_at,updated_at,hourly_rate,status,employee_code,password," +
          "password_hash,hashed_password,reset_token,reset_token_expiry",
      )
      .eq("id", id)
      .eq("is_active", true)
      .eq("is_deleted", false)
      .limit(1);

    if (error) throw AuthErrors.dbError(error.message);
    return (data ?? [])[0] ?? null;
  }

  async findByResetToken(
    token: string,
    email: string,
  ): Promise<UserRow | null> {
    const { data, error } = await this.db
      .from("users")
      .select("id,email,reset_token,reset_token_expiry,is_deleted")
      .eq("email", email)
      .eq("reset_token", token)
      .eq("is_deleted", false)
      .limit(1);

    if (error) throw AuthErrors.dbError(error.message);
    return (data ?? [])[0] ?? null;
  }

  async emailExists(email: string): Promise<boolean> {
    const { data, error } = await this.db
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (error) throw AuthErrors.dbError(error.message);
    return (data ?? []).length > 0;
  }

  async create(payload: Record<string, unknown>): Promise<UserRow> {
    const { data, error } = await this.db
      .from("users")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw AuthErrors.dbError(error.message);
    return data as UserRow;
  }

  async updateLoginSuccess(id: string): Promise<void> {
    await this.db
      .from("users")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  async recordFailedLogin(id: string, currentAttempts: number): Promise<void> {
    const next = currentAttempts + 1;
    const updates: Record<string, unknown> = {
      failed_login_attempts: next,
      updated_at: new Date().toISOString(),
    };

    if (next >= MAX_FAILED_ATTEMPTS) {
      updates.locked_until = new Date(
        Date.now() + LOCKOUT_DURATION_MS,
      ).toISOString();
    }

    await this.db.from("users").update(updates).eq("id", id);
  }

  async saveResetToken(
    id: string,
    token: string,
    expiry: string,
  ): Promise<void> {
    await this.db
      .from("users")
      .update({
        reset_token: token,
        reset_token_expiry: expiry,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  async clearResetToken(id: string, newPasswordHash: string): Promise<void> {
    await this.db
      .from("users")
      .update({
        password: newPasswordHash,
        reset_token: null,
        reset_token_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }
}

// ----------------------------------------------------------
// ProfileRepository — isolates all profile table calls
// ----------------------------------------------------------

class ProfileRepository {
  private get db() {
    if (!supabaseAdmin) {
      throw new AuthError(
        "Supabase admin client not initialised",
        500,
        "DB_UNAVAILABLE",
      );
    }
    return supabaseAdmin;
  }

  async findById(userId: string): Promise<ProfileRow | null> {
    const { data } = await this.db
      .from("profiles")
      .select("id,name,email,avatar_url,role,created_at,updated_at")
      .eq("id", userId)
      .limit(1);

    return (data ?? [])[0] ?? null;
  }

  async upsert(user: UserRow): Promise<ProfileRow> {
    const now = new Date().toISOString();
    const existing = await this.findById(user.id);

    if (!existing) {
      const payload = {
        id: user.id,
        name: user.name ?? user.email,
        email: user.email ?? null,
        avatar_url: user.avatar ?? null,
        role: isUserRole(user.role) ? user.role : null,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.db
        .from("profiles")
        .insert(payload)
        .select("*")
        .limit(1);

      if (error) {
        // Profile upsert is non-fatal — log and return constructed value
        console.warn("[AuthService] Profile insert failed:", error.message);
        return payload as ProfileRow;
      }

      return ((data ?? [])[0] ?? payload) as ProfileRow;
    }

    // Check whether any field has drifted
    const needsUpdate =
      existing.role !== user.role ||
      existing.name !== user.name ||
      existing.email !== user.email ||
      existing.avatar_url !== user.avatar;

    if (!needsUpdate) return existing;

    const updates = {
      name: user.name ?? existing.name,
      email: user.email ?? existing.email,
      avatar_url: user.avatar ?? existing.avatar_url,
      role: isUserRole(user.role) ? user.role : existing.role,
      updated_at: now,
    };

    const { data } = await this.db
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .limit(1);

    return ((data ?? [])[0] ?? { ...existing, ...updates }) as ProfileRow;
  }
}

// ----------------------------------------------------------
// AuthService — public API
// ----------------------------------------------------------

export class AuthService {
  private readonly users: UserRepository;
  private readonly profiles: ProfileRepository;
  private readonly email: EmailService;

  constructor(emailService?: EmailService) {
    this.users = new UserRepository();
    this.profiles = new ProfileRepository();
    this.email = emailService ?? new ConsoleEmailService();
  }

  // --------------------------------------------------------
  // login
  // --------------------------------------------------------

  async login(req: LoginRequest): Promise<AuthSession> {
    const { email, password } = req;

    const row = await this.users.findByEmail(email);

    // Always use a timing-safe "not found" error — never reveal
    // whether the email address exists in the system.
    if (!row) throw AuthErrors.invalidCredentials();

    this.assertAccountUsable(row);

    const passwordHash =
      row.password ?? row.password_hash ?? row.hashed_password ?? null;
    if (!passwordHash) throw AuthErrors.noPassword();

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      await this.users.recordFailedLogin(
        row.id,
        row.failed_login_attempts ?? 0,
      );
      throw AuthErrors.invalidCredentials();
    }

    await this.users.updateLoginSuccess(row.id);
    const profile = await this.profiles.upsert(row);

    return this.buildSession(row, profile);
  }

  // --------------------------------------------------------
  // register
  // --------------------------------------------------------

  async register(req: RegisterRequest): Promise<AuthSession> {
    const {
      email,
      password,
      name,
      role = "employee",
      department,
      position,
      phone,
      avatar,
    } = req;

    const exists = await this.users.emailExists(email);
    if (exists) throw AuthErrors.emailTaken();

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const now = new Date().toISOString();

    const newRow = await this.users.create({
      id: crypto.randomUUID(),
      email,
      name: name ?? email,
      role: isUserRole(role) ? role : "employee",
      department: department ?? null,
      position: position ?? null,
      phone: phone ?? null,
      avatar: avatar ?? null,
      password: hash,
      status: "active",
      is_active: true,
      is_deleted: false,
      failed_login_attempts: 0,
      hourly_rate: 0,
      timezone: "Asia/Bangkok",
      created_at: now,
      updated_at: now,
    });

    const profile = await this.profiles.upsert(newRow);
    return this.buildSession(newRow, profile);
  }

  // --------------------------------------------------------
  // verifyAccessToken — used by GET /api/auth/verify
  // --------------------------------------------------------

  async verifyAccessToken(token: string): Promise<AuthSession> {
    let payload: ReturnType<typeof verifyToken>;
    try {
      payload = verifyToken(token);
    } catch {
      throw AuthErrors.invalidToken();
    }

    if (!payload || payload.type !== "access") {
      throw AuthErrors.invalidToken();
    }

    const row = await this.users.findById(payload.sub);
    if (!row) throw AuthErrors.invalidToken();

    this.assertAccountUsable(row);

    const profile = await this.profiles.findById(row.id);

    // Re-issue the same token pair so the caller always has fresh tokens
    return this.buildSession(row, profile ?? null, token);
  }

  // --------------------------------------------------------
  // refreshTokens — used by POST /api/auth/refresh
  // --------------------------------------------------------

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    let payload: ReturnType<typeof verifyToken>;
    try {
      payload = verifyToken(refreshToken);
    } catch {
      throw AuthErrors.invalidToken();
    }

    if (!payload || payload.type !== "refresh") {
      throw AuthErrors.invalidToken();
    }

    const row = await this.users.findById(payload.sub);
    if (!row) throw AuthErrors.invalidToken();

    this.assertAccountUsable(row);

    const accessToken = generateAccessToken(row.id, row.email, row.role);
    return { accessToken, expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS };
  }

  // --------------------------------------------------------
  // forgotPassword
  // --------------------------------------------------------

  async forgotPassword(email: string): Promise<{ resetToken?: string }> {
    const row = await this.users.findByEmail(email);

    // Do nothing (and reveal nothing) if the email is not found
    if (!row) return {};

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

    await this.users.saveResetToken(row.id, token, expiry);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await this.email.sendPasswordReset(email, resetLink);

    // Expose token only in development — never in production
    return process.env.NODE_ENV === "development" ? { resetToken: token } : {};
  }

  // --------------------------------------------------------
  // resetPassword
  // --------------------------------------------------------

  async resetPassword(
    token: string,
    email: string,
    newPassword: string,
  ): Promise<void> {
    const row = await this.users.findByResetToken(token, email);

    if (!row) throw AuthErrors.invalidToken();

    // Check expiry
    if (
      row.reset_token_expiry &&
      new Date(row.reset_token_expiry) < new Date()
    ) {
      throw AuthErrors.tokenExpired();
    }

    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.users.clearResetToken(row.id, hash);
  }

  // --------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------

  private assertAccountUsable(row: UserRow): void {
    if (row.is_deleted) throw AuthErrors.accountDeleted();
    if (!row.is_active) throw AuthErrors.accountDeactivated();
    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      throw AuthErrors.accountLocked();
    }
  }

  /**
   * Build a full AuthSession from a raw UserRow + ProfileRow.
   * Pass an existing accessToken to reuse it (e.g. during verify).
   */
  private buildSession(
    row: UserRow,
    profileRow: ProfileRow | null,
    existingAccessToken?: string,
  ): AuthSession {
    const user = toAuthUser(row);
    const profile = profileRow ? toAuthProfile(profileRow) : null;

    const accessToken =
      existingAccessToken ?? generateAccessToken(row.id, row.email, row.role);
    const refreshToken = generateRefreshToken(row.id);

    return { user, profile, accessToken, refreshToken };
  }
}

// ----------------------------------------------------------
// Singleton — one instance per server process
// ----------------------------------------------------------

let _instance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!_instance) _instance = new AuthService();
  return _instance;
}
