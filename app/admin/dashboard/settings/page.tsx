"use client";

export default function AdminSettingsPage() {
  return (
    <div className="admin-card fade-up">
      <div className="admin-header-actions" style={{ marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: "0 0 8px" }}>Store Settings</h2>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>
            Manage your store&apos;s general configuration and preferences.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 32, maxWidth: 600 }}>
        {/* General Settings */}
        <div style={{ display: "grid", gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
            General Information
          </h3>
          
          <div className="field">
            <label>Store Name</label>
            <div className="admin-input-wrap">
              <input type="text" defaultValue="Assetivo Fashion" disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
            </div>
          </div>
          
          <div className="field">
            <label>Support Email</label>
            <div className="admin-input-wrap">
              <input type="email" defaultValue="support@assetivo.store" disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
            </div>
          </div>
        </div>

        {/* Currency & Region */}
        <div style={{ display: "grid", gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
            Currency & Region
          </h3>
          
          <div className="field">
            <label>Default Currency</label>
            <div className="admin-input-wrap">
              <select disabled style={{ padding: "0 12px", width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", opacity: 0.7, cursor: "not-allowed" }}>
                <option value="USD">USD ($)</option>
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }}>expand_more</span>
            </div>
          </div>
          
          <div className="field">
            <label>Timezone</label>
            <div className="admin-input-wrap">
              <select disabled style={{ padding: "0 12px", width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", opacity: 0.7, cursor: "not-allowed" }}>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
              </select>
              <span className="material-symbols-outlined" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }}>expand_more</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 16, backgroundColor: "var(--surface-muted)", borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--gold-dark)" }}>info</span>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            <strong>Note:</strong> Global settings configuration is currently in development. You will be able to modify these values in a future update. If you need to change your password, please go to the <a href="/admin/dashboard" style={{ color: "var(--ink)", fontWeight: 500 }}>Dashboard Home</a>.
          </p>
        </div>

        <div>
          <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
