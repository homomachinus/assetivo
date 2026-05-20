import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  requireString,
  optionalString,
  successResponse,
  errorResponse,
  catchError
} from "@/lib/api-helpers";

// ── POST /api/catalog/colors ────────────────────────────────────────
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

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_colors")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

