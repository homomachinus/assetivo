"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { products, type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { getCartTotals } from "@/lib/catalog";
import { readCartCookie, type CartItem } from "@/lib/cart-cookie";

type CartLine = {
  item: CartItem & { size: string; color: string };
  product: Product;
  lineTotal: number;
};
function buildLines(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) continue;
    const size = item.size ?? product.sizes[0] ?? "One size";
    const color = item.color ?? product.colors[0]?.name ?? "Default";
    lines.push({
      item: { ...item, size, color },
      product,
      lineTotal: product.price * item.quantity,
    });
  }
  return lines;
}

export default function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCartCookie());
  }, []);

  const lines = useMemo(() => buildLines(items), [items]);
  const totals = useMemo(() => getCartTotals(lines), [lines]);

  return (
    <section className="section fade-up">
      <div className="checkout-layout">
        <div className="form-stack">
          <div className="stepper">
            <div className="step active">
              <span className="dot" />
              Shipping
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
            <h3>Shipping address</h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input id="firstName" placeholder="Emon" />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" placeholder="Ahmed" />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="you@email.com" />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" placeholder="+62 812 3456 7890" />
              </div>
              <div className="field">
                <label htmlFor="address">Street address</label>
                <input id="address" placeholder="Jl. Sudirman No. 8" />
              </div>
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" placeholder="Jakarta" />
              </div>
              <div className="field">
                <label htmlFor="country">Country</label>
                <select id="country">
                  <option>Indonesia</option>
                  <option>Singapore</option>
                  <option>Malaysia</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="postal">Postal code</label>
                <input id="postal" placeholder="12190" />
              </div>
            </div>
          </div>

          <div className="form-card">
            <h3>Payment method</h3>
            <div className="radio-group">
              <label className="radio-card">
                <input type="radio" name="payment" defaultChecked />
                Credit card
              </label>
              <label className="radio-card">
                <input type="radio" name="payment" />
                Bank transfer
              </label>
              <label className="radio-card">
                <input type="radio" name="payment" />
                E-wallet
              </label>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="cardNumber">Card number</label>
                <input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="field">
                <label htmlFor="cardName">Name on card</label>
                <input id="cardName" placeholder="Emon Ahmed" />
              </div>
              <div className="field">
                <label htmlFor="exp">Expiry</label>
                <input id="exp" placeholder="06/28" />
              </div>
              <div className="field">
                <label htmlFor="cvc">CVC</label>
                <input id="cvc" placeholder="123" />
              </div>
            </div>
          </div>
        </div>

        <aside className="summary-card">
          <h3>Order summary</h3>
          {lines.length ? (
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
              <div className="summary-row">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
              <Link className="btn btn-primary" href="/order-success">
                Place order
              </Link>
            </>
          ) : (
            <div className="empty-state">
              <strong>Your cart is empty</strong>
              <span>Add items before checkout.</span>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
