import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  optionalString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

const ASSET_SELECT =
  "id,product_id,gdrive_link,notes,created_at,updated_at," +
  "product:products(id,title)";

// ── GET /api/catalog/assets ─────────────────────────────────────────
export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_assets")
      .select(ASSET_SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data ?? []);
  } catch (error) {
    return catchError(error);
  }
}

// ── POST /api/catalog/assets ────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = requireString(body?.product_id ?? body?.productId, "product_id");
    const gdriveLink = optionalString(body?.gdrive_link ?? body?.gdriveLink);
    const notes = optionalString(body?.notes);

    const supabase = getSupabaseServer();

    // Validate product exists
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (!product) {
      return errorResponse("Product not found", 400);
    }

    const { data, error } = await supabase
      .from("product_assets")
      .insert({ product_id: productId, gdrive_link: gdriveLink, notes })
      .select(ASSET_SELECT)
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, 201);
  } catch (error) {
    return catchError(error);
  }
}
