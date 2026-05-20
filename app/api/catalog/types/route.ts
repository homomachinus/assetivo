import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── GET /api/catalog/types ─────────────────────────────────────────
// List all variant types (optionally filter by ?categoryId=)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const supabase = getSupabaseServer();
    let query = supabase
      .from("variant_types")
      .select("id,category_id,name,created_at,updated_at,category:product_categories(name)")
      .order("name", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

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

// ── POST /api/catalog/types ────────────────────────────────────────
// Create a new variant type
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const categoryIdRaw = body?.category_id ?? body?.categoryId;
    const categoryId = requireString(categoryIdRaw, "category_id");
    const name = requireString(body?.name, "name");

    const supabase = getSupabaseServer();

    // Validate category exists
    const { data: catRow, error: catError } = await supabase
      .from("product_categories")
      .select("id")
      .eq("id", categoryId)
      .single();

    if (catError || !catRow) {
      return errorResponse("Invalid categoryId — category not found", 400);
    }

    const { data, error } = await supabase
      .from("variant_types")
      .insert({ category_id: categoryId, name })
      .select("id,category_id,name,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, 201);
  } catch (error) {
    return catchError(error);
  }
}
