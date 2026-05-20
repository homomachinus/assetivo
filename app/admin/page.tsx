import type { Metadata } from "next";
import AdminLoginClient from "@/components/AdminLoginClient";

export const metadata: Metadata = {
  title: "Admin Login — Assetivo",
  description: "Sign in to the Assetivo admin panel.",
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
