"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CategoryRow from "@/components/CategoryRow";
import ProductCard from "@/components/ProductCard";
import Topbar from "@/components/Topbar";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";

type HomeClientProps = {
  products: Product[];
};

export default function HomeClient({ products }: HomeClientProps) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [products, normalizedQuery]);

  const heroProducts = products.slice(0, 2);
  const heroProduct = heroProducts[0];

  return (
    <>
      <Topbar
        title="Emon Ahmed"
        subtitle="Good morning"
        showSearch
        searchValue={query}
        searchPlaceholder="Search products or categories"
        onSearchChange={setQuery}
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

      {heroProduct ? (
        <section className="hero fade-up">
          <div className="hero-content">
            <span className="eyebrow">Special offer</span>
            <h1 className="hero-title">Shop the new collection</h1>
            <p className="hero-text">
              Discover elevated staples, warm textures, and curated essentials for
              the season.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={`/devel/product/${heroProduct.id}`}>
                Shop now
              </Link>
              <Link className="btn btn-outline" href="/devel/checkout">
                Fast checkout
              </Link>
            </div>
          </div>
          <div className="hero-figure">
            <div className="hero-preview">
              {heroProducts.map((product, index) => (
                <Image
                  key={product.id}
                  src={product.image}
                  alt={product.name}
                  width={260}
                  height={320}
                  priority={index === 0}
                  sizes="(max-width: 900px) 40vw, 220px"
                />
              ))}
            </div>
            <div className="hero-price">{formatPrice(heroProduct.price)}</div>
          </div>
        </section>
      ) : null}

      <section className="section fade-up">
        <div className="section-head">
          <h2 className="section-title">Categories</h2>
          <Link className="section-link" href="/devel/favourites">
            View favourites
          </Link>
        </div>
        <CategoryRow />
      </section>

      <section className="section fade-up" id="arrivals">
        <div className="section-head">
          <h2 className="section-title">New arrivals</h2>
          <Link className="section-link" href="/devel/cart">
            Go to cart
          </Link>
        </div>
        {filteredProducts.length ? (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>
              No results{trimmedQuery ? ` for "${trimmedQuery}"` : ""}
            </strong>
            <span>Try another keyword or browse categories.</span>
          </div>
        )}
      </section>
    </>
  );
}
