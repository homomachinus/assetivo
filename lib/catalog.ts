import { cartItems, type CartItem } from "@/data/cart";
import { products, type Product } from "@/data/products";

export type CartLine = {
  item: CartItem;
  product: Product;
  lineTotal: number;
};

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(
  line: string,
  category: string,
  currentId: string,
  count: number
): Product[] {
  return products
    .filter(
      (product) =>
        product.line === line &&
        product.category === category &&
        product.id !== currentId
    )
    .slice(0, count);
}

export function getCartLines(): CartLine[] {
  return cartItems
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) {
        return null;
      }
      return {
        item,
        product,
        lineTotal: product.price * item.quantity
      };
    })
    .filter((line): line is CartLine => Boolean(line));
}

export function getCartTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const discount = subtotal > 900 ? 60 : 0;
  const total = subtotal + shipping - discount;

  return { subtotal, shipping, discount, total };
}
