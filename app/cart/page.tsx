import AppShell from "@/components/AppShell";
import CartClient from "@/components/CartClient";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export default function CartPage() {
  return (
    <AppShell>
      <Topbar
        title=""
        actions={
          <div className="action-row">

          </div>
        }
      />

      <CartClient />
    </AppShell>
  );
}
