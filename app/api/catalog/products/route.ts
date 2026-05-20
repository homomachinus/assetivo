import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  throw new Error(`${field} is required`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lineIdRaw = body?.line_id ?? body?.lineId;
    const categoryIdRaw = body?.category_id ?? body?.categoryId;
    const lineId = requireString(lineIdRaw, "line_id");
    const categoryId = requireString(categoryIdRaw, "category_id");
    
    const variantTypeIdRaw = body?.variant_type_id ?? body?.variantTypeId;
    const variantColorIdRaw = body?.variant_color_id ?? body?.variantColorId;
    const variantTypeId = typeof variantTypeIdRaw === "string" && variantTypeIdRaw.trim() ? variantTypeIdRaw.trim() : null;
    const variantColorId = typeof variantColorIdRaw === "string" && variantColorIdRaw.trim() ? variantColorIdRaw.trim() : null;

    const title = requireString(body?.title, "title");
    const price = requireNumber(body?.price, "price");
    const currency = typeof body?.currency === "string" && body.currency.trim()
      ? body.currency.trim()
      : "IDR";
    const description = typeof body?.description === "string" ? body.description.trim() : null;
    const imageUrlRaw =
      typeof body?.imageUrl === "string"
        ? body.imageUrl
        : typeof body?.image_url === "string"
          ? body.image_url
          : "";
    const imageUrl = imageUrlRaw.trim().length > 0 ? imageUrlRaw.trim() : null;

    const supabase = getSupabaseServer();

    const { data: categoryRow, error: categoryError } = await supabase
      .from("product_categories")
      .select("id,line_id")
      .eq("id", categoryId)
      .single();

    if (categoryError || !categoryRow) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }

    if (categoryRow.line_id !== lineId) {
      return NextResponse.json({ error: "categoryId does not belong to lineId" }, { status: 400 });
    }

    if (variantTypeId !== null) {
      const { data: typeRow, error: typeError } = await supabase
        .from("variant_types")
        .select("id,category_id")
        .eq("id", variantTypeId)
        .single();

      if (typeError || !typeRow) {
        return NextResponse.json({ error: "Invalid variantTypeId" }, { status: 400 });
      }

      if (typeRow.category_id !== categoryId) {
        return NextResponse.json({ error: "variantTypeId does not belong to categoryId" }, { status: 400 });
      }
    }

    if (variantColorId !== null) {
      const { data: colorRow, error: colorError } = await supabase
        .from("variant_colors")
        .select("id")
        .eq("id", variantColorId)
        .single();

      if (colorError || !colorRow) {
        return NextResponse.json({ error: "Invalid variantColorId" }, { status: 400 });
      }
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
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: insertRow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

