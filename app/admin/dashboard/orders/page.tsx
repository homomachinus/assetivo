"use client";

import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  order_id: string;
  user_email?: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items?: any;
  metadata?: any;
};

export default function AdminOrdersPage() {
  const columns: ColumnDef<Order>[] = [
    { key: "order_id", label: "Order ID" },
    {
      key: "customer_details",
      label: "Customer Info",
      render: (item) => {
        const name = item.metadata?.customer?.name || "—";
        const phone = item.metadata?.customer?.phone || "—";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 600 }}>{name}</span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{phone}</span>
          </div>
        );
      }
    },
    {
      key: "items",
      label: "Products",
      render: (item) => {
        const items = item.items as { productId: string; title: string; quantity: number; price: number }[] | null;
        if (!items || !Array.isArray(items)) return <span style={{ color: "var(--muted)" }}>—</span>;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
            {items.map((prod, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 500 }}>{prod.title}</span>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>
                  x{prod.quantity} ({formatPrice(prod.price)})
                </span>
              </div>
            ))}
          </div>
        );
      }
    },
    { 
      key: "amount", 
      label: "Amount",
      render: (item) => formatPrice(item.amount)
    },
    { 
      key: "payment_method", 
      label: "Method",
      render: (item) => <span style={{ textTransform: "uppercase", fontSize: 12 }}>{item.payment_method || "—"}</span>
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
    { name: "amount", label: "Amount (IDR)", type: "number", required: true },
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
