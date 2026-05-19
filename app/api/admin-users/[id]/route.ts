import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  optionalString,
  optionalBoolean,
  getIdParam,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

type RouteContext = { params: { id: string } };

// ── GET /api/admin-users/[id] ──────────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id,email,full_name,role,is_active,created_at,updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Admin user not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/admin-users/[id] ──────────────────────────────────────
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body?.email !== undefined) {
      updates.email = requireString(body.email, "email");
    }
    if (body?.fullName !== undefined || body?.full_name !== undefined) {
      updates.full_name = optionalString(body.fullName ?? body.full_name);
    }
    if (body?.role !== undefined) {
      updates.role = requireString(body.role, "role");
    }
    if (body?.isActive !== undefined || body?.is_active !== undefined) {
      updates.is_active = optionalBoolean(body.isActive ?? body.is_active, true);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select("id,email,full_name,role,is_active,created_at,updated_at")
      .single();

    if (error) {
      if (error.message.includes("duplicate key") || error.message.includes("unique")) {
        return errorResponse("An admin user with this email already exists", 409);
      }
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Admin user not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/admin-users/[id] ───────────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return catchError(error);
  }
}
