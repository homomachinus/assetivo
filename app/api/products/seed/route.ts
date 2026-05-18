import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { getSupabaseServer } from "@/lib/supabase/server";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

type SeedMode = "replace" | "append";

function mapProduct() {
  return products.map((product) => ({
    line: product.line,
    category: product.category,
    variant_type: product.variantType,
    variant_color: product.variantColor,
    title: product.name,
    description: product.description,
    price: product.price,
    currency: "IDR",
    image_url: product.image
  }));
}

export async function POST(request: Request) {
  try {
    const seedToken = process.env.SEED_TOKEN;
    const providedToken = request.headers.get("x-seed-token");

    if (seedToken && providedToken !== seedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get("mode") ?? "replace") as SeedMode;
    const supabase = getSupabaseServer();

    if (mode === "replace") {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .neq("id", ZERO_UUID);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    const payload = mapProduct();
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inserted: data?.length ?? 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
