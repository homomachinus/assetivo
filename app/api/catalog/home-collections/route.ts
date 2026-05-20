import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  optionalString,
  optionalBoolean,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── GET /api/catalog/home-collections ──────────────────────────────
// List all home collections. Supports ?active=true/false filter.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const supabase = getSupabaseServer();
    let query = supabase
      .from("home_collections")
      .select(
        "id,product_id,title,subtitle,is_active,created_at,updated_at," +
        "product:products(id,title,price,currency,image_url)"
      )
      .order("created_at", { ascending: false });

    if (active === "true") query = query.eq("is_active", true);
    if (active === "false") query = query.eq("is_active", false);

    const { data, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    const response = NextResponse.json({ data: data ?? [] });
    response.headers.set(
      "Cache-Control",
      "public, max-age=30, stale-while-revalidate=300"
    );
    return response;
  } catch (error) {
    return catchError(error);
  }
}

// ── POST /api/catalog/home-collections ─────────────────────────────
// Create a new home collection entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = requireString(body?.productId, "productId");
    const title = optionalString(body?.title);
    const subtitle = optionalString(body?.subtitle);
    const isActive = optionalBoolean(body?.isActive, true);

    const supabase = getSupabaseServer();

    // Validate product exists
    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError || !productRow) {
      return errorResponse("Invalid productId — product not found", 400);
    }

    const { data, error } = await supabase
      .from("home_collections")
      .insert({
        product_id: productId,
        title,
        subtitle,
        is_active: isActive
      })
      .select("id,product_id,title,subtitle,is_active,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, 201);
  } catch (error) {
    return catchError(error);
  }
}
