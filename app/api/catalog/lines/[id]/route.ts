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

// ── GET /api/catalog/lines/[id] ────────────────────────────────────
// Get a single product line by ID
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_lines")
      .select("id,name,description,created_at,updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Product line not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/catalog/lines/[id] ────────────────────────────────────
// Update a product line
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();

    const updates: Record<string, unknown> = {};
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
      .from("product_lines")
      .update(updates)
      .eq("id", id)
      .select("id,name,description,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Product line not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/catalog/lines/[id] ─────────────────────────────────
// Delete a product line (will fail if referenced by categories/products)
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("product_lines")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.message.includes("violates foreign key")) {
        return errorResponse(
          "Cannot delete: this product line is referenced by categories or products",
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
