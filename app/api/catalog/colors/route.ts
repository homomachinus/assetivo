import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── GET /api/catalog/colors ────────────────────────────────────────
// List all variant colors
export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_colors")
      .select("id,name,created_at,updated_at")
      .order("name", { ascending: true });

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

// ── POST /api/catalog/colors ───────────────────────────────────────
// Create a new variant color
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = requireString(body?.name, "name");

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_colors")
      .insert({ name })
      .select("id,name,created_at,updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, 201);
  } catch (error) {
    return catchError(error);
  }
}
