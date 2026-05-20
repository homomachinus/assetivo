"use client";

import { useEffect, useState } from "react";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  is_active: boolean;
  line_id: string;
};

export default function AdminCategoriesPage() {
  const [lines, setLines] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/catalog/lines")
      .then(res => res.json())
      .then(json => {
        setLines(json.data || []);
      });
  }, []);

  const columns: ColumnDef<Category>[] = [

    { key: "name", label: "Name" },
  ];

  const formFields: FormField[] = [
    { name: "name", label: "Category Name", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, description: "Unique URL identifier (e.g., formal-wear)" },
    {
      name: "line_id",
      label: "Product Line",
      type: "select",
      options: lines.map(l => ({ label: l.name, value: l.id })),
      required: true
    },
    { name: "image_url", label: "Image URL", type: "image", placeholder: "https://..." },
    { name: "is_active", label: "Active", type: "boolean" },
  ];

  return (
    <AdminDataTable
      title="Categories"
      entityName="Category"
      endpoint="/api/catalog/categories"
      columns={columns}
      formFields={formFields}
    />
  );
}
