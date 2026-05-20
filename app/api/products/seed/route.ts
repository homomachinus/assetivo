import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { getSupabaseServer } from "@/lib/supabase/server";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

type SeedMode = "replace" | "append";

type LineRow = { id: string; name: string };
type CategoryRow = { id: string; line_id: string; name: string };
type VariantTypeRow = { id: string; category_id: string; name: string };
type VariantColorRow = { id: string; name: string };

function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

function requireId<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
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
      const tables = [
        "home_collections",
        "products",
        "variant_types",
        "product_categories",
        "product_lines",
        "variant_colors"
      ];

      for (const table of tables) {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq("id", ZERO_UUID);

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
      }
    }

    const linePayload = uniqueBy(
      products.map((product) => ({ name: product.line })),
      (item) => item.name
    );

    const { data: lineRows, error: lineError } = await supabase
      .from("product_lines")
      .upsert(linePayload, { onConflict: "name" })
      .select("id,name");

    if (lineError || !lineRows) {
      return NextResponse.json({ error: lineError?.message ?? "Failed to seed lines" }, { status: 500 });
    }

    const lineIdByName = new Map(lineRows.map((row: LineRow) => [row.name, row.id]));

    const categoryPayload = uniqueBy(
      products.map((product) => ({
        line_id: requireId(
          lineIdByName.get(product.line),
          `Missing line id for ${product.line}`
        ),
        name: product.category
      })),
      (item) => `${item.line_id}::${item.name}`
    );

    const { data: categoryRows, error: categoryError } = await supabase
      .from("product_categories")
      .upsert(categoryPayload, { onConflict: "line_id,name" })
      .select("id,line_id,name");

    if (categoryError || !categoryRows) {
      return NextResponse.json(
        { error: categoryError?.message ?? "Failed to seed categories" },
        { status: 500 }
      );
    }

    const categoryIdByKey = new Map(
      categoryRows.map((row: CategoryRow) => [`${row.line_id}::${row.name}`, row.id])
    );

    const typePayload = uniqueBy(
      products.map((product) => {
        const lineId = requireId(
          lineIdByName.get(product.line),
          `Missing line id for ${product.line}`
        );
        const categoryId = requireId(
          categoryIdByKey.get(`${lineId}::${product.category}`),
          `Missing category id for ${product.line} / ${product.category}`
        );
        return {
          category_id: categoryId,
          name: product.variantType
        };
      }),
      (item) => `${item.category_id}::${item.name}`
    );

    const { data: typeRows, error: typeError } = await supabase
      .from("variant_types")
      .upsert(typePayload, { onConflict: "category_id,name" })
      .select("id,category_id,name");

    if (typeError || !typeRows) {
      return NextResponse.json({ error: typeError?.message ?? "Failed to seed types" }, { status: 500 });
    }

    const typeIdByKey = new Map(
      typeRows.map((row: VariantTypeRow) => [`${row.category_id}::${row.name}`, row.id])
    );

    const colorPayload = uniqueBy(
      products.map((product) => ({ name: product.variantColor })),
      (item) => item.name
    );

    const { data: colorRows, error: colorError } = await supabase
      .from("variant_colors")
      .upsert(colorPayload, { onConflict: "name" })
      .select("id,name");

    if (colorError || !colorRows) {
      return NextResponse.json({ error: colorError?.message ?? "Failed to seed colors" }, { status: 500 });
    }

    const colorIdByName = new Map(
      colorRows.map((row: VariantColorRow) => [row.name, row.id])
    );

    const productPayload = products.map((product) => {
      const lineId = requireId(
        lineIdByName.get(product.line),
        `Missing line id for ${product.line}`
      );
      const categoryId = requireId(
        categoryIdByKey.get(`${lineId}::${product.category}`),
        `Missing category id for ${product.line} / ${product.category}`
      );
      const typeId = requireId(
        typeIdByKey.get(`${categoryId}::${product.variantType}`),
        `Missing type id for ${product.category} / ${product.variantType}`
      );
      const colorId = requireId(
        colorIdByName.get(product.variantColor),
        `Missing color id for ${product.variantColor}`
      );

      return {
        line_id: lineId,
        category_id: categoryId,
        variant_type_id: typeId,
        variant_color_id: colorId,
        title: product.name,
        description: product.description,
        price: product.price,
        currency: "IDR",
        image_url: product.image
      };
    });

    const { data: productRows, error: productError } = await supabase
      .from("products")
      .insert(productPayload)
      .select("id");

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    let homeInserted = 0;
    const featuredProductId = productRows?.[0]?.id;

    if (mode === "replace" && featuredProductId) {
      const { error: homeError } = await supabase
        .from("home_collections")
        .insert({ product_id: featuredProductId });

      if (homeError) {
        return NextResponse.json({ error: homeError.message }, { status: 500 });
      }
      homeInserted = 1;
    }

    return NextResponse.json({
      inserted: productRows?.length ?? 0,
      lines: lineRows.length,
      categories: categoryRows.length,
      types: typeRows.length,
      colors: colorRows.length,
      homeCollections: homeInserted
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
