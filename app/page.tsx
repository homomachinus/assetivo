import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import HomeClient from "@/components/HomeClient";
import {
  fetchHomeCollectionProduct,
  fetchProductLines,
  fetchProducts
} from "@/lib/products.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Assetivo — Digital Assets Store",
  description:
    "Temukan koleksi digital assets premium di Assetivo. Produk digital berkualitas tinggi tersedia dengan harga terjangkau untuk kebutuhan kreatif Anda.",
  alternates: {
    canonical: "https://assetivo.store",
  },
  openGraph: {
    title: "Assetivo — Digital Assets Store",
    description:
      "Temukan koleksi digital assets premium. Produk digital berkualitas tinggi dengan harga terjangkau.",
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
