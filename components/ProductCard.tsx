"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-media">
        <Image
          src={product.image}
          alt={product.name}
          width={360}
          height={420}
          priority={priority}
          sizes="(max-width: 768px) 100vw, 280px"
          style={{ objectFit: "contain", height: "180px", width: "100%" }}
        />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-meta">
          {product.line} · {product.category} · {product.variantType} / {product.variantColor}
        </p>
        <div className="price-row">
          <span className="price-now">{formatPrice(product.price)}</span>
          <span className="price-was">{formatPrice(product.was)}</span>
        </div>
      </div>
    </Link>
  );
}