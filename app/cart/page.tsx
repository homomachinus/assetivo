import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Topbar from "@/components/Topbar";
import { formatPrice } from "@/lib/format";
import { getCartLines, getCartTotals } from "@/lib/catalog";

export default function CartPage() {
  const lines = getCartLines();
  const totals = getCartTotals(lines);

  return (
    <AppShell>
      <Topbar
        title="Your cart"
        subtitle="Almost there"
        actions={
          <div className="action-row">
            <Link href="/account" className="avatar" aria-label="Account">
              EA
            </Link>
          </div>
        }
      />

      <section className="section fade-up">
        <div className="section-head">
          <h2 className="section-title">Cart items</h2>
          <Link className="section-link" href="/">
            Continue shopping
          </Link>
        </div>
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
      </section>
    </AppShell>
  );
}
