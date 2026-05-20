import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireAdmin,
  isAuthError,
  comparePassword,
  hashPassword,
  type AdminRow,
} from "@/lib/auth";
import { requireString, successResponse, errorResponse, catchError } from "@/lib/api-helpers";

// ── PUT /api/admin/change-password ─────────────────────────────────
// Change admin password. Requires current password verification.
//
// Body: { "currentPassword": "...", "newPassword": "..." }
//
// Success 200: { data: { updated: true } }
// Error 400:   missing fields / password too short
// Error 401:   not authenticated / current password wrong
export async function PUT(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const currentPassword = requireString(body?.currentPassword, "currentPassword");
    const newPassword = requireString(body?.newPassword, "newPassword");

    if (newPassword.length < 8) {
      return errorResponse("New password must be at least 8 characters", 400);
    }

    const supabase = getSupabaseServer();

    // Fetch current password hash
    const { data: admin, error: fetchError } = await supabase
      .from("admin_users")
      .select("id,password")
      .eq("id", auth.id)
      .single();

    if (fetchError || !admin) {
      return errorResponse("Admin user not found", 404);
    }

    const adminRow = admin as Pick<AdminRow, "id" | "password">;

    // Verify current password
    const isValid = await comparePassword(currentPassword, adminRow.password);
    if (!isValid) {
      return errorResponse("Current password is incorrect", 401);
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password: hashedPassword })
      .eq("id", auth.id);

    if (updateError) {
      return errorResponse(updateError.message, 500);
    }

    return successResponse({ updated: true });
  } catch (error) {
    return catchError(error);
  }
}
