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

    const bodyLineId = body?.line_id ?? body?.lineId;
    if (bodyLineId !== undefined) {
      lineId = requireString(bodyLineId, "line_id");
      updates.line_id = lineId;
    }

    const bodyCategoryId = body?.category_id ?? body?.categoryId;
    if (bodyCategoryId !== undefined) {
      categoryId = requireString(bodyCategoryId, "category_id");
      updates.category_id = categoryId;
    }

    const NIL_UUID = "00000000-0000-0000-0000-000000000000";

    const bodyVariantTypeId = body?.variant_type_id ?? body?.variantTypeId;
    if (bodyVariantTypeId !== undefined) {
      const raw = typeof bodyVariantTypeId === "string" ? bodyVariantTypeId.trim() : "";
      updates.variant_type_id = raw || NIL_UUID;
    }

    const bodyVariantColorId = body?.variant_color_id ?? body?.variantColorId;
    if (bodyVariantColorId !== undefined) {
      const raw = typeof bodyVariantColorId === "string" ? bodyVariantColorId.trim() : "";
      updates.variant_color_id = raw || NIL_UUID;
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
    if (updates.variant_color_id && updates.variant_color_id !== NIL_UUID) {
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
    if (updates.variant_type_id && updates.variant_type_id !== NIL_UUID) {
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
