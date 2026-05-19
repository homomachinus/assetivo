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
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
        <div className="admin-spinner" style={{ width: 32, height: 32, borderTopColor: "var(--gold-dark)" }} />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24, maxWidth: 900 }}>
      {/* Profile Card */}
      <div className="admin-card fade-up">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, margin: "0 0 4px" }}>Welcome, {admin.full_name || admin.email}</h2>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 13 }}>
            You are signed in as <strong style={{ textTransform: "capitalize", color: "var(--ink)" }}>{admin.role}</strong>
          </p>
        </div>

        <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
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
      </div>

      {/* Change Password Card */}
      <div className="admin-card fade-up" style={{ animationDelay: "0.1s" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, margin: "0 0 4px" }}>Change Password</h2>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 13 }}>Update your account password</p>
        </div>

        <form onSubmit={handleChangePassword} className="admin-login-form">
          {pwError && (
            <div className="admin-login-error fade-up">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {pwError}
            </div>
          )}

          {pwSuccess && (
            <div className="admin-login-error fade-up" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              {pwSuccess}
            </div>
          )}

          <div className="field">
            <label htmlFor="current-pw">Current Password</label>
            <div className="admin-input-wrap">
              <span className="admin-input-icon material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
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
              <span className="admin-input-icon material-symbols-outlined" style={{ fontSize: 18 }}>key</span>
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
              <span className="admin-input-icon material-symbols-outlined" style={{ fontSize: 18 }}>done_all</span>
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
    </div>
  );
}
