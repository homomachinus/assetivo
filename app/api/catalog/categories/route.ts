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
    const lineId = requireString(body?.lineId, "lineId");
    const name = requireString(body?.name, "name");
    const description = typeof body?.description === "string" ? body.description.trim() : null;

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_categories")
      .insert({ line_id: lineId, name, description })
      .select("id,line_id,name,description")
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
