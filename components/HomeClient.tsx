"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CategoryRow, { type CategoryRowItem } from "@/components/CategoryRow";
import ProductCard from "@/components/ProductCard";
import Topbar from "@/components/Topbar";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

type HomeClientProps = {
  products: Product[];
  heroProduct?: Product | null;
  lineItems?: CategoryRowItem[];
};

export default function HomeClient({ products, heroProduct, lineItems }: HomeClientProps) {
  const [query, setQuery] = useState("");
  const [activeLineId, setActiveLineId] = useState("all");
  const [visibleCount, setVisibleCount] = useState(20);
  const PAGE_SIZE = 20;
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeLineId !== "all" && product.lineId !== activeLineId) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${product.line} ${product.category} ${product.variantType} ${product.variantColor} ${product.name} ${product.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [products, normalizedQuery, activeLineId]);

  // Reset visible count whenever filters or search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeLineId, normalizedQuery]);

  const lines = useMemo(() => {
    if (lineItems && lineItems.length) {
      return lineItems;
    }
    const unique = new Map<string, CategoryRowItem>();
    products.forEach((product) => {
      if (!product.lineId) return;
      if (!unique.has(product.lineId)) {
        unique.set(product.lineId, { id: product.lineId, label: product.line });
      }
    });
    return Array.from(unique.values());
  }, [lineItems, products]);

  const linesWithAll = useMemo(() => {
    return [{ id: "all", label: "All" }, ...lines];
  }, [lines]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, Product[]>>();
    visibleProducts.forEach((product) => {
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
  }, [visibleProducts]);

  const spotlightProduct = heroProduct ?? products[0] ?? null;
  const heroProducts = spotlightProduct ? [spotlightProduct] : [];

  return (
    <>
      <Topbar
        title=""
        showSearch
        searchValue={query}
        searchPlaceholder="Search products or categories"
        onSearchChange={setQuery}
      />

      {spotlightProduct ? (
        <section className="hero fade-up">
          <div className="hero-content">
            <span className="eyebrow">Special offer</span>
            <h1 className="hero-title">Shop the new collection</h1>
            <p className="hero-text">
              Discover elevated staples, warm textures, and curated essentials for
              the season.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/explore">
                Browse All Templates
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
            <div className="hero-price">{formatPrice(spotlightProduct.price)}</div>
          </div>
        </section>
      ) : null}

      <section className="section fade-up">

        <CategoryRow
          items={linesWithAll}
          activeId={activeLineId}
          onSelect={setActiveLineId}
        />
      </section>

      <section className="section fade-up" id="arrivals">

        {grouped.length ? (
          <div className="line-stack">
            {grouped.map((group) => (
              <div key={group.line} className="line-block">
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

        {filteredProducts.length > visibleCount && (
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button
              className="btn btn-outline"
              style={{ minWidth: 180, gap: 8 }}
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              type="button"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Show more
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>
                ({filteredProducts.length - visibleCount} remaining)
              </span>
            </button>
          </div>
        )}
      </section>
    </>
  );
}
