import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import Topbar from "@/components/Topbar";
import OrderSuccessClient from "@/components/OrderSuccessClient";

export default function OrderSuccessPage() {
  return (
    <AppShell>
      <Topbar title="Order Berhasil" subtitle="Detail pesanan Anda" />
      <Suspense fallback={
        <section className="section fade-up">
          <div className="os-card">
            <div className="admin-spinner" style={{ width: 32, height: 32, margin: "0 auto" }} />
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Memuat...</p>
          </div>
        </section>
      }>
        <OrderSuccessClient />
      </Suspense>
    </AppShell>
  );
}
