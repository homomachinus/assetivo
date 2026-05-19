import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireAdmin, isAuthError } from "@/lib/auth";
import {
  requireString,
  optionalString,
  optionalBoolean,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── GET /api/admin-users ───────────────────────────────────────────
// List all admin users. Supports ?active=true/false filter.
export async function GET(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (isAuthError(auth)) {
      return NextResponse.json({ error: "hayoo mau liat apa" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const supabase = getSupabaseServer();
    let query = supabase
      .from("admin_users")
      .select("id,email,full_name,role,is_active,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (active === "true") query = query.eq("is_active", true);
    if (active === "false") query = query.eq("is_active", false);

    const { data, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    const response = NextResponse.json({ data: data ?? [] });
    response.headers.set("Cache-Control", "private, no-cache");
    return response;
  } catch (error) {
    return catchError(error);
  }
}

// ── POST /api/admin-users ──────────────────────────────────────────
// Create a new admin user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = requireString(body?.email, "email");
    const fullName = optionalString(body?.fullName ?? body?.full_name);
    const role = typeof body?.role === "string" && body.role.trim()
      ? body.role.trim()
      : "admin";
    const isActive = optionalBoolean(body?.isActive ?? body?.is_active, true);

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        email,
        full_name: fullName,
        role,
        is_active: isActive
      })
      .select("id,email,full_name,role,is_active,created_at,updated_at")
      .single();

    if (error) {
      if (error.message.includes("duplicate key") || error.message.includes("unique")) {
        return errorResponse("An admin user with this email already exists", 409);
      }
      return errorResponse(error.message, 500);
    }

    return successResponse(data, 201);
  } catch (error) {
    return catchError(error);
  }
}
