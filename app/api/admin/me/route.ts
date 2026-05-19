import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireAdmin,
  isAuthError,
} from "@/lib/auth";
import { successResponse, errorResponse, catchError } from "@/lib/api-helpers";

// ── GET /api/admin/me ──────────────────────────────────────────────
// Get current authenticated admin profile.
// Requires a valid JWT (cookie or Authorization header).
//
// Success 200: { data: { id, email, full_name, role, is_active, created_at } }
// Error 401:   not authenticated / invalid token
export async function GET(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (isAuthError(auth)) return auth;

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id,email,full_name,role,is_active,created_at,updated_at")
      .eq("id", auth.id)
      .single();

    if (error || !data) {
      return errorResponse("Admin user not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}
