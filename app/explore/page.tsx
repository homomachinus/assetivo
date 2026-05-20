import AppShell from "@/components/AppShell";
import ExploreClient from "@/components/ExploreClient";
import { fetchProducts } from "@/lib/products.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore – Assetivo",
  description: "Browse and filter all products by product line, category, and color.",
};

export default async function ExplorePage() {
  const products = await fetchProducts();

  return (
    <AppShell>
      <ExploreClient products={products} />
    </AppShell>
  );
}
