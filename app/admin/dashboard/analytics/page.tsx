"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = "G-QGJK0KQZXH";
const PROPERTY_ID = "G-QGJK0KQZXH";

type MetricCard = {
  label: string;
  icon: string;
  description: string;
  accent: string;
};

const METRIC_CARDS: MetricCard[] = [
  { label: "Active Users (Realtime)", icon: "person_play", description: "Users active in the last 30 minutes", accent: "#22c55e" },
  { label: "Sessions Today", icon: "analytics", description: "Total sessions since midnight", accent: "#3b82f6" },
  { label: "Page Views Today", icon: "visibility", description: "Total page views since midnight", accent: "#f59e0b" },
  { label: "Avg. Session Duration", icon: "timer", description: "Average time per session", accent: "#a855f7" },
];

// --- Mock Data ---
const trafficData = [
  { name: "Mon", pageViews: 4000, sessions: 2400 },
  { name: "Tue", pageViews: 3000, sessions: 1398 },
  { name: "Wed", pageViews: 2000, sessions: 9800 },
  { name: "Thu", pageViews: 2780, sessions: 3908 },
  { name: "Fri", pageViews: 1890, sessions: 4800 },
  { name: "Sat", pageViews: 2390, sessions: 3800 },
  { name: "Sun", pageViews: 3490, sessions: 4300 },
];

const sourceData = [
  { name: "Organic Search", value: 400 },
  { name: "Direct", value: 300 },
  { name: "Referral", value: 300 },
  { name: "Social", value: 200 },
];

const topPagesData = [
  { name: "/", views: 1200 },
  { name: "/explore", views: 900 },
  { name: "/checkout", views: 450 },
  { name: "/product/...", views: 300 },
  { name: "/cart", views: 200 },
];

// Ensure colors match the brand
const COLORS = ["#f5c518", "#d4a800", "#1a1a1a", "#6d6d6d"];

const QUICK_LINKS = [
  {
    label: "Realtime Overview",
    url: `https://analytics.google.com/analytics/web/#/p${PROPERTY_ID}/realtime/overview`,
    icon: "bolt",
    desc: "Live visitor activity",
  },
  {
    label: "Audience Overview",
    url: `https://analytics.google.com/analytics/web/#/p${PROPERTY_ID}/reports/reportinghub`,
    icon: "groups",
    desc: "Who visits your site",
  },
];

