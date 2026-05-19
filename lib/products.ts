export type Product = {
  id: string;
  line: string;
  category: string;
  variantType: string;
  variantColor: string;
  lineId?: string;
  categoryId?: string;
  variantTypeId?: string;
  variantColorId?: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image: string;
  was?: number;
  favourite?: boolean;
};

export type DbProductRow = {
  id: string;
  line_id: string;
  category_id: string;
  variant_type_id: string;
  variant_color_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string | null;
  image_url: string | null;
  line: { name: string } | null;
  category: { name: string } | null;
  variantType: { name: string } | null;
  variantColor: { name: string } | null;
};

export const PRODUCTS_SELECT =
  "id,title,description,price,currency,image_url,line_id,category_id,variant_type_id,variant_color_id," +
  "line:product_lines(name),category:product_categories(name)," +
  "variantType:variant_types(name),variantColor:variant_colors(name)";

const FALLBACK_IMAGE = "/assets/cover/image1.png";

export function mapDbProduct(row: DbProductRow): Product {
  const lineName = row.line?.name ?? "";
  const categoryName = row.category?.name ?? "";
  const typeName = row.variantType?.name ?? "";
  const colorName = row.variantColor?.name ?? "";

  return {
    id: row.id,
    line: lineName,
    category: categoryName,
    variantType: typeName,
    variantColor: colorName,
    lineId: row.line_id,
    categoryId: row.category_id,
    variantTypeId: row.variant_type_id,
    variantColorId: row.variant_color_id,
    name: row.title,
    description: row.description ?? "",
    price: row.price,
    currency: row.currency ?? "IDR",
    image: row.image_url ?? FALLBACK_IMAGE,
    favourite: false
  };
}

export function mapDbProducts(rows: DbProductRow[]): Product[] {
  return rows.map(mapDbProduct);
}
