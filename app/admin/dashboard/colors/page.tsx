"use client";

import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type VariantColor = {
  id: string;
  name: string;
  hex_code: string;
};

export default function AdminColorsPage() {
  const columns: ColumnDef<VariantColor>[] = [
    { key: "name", label: "Name" },
  ];

  const formFields: FormField[] = [
    { name: "name", label: "Color Name", type: "text", required: true, description: "e.g., Midnight Blue" },
    { name: "hex_code", label: "Hex Code", type: "text", required: true, description: "e.g., #000000" },
  ];

  return (
    <AdminDataTable
      title="Variant Colors"
      entityName="Color"
      endpoint="/api/catalog/colors"
      columns={columns}
      formFields={formFields}
    />
  );
}
