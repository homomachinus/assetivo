"use client";

import { useEffect, useState } from "react";

type Gateway = {
  id: number;
  name: string;
  is_active: boolean;
};

export default function PaymentGatewayPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadGateways = async () => {
    const res = await fetch("/api/admin/payment-gateways");
    const json = await res.json();
    const data: Gateway[] = json.data || [];
    setGateways(data);
    const active = data.find((g) => g.is_active);
    setActiveId(active ? active.id : null);
  };

  useEffect(() => {
    loadGateways().finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (activeId === null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_id: activeId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      // Reload from DB to ensure UI matches reality
      await loadGateways();
      setToast("Payment gateway updated successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Error saving");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-empty">
        <div className="admin-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="pg-settings">
      {toast && (
        <div className="pg-toast" data-success={toast.includes("success")}>
          {toast}
        </div>
      )}

      <div className="pg-card">
        <div className="pg-card-header">
          <h3>Active Payment Gateway</h3>
          <p className="pg-card-desc">
            Select which payment provider will be used for all transactions on
            this store. Only one gateway can be active at a time.
          </p>
        </div>

        <div className="pg-options">
          {gateways.map((gw) => (
            <label
              key={gw.id}
              className={`pg-option${activeId === gw.id ? " selected" : ""}`}
            >
              <input
                type="radio"
                name="gateway"
                value={gw.id}
                checked={activeId === gw.id}
                onChange={() => setActiveId(gw.id)}
              />
              <div className="pg-option-body">
                <span className="pg-option-name">{gw.name}</span>
                <span className="pg-option-badge">
                  {gw.id === 0 ? "Snap / Pop-up" : "QRIS & VA"}
                </span>
              </div>
              {activeId === gw.id && (
                <span className="pg-option-check">✓</span>
              )}
            </label>
          ))}
        </div>

        <div className="pg-env-hint">
          <strong>Environment Variables Required:</strong>
          <ul>
            <li>
              <code>MIDTRANS_SERVER_KEY</code> &amp; <code>MIDTRANS_CLIENT_KEY</code>{" "}
              — for Midtrans
            </li>
            <li>
              <code>PAYMENKU_API_KEY</code> &amp; <code>PAYMENKU_WEBHOOK_SECRET</code>{" "}
              — for Paymenku
            </li>
          </ul>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 8 }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
