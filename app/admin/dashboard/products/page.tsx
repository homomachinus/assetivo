"use client";

import { useEffect, useState } from "react";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { FormField } from "@/components/admin/AdminFormModal";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  category_id: string;
  line_id: string;
  variant_type_id: string;
  variant_color_id: string;
};

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [lines, setLines] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/catalog/categories").then(res => res.json()),
      fetch("/api/catalog/lines").then(res => res.json()),
      fetch("/api/catalog/types").then(res => res.json()),
      fetch("/api/catalog/colors").then(res => res.json())
    ]).then(([cats, lns, typs, cols]) => {
      setCategories(cats.data || []);
      setLines(lns.data || []);
      setTypes(typs.data || []);
      setColors(cols.data || []);
    });
  }, []);

  const columns: ColumnDef<Product>[] = [
    {
      key: "image_url",
      label: "Image",
      render: (item) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={item.image_url || "https://placehold.co/100x100"} 
          alt={item.title} 
          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, backgroundColor: "var(--line)" }} 
        />
      ),
    },
    { key: "title", label: "Title" },
    { 
      key: "price", 
      label: "Price",
      render: (item) => `${item.currency || "IDR"} ${item.price.toLocaleString()}`
    }
  ];

  const formFields: FormField[] = [
    { name: "title", label: "Product Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "currency", label: "Currency", type: "text" },
    { name: "imageUrl", label: "Image URL", type: "text" },
    { 
      name: "lineId", 
      label: "Product Line", 
      type: "select", 
      options: lines.map(l => ({ label: l.name, value: l.id })),
      required: true
    },
    { 
      name: "categoryId", 
      label: "Category", 
      type: "select", 
      options: categories.map(c => ({ label: c.name, value: c.id })),
      required: true 
    },
    { 
      name: "variantTypeId", 
      label: "Variant Type", 
      type: "select", 
      options: types.map(c => ({ label: c.name, value: c.id })),
      required: true 
    },
    { 
      name: "variantColorId", 
      label: "Variant Color", 
      type: "select", 
      options: colors.map(c => ({ label: c.name, value: c.id })),
      required: true 
    }
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
