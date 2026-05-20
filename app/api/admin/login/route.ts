import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  comparePassword,
  signToken,
  makeTokenCookie,
  type AdminRow,
  type AdminPayload
} from "@/lib/auth";
import { requireString, errorResponse, catchError } from "@/lib/api-helpers";

// ── POST /api/admin/login ──────────────────────────────────────────
// Admin login with email + password. Returns JWT in httpOnly cookie.
//
// Body: { "email": "...", "password": "..." }
//
// Success 200: { data: { id, email, full_name, role, token } }
// Error 400:   missing fields
// Error 401:   invalid credentials / account disabled
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = requireString(body?.email, "email").toLowerCase();
    const password = requireString(body?.password, "password");

    const supabase = getSupabaseServer();

    // Fetch admin user by email (including password hash)
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id,email,full_name,role,is_active,password")
      .eq("email", email)
      .single();

    if (error || !admin) {
      // Intentionally vague to prevent email enumeration
      return errorResponse("Invalid email or password", 401);
    }

    const adminRow = admin as AdminRow;

    // Check if account is active
    if (!adminRow.is_active) {
      return errorResponse("Account is disabled. Contact administrator.", 401);
    }

    // Verify password with bcrypt
    const passwordValid = await comparePassword(password, adminRow.password);
    if (!passwordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Create JWT payload
    const payload: AdminPayload = {
      id: adminRow.id,
      email: adminRow.email,
      role: adminRow.role,
    };

    const token = signToken(payload);

    // Set httpOnly cookie and return response
    const response = NextResponse.json({
      data: {
        id: adminRow.id,
        email: adminRow.email,
        fullName: adminRow.full_name,
        role: adminRow.role,
        token, // Also return token in body for API clients
      },
    });

    response.headers.set("Set-Cookie", makeTokenCookie(token));

    return response;
  } catch (error) {
    return catchError(error);
  }
}
