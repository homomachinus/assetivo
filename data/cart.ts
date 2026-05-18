export type CartItem = {
  productId: string;
  quantity: number;
  size: string;
  color: string;
};

export const cartItems: CartItem[] = [
  {
    productId: "shirt-oxford",
    quantity: 1,
    size: "M",
    color: "Sand"
  },
  {
    productId: "bag-weekender",
    quantity: 2,
    size: "One size",
    color: "Black"
  },
  {
    productId: "blazer-slim",
    quantity: 1,
    size: "L",
    color: "Camel"
  }
];
