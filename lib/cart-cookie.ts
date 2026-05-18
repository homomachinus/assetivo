export type CartItem = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

const COOKIE_NAME = "assetivo_cart";

export function readCartCookie(): CartItem[] {
  if (typeof document === "undefined") {
    return [];
  }

  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (!entry) {
    return [];
  }

  const rawValue = entry.split("=")[1];

  try {
    const decoded = decodeURIComponent(rawValue);
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCartCookie(items: CartItem[]): void {
  if (typeof document === "undefined") {
    return;
  }

  const payload = encodeURIComponent(JSON.stringify(items));
  const maxAge = 60 * 60 * 24 * 30;

  document.cookie = `${COOKIE_NAME}=${payload}; path=/; max-age=${maxAge}`;
}

export function addToCartCookie(item: CartItem): CartItem[] {
  const items = readCartCookie();
  const existing = items.find(
    (entry) =>
      entry.productId === item.productId &&
      entry.size === item.size &&
      entry.color === item.color
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }

  writeCartCookie(items);
  return items;
}
