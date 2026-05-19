import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  getIdParam,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

type RouteContext = { params: { id: string } };

// ── GET /api/catalog/colors/[id] ───────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_colors")
      .select("id,name,created_at,updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Variant color not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/catalog/colors/[id] ───────────────────────────────────
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body?.name !== undefined) {
      updates.name = requireString(body.name, "name");
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_colors")
      .update(updates)
      .eq("id", id)
      .select("id,name,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Variant color not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/catalog/colors/[id] ────────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("variant_colors")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.message.includes("violates foreign key")) {
        return errorResponse(
          "Cannot delete: this color is referenced by products",
          409
        );
      }
      return errorResponse(error.message, 500);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return catchError(error);
  }
}
