import AppShell from "@/components/AppShell";
import CartClient from "@/components/CartClient";
import Topbar from "@/components/Topbar";

export default function CartPage() {
  return (
    <AppShell>
      <Topbar
        title=""
      />

      <CartClient />
    </AppShell>
  );
}
