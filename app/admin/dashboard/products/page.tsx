"use client";

import { useEffect, useState } from "react";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category_id: string;
  line_id: string;
  is_active: boolean;
};

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [lines, setLines] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/catalog/categories").then(res => res.json()),
      fetch("/api/catalog/lines").then(res => res.json())
    ]).then(([cats, lns]) => {
      setCategories(cats.data || []);
      setLines(lns.data || []);
    });
  }, []);

  const columns: ColumnDef<Product>[] = [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { 
      key: "price", 
      label: "Price",
      render: (item) => `$${item.price.toFixed(2)}`
    },
    { 
      key: "stock", 
      label: "Stock",
      render: (item) => (
        <span className={`admin-badge ${item.stock > 10 ? "success" : item.stock > 0 ? "warning" : "error"}`}>
          {item.stock} in stock
        </span>
      )
    },
    {
      key: "is_active",
      label: "Status",
      render: (item) => (
        <span className={`admin-badge ${item.is_active ? "success" : "neutral"}`}>
          {item.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const formFields: FormField[] = [
    { name: "name", label: "Product Name", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price ($)", type: "number", required: true },
    { name: "sale_price", label: "Sale Price ($)", type: "number" },
    { name: "stock", label: "Stock Quantity", type: "number", required: true },
    { 
      name: "category_id", 
      label: "Category", 
      type: "select", 
      options: categories.map(c => ({ label: c.name, value: c.id })),
      required: true 
    },
    { 
      name: "line_id", 
      label: "Product Line", 
      type: "select", 
      options: lines.map(l => ({ label: l.name, value: l.id })),
    },
    { name: "is_active", label: "Active", type: "boolean" },
  ];

  return (
    <AdminDataTable
      title="Products"
      entityName="Product"
      endpoint="/api/catalog/products"
      columns={columns}
      formFields={formFields}
    />
  );
}
