"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Topbar from "@/components/Topbar";
import type { Product } from "@/lib/products";

type FilterOption = { id: string; label: string };

type ExploreClientProps = {
  products: Product[];
};

export default function ExploreClient({ products }: ExploreClientProps) {
  const [query, setQuery] = useState("");
  const [activeLineId, setActiveLineId] = useState("all");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [activeColorId, setActiveColorId] = useState("all");

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  // Build unique filter options from product data
  const lines = useMemo<FilterOption[]>(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => {
      if (p.lineId && p.line && !seen.has(p.lineId)) seen.set(p.lineId, p.line);
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [products]);

  const categories = useMemo<FilterOption[]>(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => {
      if (p.categoryId && p.category && !seen.has(p.categoryId)) {
        // Only include categories that belong to the active line filter
        if (activeLineId === "all" || p.lineId === activeLineId) {
          seen.set(p.categoryId, p.category);
        }
      }
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [products, activeLineId]);

  const colors = useMemo<FilterOption[]>(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => {
      if (
        p.variantColorId &&
        p.variantColor &&
        p.variantColor !== "-" &&
        p.variantColor.trim() !== "" &&
        !seen.has(p.variantColorId)
      ) {
        seen.set(p.variantColorId, p.variantColor);
      }
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [products]);

  // Reset dependent filters when parent changes
  const handleLineChange = (id: string) => {
    setActiveLineId(id);
    setActiveCategoryId("all");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeLineId !== "all" && p.lineId !== activeLineId) return false;
      if (activeCategoryId !== "all" && p.categoryId !== activeCategoryId) return false;
      if (activeColorId !== "all" && p.variantColorId !== activeColorId) return false;
      if (!normalizedQuery) return true;
      const haystack = `${p.line} ${p.category} ${p.variantType} ${p.variantColor} ${p.name} ${p.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [products, activeLineId, activeCategoryId, activeColorId, normalizedQuery]);

  const activeFiltersCount = [
    activeLineId !== "all",
    activeCategoryId !== "all",
    activeColorId !== "all",
  ].filter(Boolean).length;

  const clearAll = () => {
    setActiveLineId("all");
    setActiveCategoryId("all");
    setActiveColorId("all");
    setQuery("");
  };

  return (
    <>
      <Topbar
        title=""
        showSearch
        searchValue={query}
        searchPlaceholder="Search products, categories…"
        onSearchChange={setQuery}
      />

      <div className="explore-layout">
        {/* ── Filter Panel ── */}
        <aside className="explore-filters">
          <div className="explore-filters-header">
            <span className="explore-filters-title">Filters</span>
            {activeFiltersCount > 0 && (
              <button className="explore-clear-btn" onClick={clearAll} type="button">
                Clear all
                <span className="explore-filter-badge">{activeFiltersCount}</span>
              </button>
            )}
          </div>

          {/* Product Line */}
          <div className="explore-filter-group">
            <p className="explore-filter-label">Product Line</p>
            <div className="explore-filter-list">
              <button
                className={`explore-filter-chip${activeLineId === "all" ? " active" : ""}`}
                onClick={() => handleLineChange("all")}
                type="button"
              >
                All
              </button>
              {lines.map((line) => (
                <button
                  key={line.id}
                  className={`explore-filter-chip${activeLineId === line.id ? " active" : ""}`}
                  onClick={() => handleLineChange(line.id)}
                  type="button"
                >
                  {line.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="explore-filter-group">
              <p className="explore-filter-label">Category</p>
              <div className="explore-filter-list">
                <button
                  className={`explore-filter-chip${activeCategoryId === "all" ? " active" : ""}`}
                  onClick={() => setActiveCategoryId("all")}
                  type="button"
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`explore-filter-chip${activeCategoryId === cat.id ? " active" : ""}`}
                    onClick={() => setActiveCategoryId(cat.id)}
                    type="button"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {colors.length > 0 && (
            <div className="explore-filter-group">
              <p className="explore-filter-label">Color</p>
              <div className="explore-filter-list">
                <button
                  className={`explore-filter-chip${activeColorId === "all" ? " active" : ""}`}
                  onClick={() => setActiveColorId("all")}
                  type="button"
                >
                  All
                </button>
                {colors.map((color) => (
                  <button
                    key={color.id}
                    className={`explore-filter-chip${activeColorId === color.id ? " active" : ""}`}
                    onClick={() => setActiveColorId(color.id)}
                    type="button"
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Results ── */}
        <section className="explore-results">
          <div className="explore-results-meta">
            <span className="explore-count">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </span>
            {(trimmedQuery || activeFiltersCount > 0) && (
              <button className="explore-clear-btn" onClick={clearAll} type="button">
                Reset
              </button>
            )}
          </div>

          {filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No products found{trimmedQuery ? ` for "${trimmedQuery}"` : ""}</strong>
              <span>Try adjusting your filters or search term.</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
