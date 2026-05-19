import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PRODUCTS_SELECT, mapDbProducts, type DbProductRow } from "@/lib/products";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const debug = requestUrl.searchParams.get("debug") === "1";
    const cacheControl = debug
      ? "no-store"
      : "public, max-age=30, stale-while-revalidate=300";
    let projectRef = "";
    try {
      const supabaseUrl = process.env.SUPABASE_URL ?? "";
      if (supabaseUrl) {
        projectRef = new URL(supabaseUrl).hostname.split(".")[0] ?? "";
      }
    } catch {
      projectRef = "";
    }

    const supabase = getSupabaseServer();
    const { data, error, count } = await supabase
      .from("products")
      .select(PRODUCTS_SELECT, { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/products error:", error.message);
      const fallback = await supabase.from("products").select(PRODUCTS_SELECT);
      if (fallback.error) {
        console.error("GET /api/products fallback error:", fallback.error.message);
        return NextResponse.json({ error: fallback.error.message }, { status: 500 });
      }
      const mapped = mapDbProducts((fallback.data ?? []) as unknown as DbProductRow[]);
      const response = { data: mapped } as {
        data: ReturnType<typeof mapDbProducts>;
        meta?: { count: number; projectRef: string };
      };
      if (debug) {
        response.meta = { count: mapped.length, projectRef };
      }
      const result = NextResponse.json(response);
      result.headers.set("Cache-Control", cacheControl);
      return result;
    }

    const mapped = mapDbProducts((data ?? []) as unknown as DbProductRow[]);
    const response = { data: mapped } as {
      data: ReturnType<typeof mapDbProducts>;
      meta?: { count: number; projectRef: string };
    };
    if (debug) {
      response.meta = { count: count ?? mapped.length, projectRef };
    }
    const result = NextResponse.json(response);
    result.headers.set("Cache-Control", cacheControl);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
