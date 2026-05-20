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

export default async function DevelProductDetailPage({
  params
}: {
  params: { id: string };
}) {
  const product = await fetchProductById(params.id);

  if (!product) {
    notFound();
  }

  const related = await fetchRelatedProducts(product, 4);

  return (
    <AppShell>
      <Topbar
        title="Product details"
        subtitle="Backed by our quality guarantee"
        actions={
          <div className="action-row">
            <Link href="/devel/cart" className="icon-btn" aria-label="Cart">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M3 4h2l2.5 12.5h10.5L20.5 8H6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1.5" fill="currentColor" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" />
              </svg>
            </Link>
            <Link href="/devel/account" className="avatar" aria-label="Account">
              EA
            </Link>
          </div>
        }
      />

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
          <Link className="section-link" href="/devel">
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
