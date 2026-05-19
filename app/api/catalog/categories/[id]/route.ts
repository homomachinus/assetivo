import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  optionalString,
  getIdParam,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

type RouteContext = { params: { id: string } };

// ── GET /api/catalog/categories/[id] ───────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_categories")
      .select("id,line_id,name,description,created_at,updated_at,line:product_lines(name)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Product category not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/catalog/categories/[id] ───────────────────────────────
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body?.lineId !== undefined) {
      const lineId = requireString(body.lineId, "lineId");
      // Validate line exists
      const supabase = getSupabaseServer();
      const { data: lineRow } = await supabase
        .from("product_lines")
        .select("id")
        .eq("id", lineId)
        .single();
      if (!lineRow) {
        return errorResponse("Invalid lineId — product line not found", 400);
      }
      updates.line_id = lineId;
    }
    if (body?.name !== undefined) {
      updates.name = requireString(body.name, "name");
    }
    if (body?.description !== undefined) {
      updates.description = optionalString(body.description);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_categories")
      .update(updates)
      .eq("id", id)
      .select("id,line_id,name,description,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Product category not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/catalog/categories/[id] ────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.message.includes("violates foreign key")) {
        return errorResponse(
          "Cannot delete: this category is referenced by variant types or products",
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
