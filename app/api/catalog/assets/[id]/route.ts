import { getSupabaseServer } from "@/lib/supabase/server";
import {
  optionalString,
  getIdParam,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

const ASSET_SELECT =
  "id,product_id,gdrive_link,notes,created_at,updated_at," +
  "product:products(id,title)";

type RouteContext = { params: { id: string } };

// ── GET /api/catalog/assets/[id] ────────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_assets")
      .select(ASSET_SELECT)
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Asset not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── PUT /api/catalog/assets/[id] ────────────────────────────────────
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    const rawLink = body?.gdrive_link ?? body?.gdriveLink;
    if (rawLink !== undefined) {
      updates.gdrive_link = optionalString(rawLink);
    }

    if (body?.notes !== undefined) {
      updates.notes = optionalString(body.notes);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No fields to update");
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_assets")
      .update(updates)
      .eq("id", id)
      .select(ASSET_SELECT)
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }
    if (!data) {
      return errorResponse("Asset not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    return catchError(error);
  }
}

// ── DELETE /api/catalog/assets/[id] ─────────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const id = getIdParam(params);
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("product_assets")
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
