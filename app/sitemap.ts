import { MetadataRoute } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";

const BASE_URL = "https://assetivo.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic product pages from Supabase
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabaseServer();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, updated_at")
      .order("created_at", { ascending: false });

    if (!error && products) {
      productPages = products.map((product) => ({
        url: `${BASE_URL}/product/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    console.error("sitemap: failed to fetch products");
  }

  return [...staticPages, ...productPages];
}
