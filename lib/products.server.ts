import "server-only";

import { unstable_cache, unstable_noStore as noStore } from "next/cache";

import { getSupabaseServer } from "@/lib/supabase/server";
import {
  PRODUCTS_SELECT,
  mapDbProduct,
  mapDbProducts,
  type DbProductRow,
  type Product
} from "@/lib/products";

type ProductLine = { id: string; name: string };

function logTiming(label: string, startedAt: number) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  const elapsed = Date.now() - startedAt;
  console.log(`[timing] ${label} ${elapsed}ms`);
}

const fetchProductLinesCached = unstable_cache(
  async () => {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("product_lines")
      .select("id,name")
      .order("name", { ascending: true });

    if (error || !data) {
      if (error) {
        console.error("fetchProductLines error:", error.message);
      }
      return [];
    }

    return data as ProductLine[];
  },
  ["product-lines"],
  { revalidate: 30 }
);

export async function fetchProductLines(): Promise<ProductLine[]> {
  const startedAt = Date.now();
  try {
    return await fetchProductLinesCached();
  } finally {
    logTiming("fetchProductLines", startedAt);
  }
}

const fetchProductByIdCached = unstable_cache(
  async (id: string) => {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCTS_SELECT)
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapDbProduct(data as DbProductRow);
  },
  ["product-by-id"],
  { revalidate: 60 }
);

const fetchRelatedProductsCached = unstable_cache(
  async (lineId: string, categoryId: string, excludeId: string, count: number) => {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCTS_SELECT)
      .eq("line_id", lineId)
      .eq("category_id", categoryId)
      .neq("id", excludeId)
      .limit(count);

    if (error || !data) {
      return [];
    }

    return mapDbProducts(data as DbProductRow[]);
  },
  ["related-products"],
  { revalidate: 60 }
);

export async function fetchProducts(): Promise<Product[]> {
  noStore();
  const startedAt = Date.now();
  const supabase = getSupabaseServer();
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCTS_SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchProducts error:", error.message);
      const fallback = await supabase.from("products").select(PRODUCTS_SELECT);
      if (fallback.error || !fallback.data) {
        if (fallback.error) {
          console.error("fetchProducts fallback error:", fallback.error.message);
        }
        return [];
      }
      return mapDbProducts(fallback.data as DbProductRow[]);
    }

    if (!data) {
      return [];
    }

    return mapDbProducts(data as DbProductRow[]);
  } finally {
    logTiming("fetchProducts", startedAt);
  }
}

export async function fetchHomeCollectionProduct(): Promise<Product | null> {
  noStore();
  const startedAt = Date.now();
  const supabase = getSupabaseServer();
  try {
    const { data, error } = await supabase
      .from("home_collections")
      .select("product_id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data?.product_id) {
      return null;
    }

    const { data: productRow, error: productError } = await supabase
      .from("products")
      .select(PRODUCTS_SELECT)
      .eq("id", data.product_id)
      .single();

    if (productError || !productRow) {
      return null;
    }

    return mapDbProduct(productRow as DbProductRow);
  } finally {
    logTiming("fetchHomeCollectionProduct", startedAt);
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const startedAt = Date.now();
  try {
    return await fetchProductByIdCached(id);
  } finally {
    logTiming("fetchProductById", startedAt);
  }
}

export async function fetchRelatedProducts(
  product: Product,
  count: number
): Promise<Product[]> {
  const startedAt = Date.now();
  if (!product.lineId || !product.categoryId) {
    return [];
  }
  try {
    return await fetchRelatedProductsCached(
      product.lineId,
      product.categoryId,
      product.id,
      count
    );
  } finally {
    logTiming("fetchRelatedProducts", startedAt);
  }
}
