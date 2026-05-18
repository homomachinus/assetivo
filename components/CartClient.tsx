"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products, type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { getCartTotals } from "@/lib/catalog";
import { readCartCookie, type CartItem } from "@/lib/cart-cookie";

type CartLine = {
  item: CartItem;
  product: Product;
  lineTotal: number;
};

function buildLines(items: CartItem[]): CartLine[] {
  return items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        return null;
      }

      const size = item.size ?? product.sizes[0] ?? "One size";
      const color = item.color ?? product.colors[0]?.name ?? "Default";

      return {
        item: { ...item, size, color },
        product,
        lineTotal: product.price * item.quantity
      };
    })
    .filter((line): line is CartLine => line !== null);
}

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCartCookie());
  }, []);

  const lines = useMemo(() => buildLines(items), [items]);
  const totals = useMemo(() => getCartTotals(lines), [lines]);

  return (
    <section className="section fade-up">
      <div className="section-head">
        <h2 className="section-title">Cart items</h2>
        <Link className="section-link" href="/">
          Continue shopping
        </Link>
      </div>

      {lines.length ? (
        <div className="cart-layout">
          <div>
            {lines.map((line) => (
              <div key={line.product.id} className="cart-item">
                <Image
                  src={line.product.image}
                  alt={line.product.name}
                  width={100}
                  height={120}
                  className="cart-thumb"
                />
                <div className="cart-meta">
                  <strong>{line.product.name}</strong>
                  <span>
                    Size: {line.item.size} - Color: {line.item.color}
                  </span>
                  <strong>{formatPrice(line.lineTotal)}</strong>
                </div>
                <div className="qty-chip">Qty {line.item.quantity}</div>
              </div>
            ))}
          </div>

          <aside className="summary-card">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>{formatPrice(totals.discount)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
            <Link className="btn btn-secondary" href="/checkout">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <strong>Your cart is empty</strong>
          <span>Add items from the product page to see them here.</span>
        </div>
      )}
    </section>
  );
}
