"use client";

import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const columns: ColumnDef<AdminUser>[] = [
    { key: "email", label: "Email" },
    { key: "full_name", label: "Name" },
    { 
      key: "role", 
      label: "Role",
      render: (item) => <span style={{ textTransform: "capitalize" }}>{item.role}</span>
    },
    {
      key: "is_active",
      label: "Status",
      render: (item) => (
        <span className={`admin-badge ${item.is_active ? "success" : "error"}`}>
          {item.is_active ? "Active" : "Disabled"}
        </span>
      ),
    },
    { 
      key: "created_at", 
      label: "Joined",
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
  ];

  const formFields: FormField[] = [
    { name: "email", label: "Email", type: "text", required: true },
    { name: "full_name", label: "Full Name", type: "text" },
    { name: "role", label: "Role", type: "select", options: [{ label: "Admin", value: "admin" }, { label: "Superadmin", value: "superadmin" }], required: true },
    { name: "is_active", label: "Active", type: "boolean" },
  ];

  return (
    <AdminDataTable
      title="Admin Users"
      entityName="User"
      endpoint="/api/admin-users"
      columns={columns}
      formFields={formFields}
    />
  );
}
