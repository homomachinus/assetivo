import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductCard from "@/components/ProductCard";
import Topbar from "@/components/Topbar";
import { formatPrice } from "@/lib/format";
import { fetchProductById, fetchRelatedProducts } from "@/lib/products.server";

export const dynamic = "force-dynamic";

const BASE_URL = "https://assetivo.store";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await fetchProductById(params.id);
  if (!product) {
    return { title: "Produk tidak ditemukan" };
  }

  const title = `${product.name} | Assetivo`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Beli ${product.name} — ${product.line} › ${product.category} di Assetivo Digital Assets Store & Management.`;
  const productUrl = `${BASE_URL}/product/${product.id}`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${BASE_URL}${product.image}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.line,
      product.category,
      product.variantType,
      product.variantColor,
      "digital assets",
      "assetivo",
    ].filter(Boolean),
    alternates: { canonical: productUrl },
    openGraph: {
      title,
      description,
      url: productUrl,
      type: "website",
      images: [{ url: imageUrl, width: 640, height: 720, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await fetchProductById(params.id);

  if (!product) {
    notFound();
  }

  const related = await fetchRelatedProducts(product, 4);

  const productUrl = `${BASE_URL}/product/${product.id}`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${BASE_URL}${product.image}`;

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — ${product.line} › ${product.category}`,
    image: imageUrl,
    url: productUrl,
    sku: product.id,
    category: `${product.line} > ${product.category}`,
    brand: {
      "@type": "Brand",
      name: "Assetivo",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.currency || "IDR",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      availability: product.isReady
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: "Assetivo",
        url: BASE_URL,
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Product Line",
        value: product.line,
      },
      {
        "@type": "PropertyValue",
        name: "Category",
        value: product.category,
      },
      {
        "@type": "PropertyValue",
        name: "Variant Type",
        value: product.variantType,
      },
      {
        "@type": "PropertyValue",
        name: "Color",
        value: product.variantColor,
      },
    ].filter((p) => p.value && p.value !== "-"),
  };

  return (
    <AppShell>
      {/* JSON-LD Structured Data — makes product name, price & availability appear in Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Topbar title="" />

      <section className="section fade-up">
        <div className="product-layout">
          <div className="product-gallery">
            <Image
              src={product.image}
              alt={product.name}
              width={640}
              height={720}
              priority
              sizes="(max-width: 1100px) 100vw, 640px"
            />
          </div>

          <div className="product-detail">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-hierarchy">
              {product.line} <span>›</span> {product.category} <span>›</span>{" "}
              {product.variantType} / {product.variantColor}
            </p>
            <p className="product-description">{product.description}</p>
            <div className="price-row">
              <span className="price-now">{formatPrice(product.price)}</span>
              {product.was ? (
                <span className="price-was">{formatPrice(product.was)}</span>
              ) : null}
            </div>
            <ProductDetailActions product={product} />
          </div>
        </div>
      </section>

      <section className="section fade-up">
        <div className="section-head">
          <h2 className="section-title">You may also like</h2>
          <Link className="section-link" href="/">
            Back to shop
          </Link>
        </div>
        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}