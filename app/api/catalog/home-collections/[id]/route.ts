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

// ── GET /api/catalog/home-collections/[id] ─────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("home_collections")
      .select(
        "id,product_id,title,subtitle,is_active,created_at,updated_at," +
        "product:products(id,title,price,currency,image_url)"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Home collection not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/catalog/home-collections/[id] ─────────────────────────
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();
    const supabase = getSupabaseServer();

    const updates: Record<string, unknown> = {};

    if (body?.productId !== undefined) {
      const productId = requireString(body.productId, "productId");
      const { data: pRow } = await supabase
        .from("products")
        .select("id")
        .eq("id", productId)
        .single();
      if (!pRow) {
        return errorResponse("Invalid productId — product not found", 400);
      }
      updates.product_id = productId;
    }
    if (body?.title !== undefined) {
      updates.title = optionalString(body.title);
    }
    if (body?.subtitle !== undefined) {
      updates.subtitle = optionalString(body.subtitle);
    }
    if (body?.isActive !== undefined) {
      updates.is_active = optionalBoolean(body.isActive, true);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    const { data, error } = await supabase
      .from("home_collections")
      .update(updates)
      .eq("id", id)
      .select("id,product_id,title,subtitle,is_active,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Home collection not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/catalog/home-collections/[id] ──────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("home_collections")
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
