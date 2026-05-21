"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { addToCartCookie } from "@/lib/cart-cookie";

type ProductDetailActionsProps = {
  product: Product;
};

export default function ProductDetailActions({
  product
}: ProductDetailActionsProps) {
  const router = useRouter();

  const handleAdd = (nextPath: string) => {
    if (product.isReady === false) return;
    addToCartCookie({
      productId: product.id,
      quantity: 1,
      variantType: product.variantType,
      variantColor: product.variantColor
    });

    router.push(nextPath);
  };

  const isNotReady = product.isReady === false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="action-row" style={isNotReady ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleAdd("/cart")}
          disabled={isNotReady}
        >
          Add to cart
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleAdd("/cart")}
          disabled={isNotReady}
        >
          Buy now
        </button>
      </div>

      {isNotReady && (
        <div style={{
          padding: "14px 18px",
          backgroundColor: "var(--warning-bg)",
          color: "var(--warning-text)",
          borderRadius: "var(--radius-sm)",
          fontSize: "14px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: "1px solid color-mix(in srgb, var(--warning-text) 30%, transparent)",
          lineHeight: "1.4"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>warning</span>
          <span>Produk belum ready. Belum bisa ditambahkan ke keranjang atau checkout.</span>
        </div>
      )}
    </div>
  );
}
