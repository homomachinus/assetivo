import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// ── Types ──────────────────────────────────────────────────────────

export type AdminPayload = {
  id: string;
  email: string;
  role: string;
};

type AdminRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  password: string;
};

// ── Env ────────────────────────────────────────────────────────────

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return secret;
}

const TOKEN_EXPIRY = "24h";
const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// ── Password helpers ───────────────────────────────────────────────

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password with bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a bcrypt hash.
 */
export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT helpers ────────────────────────────────────────────────────

/**
 * Sign a JWT containing the admin user payload.
 */
export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT. Returns the payload or null if invalid/expired.
 */
export function verifyToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminPayload;
    return decoded;
  } catch {
    return null;
  }
}

// ── Cookie helpers ─────────────────────────────────────────────────

/**
 * Create a Set-Cookie header value for the admin token.
 */
export function makeTokenCookie(token: string): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${COOKIE_MAX_AGE}`,
  ];

  // Only set Secure in production (HTTPS)
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/**
 * Create a Set-Cookie header that clears the admin token.
 */
export function clearTokenCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/**
 * Extract the admin token from the request cookies.
 */
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
  );
  if (match) return match[1];

  // Also check Authorization header as fallback (for API clients)
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

// ── Request guard ──────────────────────────────────────────────────

/**
 * Verify that the request carries a valid admin JWT.
 * Returns the admin payload on success or a 401 response on failure.
 */
export function requireAdmin(
  request: Request
): AdminPayload | NextResponse {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  return payload;
}

/**
 * Type guard to check if requireAdmin returned a Response (401).
 */
export function isAuthError(
  result: AdminPayload | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}

export { COOKIE_NAME };
export type { AdminRow };
