"use client";

import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type Order = {
  id: string;
  order_id: string;
  user_email: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
};

export default function AdminOrdersPage() {
  const columns: ColumnDef<Order>[] = [
    { key: "order_id", label: "Order ID" },
    { key: "user_email", label: "Customer Email" },
    { 
      key: "amount", 
      label: "Amount",
      render: (item) => `$${item.amount.toFixed(2)}`
    },
    { 
      key: "payment_method", 
      label: "Method",
      render: (item) => <span style={{ textTransform: "uppercase", fontSize: 12 }}>{item.payment_method}</span>
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`admin-badge ${item.status === 'success' ? 'success' : item.status === 'pending' ? 'warning' : 'error'}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (item) => new Date(item.created_at).toLocaleDateString()
    }
  ];

  const formFields: FormField[] = [
    { name: "order_id", label: "Order ID", type: "text", required: true },
    { name: "user_email", label: "Customer Email", type: "text", required: true },
    { name: "amount", label: "Amount ($)", type: "number", required: true },
    { 
      name: "status", 
      label: "Status", 
      type: "select", 
      options: [
        { label: "Success", value: "success" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
      ],
      required: true 
    },
    { name: "payment_method", label: "Payment Method", type: "text", required: true },
  ];

  return (
    <AdminDataTable
      title="Orders (Payment History)"
      entityName="Order"
      endpoint="/api/payment-history"
      columns={columns}
      formFields={formFields}
    />
  );
}
