"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard (or home for now)
      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Decorative elements */}
      <div className="admin-login-decor">
        <div className="admin-login-circle admin-login-circle--1" />
        <div className="admin-login-circle admin-login-circle--2" />
        <div className="admin-login-circle admin-login-circle--3" />
      </div>

      <div className="admin-login-container fade-up">
        {/* Brand */}
        <div className="admin-login-brand">

          <h1 className="admin-login-title">
            <span className="brand"><span>Assetivo</span></span>
          </h1>
          <p className="admin-login-subtitle">Admin Panel</p>
        </div>

        {/* Login card */}
        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-login-error fade-up">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="admin-email">Email address</label>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <polyline points="22,7 12,13 2,7" />
                </svg>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@assetivo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary admin-login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-spinner" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="admin-login-footer">
          © {new Date().getFullYear()} Assetivo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
