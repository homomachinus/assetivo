import AppShell from "@/components/AppShell";
import CartClient from "@/components/CartClient";
import Topbar from "@/components/Topbar";

export default function DevelCartPage() {
  return (
    <AppShell>
      <Topbar
        title="Your cart"
        subtitle="Almost there"
      />

      <CartClient />
    </AppShell>
  );
}
