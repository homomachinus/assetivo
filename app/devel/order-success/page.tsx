import Link from "next/link";
import AppShell from "@/components/AppShell";
import Topbar from "@/components/Topbar";

export default function DevelOrderSuccessPage() {
  return (
    <AppShell>
      <Topbar title="Order confirmed" subtitle="Thank you for your purchase" />
      <section className="section fade-up">
        <div className="success-card">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>Payment received</h2>
          <p>Your order ASV-312 has been confirmed and is being prepared.</p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href="/devel">
              Continue shopping
            </Link>
            <Link className="btn btn-outline" href="/devel/account">
              View order
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
