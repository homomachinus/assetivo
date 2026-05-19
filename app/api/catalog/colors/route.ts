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
    const name = requireString(body?.name, "name");

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("variant_colors")
      .insert({ name })
      .select("id,name")
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

