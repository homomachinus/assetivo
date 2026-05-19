import { getSupabaseServer } from "@/lib/supabase/server";
import {
  PRODUCTS_SELECT,
  mapDbProduct,
  type DbProductRow
} from "@/lib/products";
import {
  requireString,
  requireNumber,
  optionalString,
  getIdParam,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

type RouteContext = { params: { id: string } };

// ── GET /api/catalog/products/[id] ─────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCTS_SELECT)
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(mapDbProduct(data as unknown as DbProductRow));
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/catalog/products/[id] ─────────────────────────────────
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();
    const supabase = getSupabaseServer();

    const updates: Record<string, unknown> = {};

    // Collect simple fields
    if (body?.title !== undefined) {
      updates.title = requireString(body.title, "title");
    }
    if (body?.description !== undefined) {
      updates.description = optionalString(body.description);
    }
    if (body?.price !== undefined) {
      updates.price = requireNumber(body.price, "price");
    }
    if (body?.currency !== undefined) {
      updates.currency = requireString(body.currency, "currency");
    }
    if (body?.imageUrl !== undefined || body?.image_url !== undefined) {
      const raw = body.imageUrl ?? body.image_url;
      updates.image_url = optionalString(raw);
    }

    // FK fields with validation
    let lineId: string | undefined;
    let categoryId: string | undefined;

    if (body?.lineId !== undefined) {
      lineId = requireString(body.lineId, "lineId");
      updates.line_id = lineId;
    }
    if (body?.categoryId !== undefined) {
      categoryId = requireString(body.categoryId, "categoryId");
      updates.category_id = categoryId;
    }
    if (body?.variantTypeId !== undefined) {
      updates.variant_type_id = requireString(body.variantTypeId, "variantTypeId");
    }
    if (body?.variantColorId !== undefined) {
      updates.variant_color_id = requireString(body.variantColorId, "variantColorId");
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    // If changing line_id or category_id, validate relationship
    if (lineId && categoryId) {
      const { data: catRow } = await supabase
        .from("product_categories")
        .select("id,line_id")
        .eq("id", categoryId)
        .single();
      if (!catRow) {
        return errorResponse("Invalid categoryId", 400);
      }
      if (catRow.line_id !== lineId) {
        return errorResponse("categoryId does not belong to lineId", 400);
      }
    }

    // Validate variant color if provided
    if (updates.variant_color_id) {
      const { data: colorRow } = await supabase
        .from("variant_colors")
        .select("id")
        .eq("id", updates.variant_color_id as string)
        .single();
      if (!colorRow) {
        return errorResponse("Invalid variantColorId", 400);
      }
    }

    // Validate variant type if provided
    if (updates.variant_type_id) {
      const { data: typeRow } = await supabase
        .from("variant_types")
        .select("id")
        .eq("id", updates.variant_type_id as string)
        .single();
      if (!typeRow) {
        return errorResponse("Invalid variantTypeId", 400);
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select(PRODUCTS_SELECT)
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(mapDbProduct(data as unknown as DbProductRow));
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/catalog/products/[id] ──────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.message.includes("violates foreign key")) {
        return errorResponse(
          "Cannot delete: this product is referenced by home collections",
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