export default function AdminAnalyticsPage() {
  const [gaReady, setGaReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const checkRef = useRef(0);
  
  // To avoid hydration mismatch with charts
  const [isMounted, setIsMounted] = useState(false);

  // Poll until gtag is ready (loaded async by layout)
  useEffect(() => {
    setIsMounted(true);
    const check = () => {
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        setGaReady(true);
      } else if (checkRef.current < 20) {
        checkRef.current++;
        setTimeout(check, 300);
      }
    };
    check();
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(GA_MEASUREMENT_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isMounted) return null; // Avoid rendering charts server-side

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, fontFamily: "Montserrat, serif" }}>
            Analytics Dashboard
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Google Analytics 4 — Property ID:{" "}
            <code style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 13,
              fontFamily: "monospace",
              letterSpacing: 0.5,
            }}>
              {GA_MEASUREMENT_ID}
            </code>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* GA Ready badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 16px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            background: gaReady ? "color-mix(in srgb, #22c55e 12%, transparent)" : "color-mix(in srgb, #f59e0b 12%, transparent)",
            border: `1.5px solid ${gaReady ? "#22c55e" : "#f59e0b"}`,
            color: gaReady ? "#16a34a" : "#b45309",
          }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              {gaReady ? "check_circle" : "pending"}
            </span>
            {gaReady ? "GA Script Active" : "Loading..."}
          </div>

          {/* Copy ID */}
          <button
            onClick={handleCopyId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--surface)",
              border: "1.5px solid var(--line)",
              color: "var(--ink)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "Copied!" : "Copy Measurement ID"}
          </button>

          {/* Open GA */}
          <a
            href={`https://analytics.google.com/analytics/web/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--gold)",
              border: "1.5px solid var(--gold-dark)",
              color: "#111110",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
            Open Google Analytics
          </a>
        </div>
      </div>

      {/* Disclaimer Alert */}
      <div style={{
          padding: "12px 16px",
          background: "color-mix(in srgb, var(--gold) 15%, transparent)",
          borderLeft: "4px solid var(--gold-dark)",
          borderRadius: 8,
          fontSize: 14,
          color: "var(--ink)",
          display: "flex",
          gap: 12,
          alignItems: "flex-start"
      }}>
          <span className="material-symbols-outlined" style={{ color: "var(--gold-dark)" }}>info</span>
          <div>
              <strong>Note on Data Visualization:</strong> The charts below display realistic mock data to demonstrate the dashboard layout. Fetching live GA4 data directly into these charts requires configuring a Google Cloud Service Account and setting up a backend Data API integration.
          </div>
      </div>

      {/* Metric Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {METRIC_CARDS.map((card) => (
          <div
            key={card.label}
            className="admin-card"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `color-mix(in srgb, ${card.accent} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${card.accent} 30%, transparent)`,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: card.accent }}>
                  {card.icon}
                </span>
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 999,
                background: "var(--surface-muted)",
                color: "var(--muted)",
                border: "1px solid var(--line)",
              }}>
                GA4
              </span>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                {card.label}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                {card.description}
              </p>
            </div>
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: card.accent,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View in GA4
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </a>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        
        {/* Main Traffic Chart */}
        <div className="admin-card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Traffic Overview (Last 7 Days)</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Page views vs sessions trend (Mock Data)</p>
          </div>
          <div style={{ height: 350, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8 }}
                  itemStyle={{ fontSize: 14 }}
                />
                <Legend />
                <Line type="monotone" dataKey="pageViews" name="Page Views" stroke="var(--gold-dark)" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="sessions" name="Sessions" stroke="var(--ink)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
          
          {/* Traffic Sources */}
          <div className="admin-card">
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Traffic Sources</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Where your users come from (Mock Data)</p>
            </div>
            <div style={{ height: 280, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="var(--surface)"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Pages */}
          <div className="admin-card">
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Top Pages</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Most visited routes (Mock Data)</p>
            </div>
            <div style={{ height: 280, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPagesData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--muted)" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8 }}
                    cursor={{ fill: "color-mix(in srgb, var(--gold) 10%, transparent)" }}
                  />
                  <Bar dataKey="views" name="Page Views" fill="var(--gold)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Quick Links */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              padding: "18px 22px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--gold-dark)" }}>
                quick_reference
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Quick Links</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Jump to GA4 reports</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {QUICK_LINKS.map((link, i) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < QUICK_LINKS.length - 1 ? "1px solid var(--line)" : "none",
                    textDecoration: "none",
                    color: "var(--ink)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--gold-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--gold-dark)" }}>
                      {link.icon}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{link.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>{link.desc}</p>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--muted)", flexShrink: 0 }}>
                    open_in_new
                  </span>
                </a>
              ))}
            </div>
          </div>
          
          {/* Integration Info */}
          <div className="admin-card" style={{ background: "color-mix(in srgb, var(--gold) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--gold-dark)", flexShrink: 0, marginTop: 2 }}>
              integration_instructions
            </span>
            <div>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 15 }}>Integration Status</p>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                Google Analytics is integrated via <code style={{ fontFamily: "monospace", background: "var(--surface-muted)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>next/script</code> with{" "}
                <code style={{ fontFamily: "monospace", background: "var(--surface-muted)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>strategy=&quot;afterInteractive&quot;</code> in{" "}
                <code style={{ fontFamily: "monospace", background: "var(--surface-muted)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>app/layout.tsx</code>.
                All pageviews across every route are tracked automatically, including SPA client-side navigations.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Measurement ID", value: GA_MEASUREMENT_ID },
                  { label: "Strategy", value: "afterInteractive" },
                  { label: "Pageview Tracking", value: "Auto (SPA)" },
                  { label: "Script Load", value: "Non-blocking" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    <span style={{ color: "var(--muted)" }}>{item.label}:</span>
                    <span style={{ fontFamily: "monospace", color: "var(--ink)", fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
