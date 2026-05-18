import Link from "next/link";
import AppShell from "@/components/AppShell";
import Topbar from "@/components/Topbar";
import { formatPrice } from "@/lib/format";
import { getCartLines, getCartTotals } from "@/lib/catalog";

export default function DevelCheckoutPage() {
  const lines = getCartLines();
  const totals = getCartTotals(lines);

  return (
    <AppShell>
      <Topbar
        title="Checkout"
        subtitle="Secure payment"
        actions={
          <div className="action-row">
            <Link href="/devel/cart" className="icon-btn" aria-label="Back to cart">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 19l-7-7 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        }
      />

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
            {lines.map((line) => (
              <div key={line.product.id} className="summary-row">
                <span>
                  {line.product.name} x{line.item.quantity}
                </span>
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
            <Link className="btn btn-primary" href="/devel/order-success">
              Place order
            </Link>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
