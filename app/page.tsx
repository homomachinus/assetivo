import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import HomeClient from "@/components/HomeClient";
import {
  fetchHomeCollectionProduct,
  fetchProductLines,
  fetchProducts
} from "@/lib/products.server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Assetivo — Digital Assets Store & Management",
  description:
    "Temukan dan kelola digital assets premium di Assetivo. Produk digital berkualitas tinggi tersedia untuk kebutuhan kreatif dan bisnis Anda.",
  alternates: {
    canonical: "https://assetivo.store",
  },
  openGraph: {
    title: "Assetivo — Digital Assets Store & Management",
    description:
      "Platform digital assets store dan management premium. Temukan produk digital berkualitas tinggi.",
    url: "https://assetivo.store",
    type: "website",
  },
};

export default async function HomePage() {
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
