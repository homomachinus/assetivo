"use client";

import { useEffect, useState } from "react";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type ProductAsset = {
  id: string;
  product_id: string;
  gdrive_link: string | null;
  notes: string | null;
  product: { id: string; title: string } | null;
};

export default function AdminAssetsPage() {
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch("/api/catalog/products")
      .then((res) => res.json())
      .then((json) => {
        // API returns raw DB rows; map title field
        const rows = json.data || [];
        setProducts(
          rows.map((p: { id: string; title: string }) => ({
            id: p.id,
            title: p.title,
          }))
        );
      });
  }, []);

  const columns: ColumnDef<ProductAsset>[] = [
    {
      key: "product",
      label: "Product",
      render: (item) => item.product?.title ?? item.product_id,
    },
    {
      key: "gdrive_link",
      label: "Google Drive Link",
      render: (item) =>
        item.gdrive_link ? (
          <a
            href={item.gdrive_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--gold-dark)",
              fontWeight: 600,
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              open_in_new
            </span>
            Open
          </a>
        ) : (
          <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>
        ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (item) => (
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          {item.notes ?? "—"}
        </span>
      ),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "product_id",
      label: "Product",
      type: "select",
      options: products.map((p) => ({ label: p.title, value: p.id })),
      required: true,
    },
    {
      name: "gdrive_link",
      label: "Google Drive Link",
      type: "text",
      placeholder: "https://drive.google.com/...",
      description: "Leave blank if not yet available",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Optional notes about this asset",
    },
  ];

  return (
    <AdminDataTable
      title="Product Assets"
      entityName="Asset"
      endpoint="/api/catalog/assets"
      columns={columns}
      formFields={formFields}
    />
  );
}
