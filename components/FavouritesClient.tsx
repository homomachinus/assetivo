"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Topbar from "@/components/Topbar";
import type { Product } from "@/lib/products";

type FavouritesClientProps = {
  products: Product[];
};

export default function FavouritesClient({ products }: FavouritesClientProps) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  const favourites = useMemo(
    () => products.filter((product) => product.favourite),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) {
      return favourites;
    }

    return favourites.filter((product) => {
      const haystack = `${product.line} ${product.category} ${product.variantType} ${product.variantColor} ${product.name} ${product.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [favourites, normalizedQuery]);

  return (
    <>
      <Topbar
        title=""
        showSearch
        searchValue={query}
        searchPlaceholder="Search favourites"
        onSearchChange={setQuery}
      />

      <section className="section fade-up">
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
              No favourites{trimmedQuery ? ` for "${trimmedQuery}"` : ""}
            </strong>
            <span>Try a different keyword or save more items.</span>
          </div>
        )}
      </section>
    </>
  );
}
