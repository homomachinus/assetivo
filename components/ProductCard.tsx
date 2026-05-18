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
    <Link href={`/devel/product/${product.id}`} className="product-card">
      <div className="product-media">
        <Image
          src={product.image}
          alt={product.name}
          width={360}
          height={420}
          priority={priority}
          sizes="(max-width: 768px) 100vw, 280px"
        />
        <span
          className={`like-btn${product.favourite ? " active" : ""}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 20.5s-7-4.4-9.2-8.5C1.3 9.2 2.6 6 5.7 5.2c2.1-.6 4.3.2 5.7 1.8 1.4-1.6 3.6-2.4 5.7-1.8 3.1.8 4.4 4 2.9 6.8C19 16.1 12 20.5 12 20.5z"
              fill={product.favourite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        </span>
        <span className="card-tag">New</span>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="price-row">
          <span className="price-now">{formatPrice(product.price)}</span>
          <span className="price-was">{formatPrice(product.was)}</span>
        </div>
      </div>
    </Link>
  );
}
