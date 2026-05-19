import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  PRODUCTS_SELECT,
  mapDbProducts,
  type DbProductRow
} from "@/lib/products";
import {
  requireString,
  requireNumber,
  optionalString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── GET /api/catalog/products ──────────────────────────────────────
// List all products with joined names. Supports query filters:
//   ?lineId=      — filter by product line
//   ?categoryId=  — filter by category
//   ?search=      — search by title (ilike)
//   ?limit=       — limit results (default: 100)
//   ?offset=      — offset for pagination (default: 0)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get("lineId");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const limit = Math.min(Number(searchParams.get("limit") || 100), 500);
    const offset = Number(searchParams.get("offset") || 0);

    const supabase = getSupabaseServer();
    let query = supabase
      .from("products")
      .select(PRODUCTS_SELECT, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (lineId) query = query.eq("line_id", lineId);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    const mapped = mapDbProducts((data ?? []) as unknown as DbProductRow[]);
    const response = NextResponse.json({
      data: mapped,
      meta: { total: count ?? mapped.length, limit, offset }
    });
    response.headers.set(
      "Cache-Control",
      "public, max-age=30, stale-while-revalidate=300"
    );
    return response;
  } catch (error) {
    return catchError(error);
  }
}

// ── POST /api/catalog/products ─────────────────────────────────────
// Create a new product with FK validation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lineId = requireString(body?.lineId, "lineId");
    const categoryId = requireString(body?.categoryId, "categoryId");
    const variantTypeId = requireString(body?.variantTypeId, "variantTypeId");
    const variantColorId = requireString(body?.variantColorId, "variantColorId");
    const title = requireString(body?.title, "title");
    const price = requireNumber(body?.price, "price");
    const currency =
      typeof body?.currency === "string" && body.currency.trim()
        ? body.currency.trim()
        : "IDR";
    const description = optionalString(body?.description);
    const imageUrlRaw =
      typeof body?.imageUrl === "string"
        ? body.imageUrl
        : typeof body?.image_url === "string"
          ? body.image_url
          : "";
    const imageUrl = imageUrlRaw.trim().length > 0 ? imageUrlRaw.trim() : null;

    const supabase = getSupabaseServer();

    // Validate category belongs to line
    const { data: categoryRow, error: categoryError } = await supabase
      .from("product_categories")
      .select("id,line_id")
      .eq("id", categoryId)
      .single();

    if (categoryError || !categoryRow) {
      return errorResponse("Invalid categoryId", 400);
    }
    if (categoryRow.line_id !== lineId) {
      return errorResponse("categoryId does not belong to lineId", 400);
    }

    // Validate variant type belongs to category
    const { data: typeRow, error: typeError } = await supabase
      .from("variant_types")
      .select("id,category_id")
      .eq("id", variantTypeId)
      .single();

    if (typeError || !typeRow) {
      return errorResponse("Invalid variantTypeId", 400);
    }
    if (typeRow.category_id !== categoryId) {
      return errorResponse("variantTypeId does not belong to categoryId", 400);
    }

    // Validate color exists
    const { data: colorRow, error: colorError } = await supabase
      .from("variant_colors")
      .select("id")
      .eq("id", variantColorId)
      .single();

    if (colorError || !colorRow) {
      return errorResponse("Invalid variantColorId", 400);
    }

    const { data: insertRow, error: insertError } = await supabase
      .from("products")
      .insert({
        line_id: lineId,
        category_id: categoryId,
        variant_type_id: variantTypeId,
        variant_color_id: variantColorId,
        title,
        description,
        price,
        currency,
        image_url: imageUrl
      })
      .select("id,title,price,currency,created_at")
      .single();

    if (insertError) {
      return errorResponse(insertError.message, 500);
    }

    return successResponse(insertRow, 201);
  } catch (error) {
    return catchError(error);
  }
}
