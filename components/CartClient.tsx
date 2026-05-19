"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { getCartTotals } from "@/lib/catalog";
import { readCartCookie, writeCartCookie, type CartItem } from "@/lib/cart-cookie";

type CartLine = {
  item: CartItem;
  product: Product;
  lineTotal: number;
};

function buildLines(items: CartItem[], catalog: Product[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = catalog.find((entry) => entry.id === item.productId);
    if (!product) continue;
    lines.push({
      item,
      product,
      lineTotal: product.price * item.quantity
    });
  }
  return lines;
}

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    setItems(readCartCookie());
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        const payload = await response.json();
        if (active && payload?.data) {
          setCatalog(payload.data as Product[]);
        }
      } catch {
        // Ignore fetch errors for now.
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const lines = useMemo(() => buildLines(items, catalog), [items, catalog]);
  const totals = useMemo(() => getCartTotals(lines), [lines]);
  const isLoading = items.length > 0 && catalog.length === 0;

  function removeItem(productId: string) {
    const updated = items.filter((i) => i.productId !== productId);
    setItems(updated);
    writeCartCookie(updated);
  }

  return (
    <section className="section fade-up">
      <div className="section-head">
        <h2 className="section-title">Cart items</h2>
        <Link className="section-link" href="/">
          Continue shopping
        </Link>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <strong>Loading cart...</strong>
          <span>Syncing items from the database.</span>
        </div>
      ) : lines.length ? (
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
                  <span className="cart-hierarchy">
                    {line.product.line} / {line.product.category} / {line.product.variantType}
                    {" "}· {line.product.variantColor}
                  </span>
                  <strong>{formatPrice(line.lineTotal)}</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <div className="qty-chip">Qty {line.item.quantity}</div>
                  <button
                    onClick={() => removeItem(line.product.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#d14f4f",
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    Remove
                  </button>
                </div>
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