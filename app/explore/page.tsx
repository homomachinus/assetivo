import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ExploreClient from "@/components/ExploreClient";
import { fetchProducts } from "@/lib/products.server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore Products — Jelajahi Semua Produk",
  description:
    "Jelajahi seluruh koleksi digital assets di Assetivo. Filter berdasarkan product line, kategori, dan warna untuk menemukan produk yang Anda cari.",
  alternates: {
    canonical: "https://assetivo.store/explore",
  },
  openGraph: {
    title: "Explore Products — Assetivo Digital Assets",
    description:
      "Jelajahi koleksi lengkap digital assets. Filter berdasarkan product line, kategori, dan warna.",
    url: "https://assetivo.store/explore",
    type: "website",
  },
};

export default async function ExplorePage() {
  const products = await fetchProducts();

  return (
    <AppShell>
      <ExploreClient products={products} />
    </AppShell>
  );
}
