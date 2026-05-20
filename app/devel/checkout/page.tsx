import AppShell from "@/components/AppShell";
import CheckoutClient from "@/components/CheckoutClient";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export default function DevelCheckoutPage() {
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

      <CheckoutClient />
    </AppShell>
  );
}
