import type { Metadata } from "next";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Assetivo Admin",
  description: "Assetivo admin dashboard.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
