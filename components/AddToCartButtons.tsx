"use client";

import { useState } from "react";

function getCookieCart(): Record<string, number> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(/(?:^|; )cart=([^;]*)/);
  if (!match) return {};
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return {};
  }
}

function setCookieCart(cart: Record<string, number>) {
  const value = encodeURIComponent(JSON.stringify(cart));
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `cart=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function AddToCartButtons({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    const cart = getCookieCart();
    cart[productId] = (cart[productId] ?? 0) + 1;
    setCookieCart(cart);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="detail-actions">
      <button className="btn-cart" onClick={handleAddToCart} disabled={added}>
        {added ? "Added to cart ✓" : "Add to cart"}
      </button>
      <button className="btn-buy">Buy now</button>
    </div>
  );
}