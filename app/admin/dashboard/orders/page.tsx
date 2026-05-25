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

function exportToCsv(data: Order[]) {
  const headers = ["Order ID", "Customer Name", "Customer Phone", "Customer Email", "Products", "Amount", "Method", "Status", "Date"];
  
  const rows = data.map(order => {
    const name = order.metadata?.customer?.name || "—";
    const phone = order.metadata?.customer?.phone || "—";
    const email = order.metadata?.customer?.email || order.user_email || "—";
    
    let products = "—";
    if (order.items && Array.isArray(order.items)) {
      products = order.items.map((p: any) => `${p.title} (x${p.quantity})`).join(" | ");
    }
    
    return [
      order.order_id,
      name,
      phone,
      email,
      products,
      order.amount,
      order.payment_method || "—",
      order.status,
      new Date(order.created_at).toLocaleDateString()
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
  });
  
  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

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
      exportAction={(data) => (
        <button 
          className="btn btn-outline" 
          onClick={() => exportToCsv(data as Order[])}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
          Export CSV
        </button>
      )}
    />
  );
}
