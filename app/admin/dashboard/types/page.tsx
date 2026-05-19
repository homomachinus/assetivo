"use client";

import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type VariantType = {
  id: string;
  name: string;
  description: string;
};

export default function AdminTypesPage() {
  const columns: ColumnDef<VariantType>[] = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
  ];

  const formFields: FormField[] = [
    { name: "name", label: "Type Name", type: "text", required: true, description: "e.g., Size, Material" },
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
