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
    {
      key: "hex_code",
      label: "Color",
      render: (item) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div 
            style={{ 
              width: 24, height: 24, borderRadius: "50%", 
              backgroundColor: item.hex_code, border: "1px solid var(--line)" 
            }} 
          />
          <span style={{ fontFamily: "monospace", fontSize: 12 }}>{item.hex_code}</span>
        </div>
      ),
    },
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
