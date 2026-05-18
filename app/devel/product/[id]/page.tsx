import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProductCard from "@/components/ProductCard";
import Topbar from "@/components/Topbar";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { getProductById, getRelatedProducts } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default function DevelProductDetailPage({
  params
}: {
  params: { id: string };
}) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product.category, product.id, 4);

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
            <div className="thumb-row">
              {product.colors.slice(0, 3).map((color) => (
                <Image
                  key={color.name}
                  src={product.image}
                  alt={`${product.name} in ${color.name}`}
                  width={220}
                  height={260}
                />
              ))}
            </div>
          </div>

          <div className="product-detail">
            <span className="pill">New arrival</span>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <div className="price-row">
              <span className="price-now">{formatPrice(product.price)}</span>
              <span className="price-was">{formatPrice(product.was)}</span>
            </div>

            <div>
              <p className="topbar-subtitle">Select size</p>
              <div className="option-list">
                {product.sizes.map((size, index) => (
                  <span
                    key={size}
                    className={`size-pill${index === 1 ? " active" : ""}`}
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="topbar-subtitle">Choose color</p>
              <div className="option-list">
                {product.colors.map((color) => (
                  <span
                    key={color.name}
                    className="swatch"
                    style={{ background: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="topbar-subtitle">Details</p>
              <ul className="detail-list">
                {product.details.map((detail) => (
                  <li key={detail}>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="action-row">
              <Link className="btn btn-secondary" href="/devel/cart">
                Add to cart
              </Link>
              <Link className="btn btn-primary" href="/devel/checkout">
                Buy now
              </Link>
            </div>
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
