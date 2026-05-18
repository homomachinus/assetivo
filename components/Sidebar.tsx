"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Home",
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    href: "/favourites",
    label: "Favourites",
    badge: "6",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.5s-7-4.4-9.2-8.5C1.3 9.2 2.6 6 5.7 5.2c2.1-.6 4.3.2 5.7 1.8 1.4-1.6 3.6-2.4 5.7-1.8 3.1.8 4.4 4 2.9 6.8C19 16.1 12 20.5 12 20.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    href: "/cart",
    label: "Cart",
    badge: "3",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 4h2l2.5 12.5h10.5L20.5 8H6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.5" fill="currentColor" />
        <circle cx="18" cy="20" r="1.5" fill="currentColor" />
      </svg>
    )
  },
  {
    href: "/account",
    label: "Account",
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="8"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 21a8 8 0 0 1 16 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <span>Assetivo</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${active ? " active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="deal-card">
          <p className="deal-label">Today deal</p>
          <p className="deal-value">30% off</p>
          <p className="deal-note">On new arrivals only</p>
        </div>
      </aside>

      <nav className="mobile-nav" aria-label="Primary">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-item${active ? " active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
