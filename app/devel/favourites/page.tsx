import AppShell from "@/components/AppShell";
import FavouritesClient from "@/components/FavouritesClient";
import { products } from "@/data/products";

export default function DevelFavouritesPage() {
  return (
    <AppShell>
      <FavouritesClient products={products} />
    </AppShell>
  );
}
