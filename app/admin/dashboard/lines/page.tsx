"use client";

import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type ProductLine = {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_image_url: string;
  is_active: boolean;
};

export default function AdminLinesPage() {
  const columns: ColumnDef<ProductLine>[] = [
    {
      key: "hero_image_url",
      label: "Hero Image",
      render: (item) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={item.hero_image_url || "https://placehold.co/100x50"} 
          alt={item.name} 
          style={{ width: 80, height: 40, objectFit: "cover", borderRadius: 4, backgroundColor: "var(--line)" }} 
        />
      ),
    },
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    {
      key: "is_active",
      label: "Status",
      render: (item) => (
        <span className={`admin-badge ${item.is_active ? "success" : "neutral"}`}>
          {item.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const formFields: FormField[] = [
    { name: "name", label: "Line Name", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, description: "Unique URL identifier (e.g., signature-collection)" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "hero_image_url", label: "Hero Image URL", type: "image", placeholder: "https://..." },
    { name: "is_active", label: "Active", type: "boolean" },
  ];

  return (
    <AdminDataTable
      title="Product Lines"
      entityName="Line"
      endpoint="/api/catalog/lines"
      columns={columns}
      formFields={formFields}
    />
  );
}
