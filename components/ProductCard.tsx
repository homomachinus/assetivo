"use client";

import Image from "next/image";
import Link from "next/link";
import LoadingImage from "./LoadingImage";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  // Clean up variant meta text to avoid empty or "-" values
  const metaParts = [];
  if (product.line) metaParts.push(product.line);
  if (product.category) metaParts.push(product.category);
  
  const variantParts = [];
  if (product.variantType && product.variantType !== "-" && product.variantType.trim() !== "") {
    variantParts.push(product.variantType);
  }
  if (product.variantColor && product.variantColor !== "-" && product.variantColor.trim() !== "") {
    variantParts.push(product.variantColor);
  }
  
  if (variantParts.length > 0) {
    metaParts.push(variantParts.join(" / "));
  }
  
  const metaText = metaParts.join(" · ");

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-media">
        <LoadingImage src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-meta">
          {metaText}
        </p>
        <div className="price-row">
          <span className="price-now">{formatPrice(product.price)}</span>
          {product.was ? (
            <span className="price-was">{formatPrice(product.was)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}