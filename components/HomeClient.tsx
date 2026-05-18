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
      const haystack = `${product.line} ${product.category} ${product.variantType} ${product.variantColor} ${product.name} ${product.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [products, normalizedQuery]);

  const lines = useMemo(() => {
    const unique = new Set(products.map((product) => product.line));
    return Array.from(unique);
  }, [products]);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, Product[]>>();
    filteredProducts.forEach((product) => {
      if (!map.has(product.line)) {
        map.set(product.line, new Map());
      }
      const categoryMap = map.get(product.line);
      if (!categoryMap) {
        return;
      }
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, []);
      }
      categoryMap.get(product.category)?.push(product);
    });

    return Array.from(map.entries()).map(([line, categories]) => ({
      line,
      categories: Array.from(categories.entries()).map(([category, items]) => ({
        category,
        items
      }))
    }));
  }, [filteredProducts]);

  const heroProducts = products.slice(0, 2);
  const heroProduct = heroProducts[0];

  return (
    <>
<Topbar

  title=""
  showSearch
  searchValue={query}
  searchPlaceholder="Search products or categories"
  onSearchChange={setQuery}
  actions={
    <div className="action-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
      <Link href="/cart" className="icon-btn homebtn-card" aria-label="Cart">
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
              <Link className="btn btn-primary" href={`/product/${heroProduct.id}`}>
                Shop now
              </Link>
              <Link className="btn" href="/checkout">
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
          <h2 className="section-title">Product lines</h2>
          <Link className="section-link" href="/favourites">
            View favourites
          </Link>
        </div>
        <CategoryRow items={lines} />
      </section>

      <section className="section fade-up" id="arrivals">
        <div className="section-head">
          <h2 className="section-title">Product hierarchy</h2>
          <Link className="section-link" href="/cart">
            Go to cart
          </Link>
        </div>
        {grouped.length ? (
          <div className="line-stack">
            {grouped.map((group) => (
              <div key={group.line} className="line-block">
                <div className="line-head">
                  <h3 className="line-title">{group.line}</h3>
                  <span className="line-meta">Product line</span>
                </div>
                {group.categories.map((categoryGroup) => (
                  <div key={categoryGroup.category} className="category-block">
                    <div className="category-head">
                      <h4 className="category-title">{categoryGroup.category}</h4>
                      <span className="category-meta">
                        {categoryGroup.items.length} type
                      </span>
                    </div>
                    <div className="product-grid">
                      {categoryGroup.items.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          priority={index < 2}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
