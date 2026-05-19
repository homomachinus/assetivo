import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  getIdParam,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

type RouteContext = { params: { id: string } };

// ── GET /api/catalog/types/[id] ────────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_types")
      .select("id,category_id,name,created_at,updated_at,category:product_categories(name)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Variant type not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/catalog/types/[id] ────────────────────────────────────
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body?.categoryId !== undefined) {
      const categoryId = requireString(body.categoryId, "categoryId");
      const supabase = getSupabaseServer();
      const { data: catRow } = await supabase
        .from("product_categories")
        .select("id")
        .eq("id", categoryId)
        .single();
      if (!catRow) {
        return errorResponse("Invalid categoryId — category not found", 400);
      }
      updates.category_id = categoryId;
    }
    if (body?.name !== undefined) {
      updates.name = requireString(body.name, "name");
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_types")
      .update(updates)
      .eq("id", id)
      .select("id,category_id,name,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Variant type not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/catalog/types/[id] ─────────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("variant_types")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.message.includes("violates foreign key")) {
        return errorResponse(
          "Cannot delete: this variant type is referenced by products",
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
