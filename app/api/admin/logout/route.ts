import { NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth";

// ── POST /api/admin/logout ─────────────────────────────────────────
// Admin logout. Clears the httpOnly cookie.
//
// Success 200: { data: { loggedOut: true } }
export async function POST() {
  const response = NextResponse.json({
    data: { loggedOut: true },
  });

  response.headers.set("Set-Cookie", clearTokenCookie());

  return response;
}
