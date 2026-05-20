"use client";

import { useEffect, useState } from "react";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type VariantType = {
  id: string;
  name: string;
  description: string;
  category_id: string;
};

export default function AdminTypesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/catalog/categories")
      .then(res => res.json())
      .then(json => {
        setCategories(json.data || []);
      });
  }, []);

  const columns: ColumnDef<VariantType>[] = [
    { key: "name", label: "Name" },
  ];

  const formFields: FormField[] = [
    { name: "name", label: "Type Name", type: "text", required: true, description: "e.g., Size, Material" },
    {
      name: "category_id",
      label: "Category",
      type: "select",
      options: categories.map(c => ({ label: c.name, value: c.id })),
      required: true
    },
    { name: "description", label: "Description", type: "text" },
  ];

  return (
    <AdminDataTable
      title="Variant Types"
      entityName="Type"
      endpoint="/api/catalog/types"
      columns={columns}
      formFields={formFields}
    />
  );
}
