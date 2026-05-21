import AppShell from "@/components/AppShell";
import CheckoutClient from "@/components/CheckoutClient";
import Topbar from "@/components/Topbar";

export default function DevelCheckoutPage() {
  return (
    <AppShell>
      <Topbar
        title="Checkout"
        subtitle="Secure payment"
      />

      <CheckoutClient />
    </AppShell>
  );
}
