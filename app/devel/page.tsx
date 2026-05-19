import AppShell from "@/components/AppShell";
import HomeClient from "@/components/HomeClient";
import {
  fetchHomeCollectionProduct,
  fetchProductLines,
  fetchProducts
} from "@/lib/products.server";

export const dynamic = "force-dynamic";

export default async function DevelHomePage() {
  const [products, heroProduct, lineRows] = await Promise.all([
    fetchProducts(),
    fetchHomeCollectionProduct(),
    fetchProductLines()
  ]);

  const lineItems = lineRows.map((line) => ({
    id: line.id,
    label: line.name
  }));

  return (
    <AppShell>
      <HomeClient products={products} heroProduct={heroProduct} lineItems={lineItems} />
    </AppShell>
  );
}
