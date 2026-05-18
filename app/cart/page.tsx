import AppShell from "@/components/AppShell";
import CartClient from "@/components/CartClient";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export default function CartPage() {
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

      <CartClient />
    </AppShell>
  );
}
