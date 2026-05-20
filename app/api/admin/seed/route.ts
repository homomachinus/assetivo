import { getSupabaseServer } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth";
import { requireString, successResponse, errorResponse, catchError } from "@/lib/api-helpers";

// ── POST /api/admin/seed ───────────────────────────────────────────
// Seed initial admin user. Protected by SEED_TOKEN env variable.
// This is a one-time setup endpoint — use it to create your first admin.
//
// Body: { "email": "...", "password": "...", "fullName": "...", "seedToken": "..." }
//
// The seedToken must match the SEED_TOKEN env variable.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seedToken = requireString(body?.seedToken, "seedToken");
    const email = requireString(body?.email, "email").toLowerCase();
    const password = requireString(body?.password, "password");
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : null;

    // Verify seed token
    const expectedToken = process.env.SEED_TOKEN;
    if (!expectedToken || seedToken !== expectedToken) {
      return errorResponse("Invalid seed token", 403);
    }

    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters", 400);
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        email,
        full_name: fullName,
        role: "admin",
        is_active: true,
        password: hashedPassword,
      })
      .select("id,email,full_name,role,is_active,created_at")
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
