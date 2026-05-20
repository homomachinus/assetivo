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
    { key: "name", label: "Name" },

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
