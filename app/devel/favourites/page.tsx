import AppShell from "@/components/AppShell";
import FavouritesClient from "@/components/FavouritesClient";
import { fetchProducts } from "@/lib/products.server";

export const dynamic = "force-dynamic";

export default async function DevelFavouritesPage() {
  const products = await fetchProducts();

  return (
    <AppShell>
      <FavouritesClient products={products} />
    </AppShell>
  );
}
