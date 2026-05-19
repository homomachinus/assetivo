import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  optionalString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── GET /api/catalog/categories ────────────────────────────────────
// List all product categories (optionally filter by ?lineId=)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get("lineId");

    const supabase = getSupabaseServer();
    let query = supabase
      .from("product_categories")
      .select("id,line_id,name,description,created_at,updated_at,line:product_lines(name)")
      .order("name", { ascending: true });

    if (lineId) {
      query = query.eq("line_id", lineId);
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

// ── POST /api/catalog/categories ───────────────────────────────────
// Create a new product category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lineId = requireString(body?.lineId, "lineId");
    const name = requireString(body?.name, "name");
    const description = optionalString(body?.description);

    const supabase = getSupabaseServer();

    // Validate that the line exists
    const { data: lineRow, error: lineError } = await supabase
      .from("product_lines")
      .select("id")
      .eq("id", lineId)
      .single();

    if (lineError || !lineRow) {
      return errorResponse("Invalid lineId — product line not found", 400);
    }

    const { data, error } = await supabase
      .from("product_categories")
      .insert({ line_id: lineId, name, description })
      .select("id,line_id,name,description,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, 201);
  } catch (error) {
    return catchError(error);
  }
}
