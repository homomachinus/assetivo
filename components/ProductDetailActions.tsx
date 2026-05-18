"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { addToCartCookie } from "@/lib/cart-cookie";

type ProductDetailActionsProps = {
  product: Product;
};

export default function ProductDetailActions({
  product
}: ProductDetailActionsProps) {
  const router = useRouter();

  const handleAdd = (nextPath: string) => {
    const size = product.sizes[0] ?? "One size";
    const color = product.colors[0]?.name ?? "Default";

    addToCartCookie({
      productId: product.id,
      quantity: 1,
      size,
      color
    });

    router.push(nextPath);
  };

  return (
    <div className="action-row">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => handleAdd("/cart")}
      >
        Add to cart
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => handleAdd("/checkout")}
      >
        Buy now
      </button>
    </div>
  );
}
