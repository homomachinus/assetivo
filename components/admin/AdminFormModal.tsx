"use client";

import { useState, useEffect } from "react";

export type FormFieldType = "text" | "number" | "boolean" | "textarea" | "select" | "image";

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: { label: string; value: string | number }[]; // For select
  placeholder?: string;
  description?: string;
};

type AdminFormModalProps = {
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onClose: () => void;
  onSave: (data: Record<string, any>) => Promise<void>;
};

export default function AdminFormModal({
  title,
  fields,
  initialData = {},
  onClose,
  onSave,
}: AdminFormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaultData: Record<string, any> = {};
    fields.forEach((f) => {
      if (initialData[f.name] !== undefined) {
        defaultData[f.name] = initialData[f.name];
      } else if (f.type === "boolean") {
        defaultData[f.name] = false;
      } else if (f.type === "number") {
        defaultData[f.name] = "";
      } else {
        defaultData[f.name] = "";
      }
    });
    setFormData(defaultData);
  }, [fields, initialData]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      // Auto-fill slug if name or title changes
      if ((name === "name" || name === "title") && fields.some((f) => f.name === "slug")) {
        // Only autofill if it's a new item (no initialData ID) or we want to force it
        // Actually, let's just always autofill for convenience if the user types
        const slugified = (value || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        next.slug = slugified;
      }
      
      return next;
    });
  };

  const handleFileUpload = async (name: string, file: File) => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      handleChange(name, json.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Process numbers
      const processedData = { ...formData };
      fields.forEach((f) => {
        if (f.type === "number" && processedData[f.name] !== "") {
          processedData[f.name] = Number(processedData[f.name]);
        }
      });
      await onSave(processedData);
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal fade-up">
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="admin-modal-body">
          <form id="admin-modal-form" onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: 16 }}>
              {fields.map((field) => (
                <div className="field" key={field.name}>
                  <label htmlFor={`field-${field.name}`}>
                    {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
                  </label>
                  
                  {field.type === "image" ? (
                    <div className="admin-input-wrap" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "12px", height: "auto" }}>
                      {formData[field.name] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={formData[field.name]} 
                          alt="Preview" 
                          style={{ width: "100%", maxWidth: 200, height: "auto", borderRadius: 8, border: "1px solid var(--line)", marginBottom: 8 }} 
                        />
                      )}
                      <input
                        id={`field-${field.name}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(field.name, file);
                        }}
                        style={{ width: "100%" }}
                        required={field.required && !formData[field.name]}
                      />
                      <input type="hidden" value={formData[field.name] ?? ""} name={field.name} />
                    </div>
                  ) : field.type === "text" || field.type === "number" ? (
                    <div className="admin-input-wrap">
                      <input
                        id={`field-${field.name}`}
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={formData[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        step={field.type === "number" ? "any" : undefined}
                      />
                    </div>
                  ) : field.type === "textarea" ? (
                    <div className="admin-input-wrap">
                      <textarea
                        id={`field-${field.name}`}
                        placeholder={field.placeholder}
                        value={formData[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        rows={4}
                        style={{ padding: "12px", width: "100%", border: "none", outline: "none", background: "transparent", resize: "vertical" }}
                      />
                    </div>
                  ) : field.type === "select" ? (
                    <div className="admin-input-wrap">
                      <select
                        id={`field-${field.name}`}
                        value={formData[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        style={{ padding: "0 12px", width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", appearance: "none" }}
                      >
                        <option value="" disabled>Select {field.label}</option>
                        {field.options?.map((opt) => (
                          <option key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }}>expand_more</span>
                    </div>
                  ) : field.type === "boolean" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        id={`field-${field.name}`}
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        style={{ width: 18, height: 18 }}
                      />
                      <label htmlFor={`field-${field.name}`} style={{ margin: 0, fontWeight: 500, cursor: "pointer" }}>Yes</label>
                    </div>
                  ) : null}
                  
                  {field.description && (
                    <span style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, display: "block" }}>{field.description}</span>
                  )}
                </div>
              ))}
            </div>
          </form>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="admin-modal-form" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="admin-spinner" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
