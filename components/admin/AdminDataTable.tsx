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
  exportAction?: (data: T[]) => React.ReactNode;
};

export default function AdminDataTable<T extends Record<string, any>>({
  title,
  endpoint,
  columns,
  formFields,
  entityName,
  primaryKey = "id" as keyof T,
  exportAction,
}: AdminDataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Client-side search: filter across all visible columns
  const filteredData = searchQuery.trim()
    ? data.filter((item) => {
        const q = searchQuery.toLowerCase();
        return columns.some((col) => {
          const val = item[col.key as keyof T];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      })
    : data;

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    // Reset to page 1 if data shrinks below current page
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredData.length, totalPages, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="admin-card fade-up">
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontSize: 20, margin: "0 0 4px" }}>{title}</h2>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 13 }}>
            Manage your store&apos;s {entityName}s here.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {exportAction && exportAction(filteredData)}
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Add {entityName}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <span className="material-symbols-outlined admin-search-icon">search</span>
        <input
          type="text"
          placeholder={`Search ${entityName}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search-input"
        />
        {searchQuery && (
          <button
            className="admin-search-clear"
            onClick={() => setSearchQuery("")}
            type="button"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
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
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                  {searchQuery ? `No ${entityName}s matching "${searchQuery}".` : `No ${entityName}s found.`}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, i) => (
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

      {filteredData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{searchQuery ? ` (filtered from ${data.length})` : ''} entries
            </span>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, cursor: 'pointer', outline: 'none' }}
            >
              {[10, 20, 50].map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 16px', fontSize: 13, minWidth: 80, justifyContent: 'center' }} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 500 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 16px', fontSize: 13, minWidth: 80, justifyContent: 'center' }} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
