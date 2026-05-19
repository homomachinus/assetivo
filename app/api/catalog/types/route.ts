import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const categoryId = requireString(body?.categoryId, "categoryId");
    const name = requireString(body?.name, "name");

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_types")
      .insert({ category_id: categoryId, name })
      .select("id,category_id,name")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
