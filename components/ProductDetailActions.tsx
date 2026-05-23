"use client";

import { useState, useEffect } from "react";
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
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleAdd = (nextPath?: string) => {
    if (product.isReady === false) return;
    addToCartCookie({
      productId: product.id,
      quantity: 1,
      variantType: product.variantType,
      variantColor: product.variantColor
    });

    if (nextPath) {
      router.push(nextPath);
    } else {
      setShowToast(true);
    }
  };

  const isNotReady = product.isReady === false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="action-row" style={isNotReady ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleAdd()}
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

      {/* Premium Toast Notification */}
      <div className={`toast-notification${showToast ? " show" : ""}`} role="alert" aria-live="assertive">
        <div className="toast-icon">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
        <div className="toast-content">
          <p className="toast-title">Added to Cart</p>
          <p className="toast-message">
            <strong>{product.name}</strong> has been successfully added to your cart.
          </p>
          <div className="toast-actions">
            <a href="/cart" className="toast-btn-link">View Cart</a>
            <span style={{ color: "var(--line)", fontSize: "10px" }}>•</span>
            <button 
              type="button" 
              onClick={() => setShowToast(false)} 
              className="toast-btn-link" 
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Continue shopping
            </button>
          </div>
        </div>
        <button 
          type="button" 
          onClick={() => setShowToast(false)} 
          className="toast-close" 
          aria-label="Close notification"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
        </button>
      </div>
    </div>
  );
}

