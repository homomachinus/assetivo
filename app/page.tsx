import AppShell from "@/components/AppShell";
import HomeClient from "@/components/HomeClient";
import { products } from "@/data/products";

export default function HomePage() {
  return (
    <AppShell>
      <HomeClient products={products} />
    </AppShell>
  );
}
