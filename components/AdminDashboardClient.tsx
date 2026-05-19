"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
};

export default function AdminDashboardClient() {
  const router = useRouter();
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }

    setPwLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        setPwError(json.error || "Failed to change password");
      } else {
        setPwSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container fade-up">
          <div className="admin-spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="admin-login-page" style={{ alignItems: "flex-start", paddingTop: 60, paddingBottom: 60 }}>
      <div className="admin-login-container fade-up" style={{ maxWidth: 540 }}>
        <div className="admin-login-brand">
          <h1 className="admin-login-title">
            <span className="brand"><span>Assetivo</span></span>
          </h1>
          <p className="admin-login-subtitle">Admin Dashboard</p>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <h2>Welcome, {admin.full_name || admin.email}</h2>
            <p>You are signed in as <strong>{admin.role}</strong></p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="admin-dash-stat">
              <span className="admin-dash-stat-label">Email</span>
              <span className="admin-dash-stat-value">{admin.email}</span>
            </div>
            <div className="admin-dash-stat">
              <span className="admin-dash-stat-label">Role</span>
              <span className="admin-dash-stat-value" style={{ textTransform: "capitalize" }}>{admin.role}</span>
            </div>
            <div className="admin-dash-stat">
              <span className="admin-dash-stat-label">User ID</span>
              <span className="admin-dash-stat-value" style={{ fontSize: 11, fontFamily: "monospace" }}>{admin.id}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline admin-login-btn"
            onClick={handleLogout}
            style={{ marginTop: 8 }}
          >
            Sign out
          </button>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <h2>Change Password</h2>
            <p>Update your account password</p>
          </div>

          <form onSubmit={handleChangePassword} className="admin-login-form">
            {pwError && (
              <div className="admin-login-error fade-up">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="admin-login-error fade-up" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {pwSuccess}
              </div>
            )}

            <div className="field">
              <label htmlFor="current-pw">Current Password</label>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="current-pw"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="new-pw">New Password</label>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="new-pw"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirm-pw">Confirm New Password</label>
              <div className="admin-input-wrap">
                <svg className="admin-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="confirm-pw"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary admin-login-btn"
              disabled={pwLoading}
            >
              {pwLoading ? (
                <>
                  <span className="admin-spinner" />
                  Updating...
                </>
              ) : (
                "Update Password"
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
