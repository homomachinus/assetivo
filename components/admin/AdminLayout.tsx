"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";
import "@/app/globals.css"; // Ensure globals are loaded

type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
};

const MENU_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "home" },
  { label: "Products", href: "/admin/dashboard/products", icon: "inventory_2" },
  { label: "Categories", href: "/admin/dashboard/categories", icon: "category" },
  { label: "Product Lines", href: "/admin/dashboard/lines", icon: "layers" },
  { label: "Variant Types", href: "/admin/dashboard/types", icon: "style" },
  { label: "Variant Colors", href: "/admin/dashboard/colors", icon: "palette" },
  { label: "Admin Users", href: "/admin/dashboard/users", icon: "group" },
  { label: "Orders", href: "/admin/dashboard/orders", icon: "shopping_cart" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/admin");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.data) {
          setAdmin(json.data);
        }
        setLoading(false);
      })
      .catch(() => {
        router.replace("/admin");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  };

  if (loading) {
    return (
      <div className="admin-login-page">
        <div className="admin-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="admin-dashboard-app">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="brand">
            <span>Assetivo</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="admin-nav-icon material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "0 16px" }}>
          <DarkModeToggle variant="sidebar" />
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {admin.full_name ? admin.full_name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-user-meta">
              <span className="admin-user-name">{admin.full_name || "Admin"}</span>
              <span className="admin-user-role">{admin.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn" title="Sign out">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <h2>{MENU_ITEMS.find((m) => pathname === m.href || (m.href !== "/admin/dashboard" && pathname.startsWith(m.href)))?.label || "Dashboard"}</h2>
          </div>
          <div className="admin-topbar-actions">
            <Link href="/admin/dashboard/settings" className="admin-icon-btn">
              <span className="material-symbols-outlined">settings</span>
            </Link>
          </div>
        </header>

        <div className="admin-content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
