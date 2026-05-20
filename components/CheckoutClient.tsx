"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { getCartTotals } from "@/lib/catalog";
import { readCartCookie, type CartItem } from "@/lib/cart-cookie";

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

export default function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map(item => ({ productId: item.productId, quantity: item.quantity }))
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Checkout failed");
      }

      if (json.data && json.data.redirect_url) {
        // Redirect to payment page (Midtrans Snap or Paymenku pay_url)
        window.location.href = json.data.redirect_url;
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

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

  return (
    <section className="section fade-up">
      <form className="checkout-layout" onSubmit={handleCheckout}>
        <div className="form-stack">
          <div className="stepper">
            <div className="step active">
              <span className="dot" />
              Customer Info
            </div>
            <div className="step active">
              <span className="dot" />
              Payment
            </div>
            <div className="step">
              <span className="dot" />
              Review
            </div>
          </div>

          <div className="form-card">
            <h3>Customer details</h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" value={form.name} onChange={handleInputChange} required placeholder="Emon Ahmed" />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={form.phone} onChange={handleInputChange} required placeholder="+62 812 3456 7890" />
              </div>
            </div>
          </div>

            <div style={{ padding: "16px", background: "var(--surface-muted)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--muted)" }}>
              Pembayaran diproses secara aman via payment gateway aktif. Anda akan diarahkan ke halaman pembayaran setelah klik tombol di bawah.
            </div>
        </div>

        <aside className="summary-card">
          <h3>Order summary</h3>
          {isLoading ? (
            <div className="empty-state">
              <strong>Loading cart...</strong>
              <span>Syncing items from the database.</span>
            </div>
          ) : lines.length ? (
            <>
              {lines.map((line) => (
                <div key={line.product.id} className="summary-row">
                  <div className="summary-item">
                    <span className="summary-name">
                      {line.product.name} x{line.item.quantity}
                    </span>
                    <span className="summary-meta">
                      {line.product.line} / {line.product.category} / {line.product.variantType}
                      {" "}· {line.product.variantColor}
                    </span>
                  </div>
                  <span>{formatPrice(line.lineTotal)}</span>
                </div>
              ))}
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Place order"}
              </button>
              {errorMsg && <p style={{ color: "var(--error-text)", fontSize: 13, marginTop: 8 }}>{errorMsg}</p>}
            </>
          ) : (
            <div className="empty-state">
              <strong>Your cart is empty</strong>
              <span>Add items before checkout.</span>
            </div>
          )}
        </aside>
      </form>
    </section>
  );
}
