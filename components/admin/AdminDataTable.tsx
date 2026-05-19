"use client";

import { useState, useEffect, useCallback } from "react";
import AdminFormModal, { FormField } from "./AdminFormModal";

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
};

type AdminDataTableProps<T> = {
  title: string;
  endpoint: string;
  columns: ColumnDef<T>[];
  formFields: FormField[];
  entityName: string;
  primaryKey?: keyof T;
};

export default function AdminDataTable<T extends Record<string, any>>({
  title,
  endpoint,
  columns,
  formFields,
  entityName,
  primaryKey = "id" as keyof T,
}: AdminDataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      if (res.ok) {
        setData(json.data || []);
      } else {
        setError(json.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (item: T) => {
    if (!confirm(`Are you sure you want to delete this ${entityName}?`)) return;
    
    try {
      const id = item[primaryKey];
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to delete");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleOpenEdit = (item: T) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: Record<string, any>) => {
    try {
      const isEdit = !!editingItem;
      const url = isEdit ? `${endpoint}/${editingItem[primaryKey]}` : endpoint;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
      throw err; // Re-throw to keep modal open
    }
  };

  return (
    <div className="admin-card fade-up">
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontSize: 20, margin: "0 0 4px" }}>{title}</h2>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 13 }}>
            Manage your store&apos;s {entityName}s here.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Add {entityName}
        </button>
      </div>

      {error && (
        <div className="admin-badge error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)}>{col.label}</th>
              ))}
              <th style={{ width: 100, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 40 }}>
                  <div className="admin-spinner" style={{ width: 24, height: 24, borderTopColor: "var(--gold-dark)" }} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                  No {entityName}s found.
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={item[primaryKey as string] || i}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(item) : String(item[col.key as keyof T] ?? "-")}
                    </td>
                  ))}
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                      <button className="admin-action-btn" onClick={() => handleOpenEdit(item)} title="Edit">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                      </button>
                      <button className="admin-action-btn delete" onClick={() => handleDelete(item)} title="Delete">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AdminFormModal
          title={editingItem ? `Edit ${entityName}` : `Add ${entityName}`}
          fields={formFields}
          initialData={editingItem || {}}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
