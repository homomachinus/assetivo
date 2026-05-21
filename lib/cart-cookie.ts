export type CartItem = {
  productId: string;
  quantity: number;
  variantType?: string;
  variantColor?: string;
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
  const desiredType = item.variantType ?? item.size;
  const desiredColor = item.variantColor ?? item.color;

  const existing = items.find((entry) => {
    const entryType = entry.variantType ?? entry.size;
    const entryColor = entry.variantColor ?? entry.color;
    return (
      entry.productId === item.productId &&
      entryType === desiredType &&
      entryColor === desiredColor
    );
  });

  if (existing) {
    // Digital assets only need quantity 1. If it already exists, do not increment.
    existing.quantity = 1;
  } else {
    items.push({
      ...item,
      variantType: desiredType,
      variantColor: desiredColor
    });
  }

  writeCartCookie(items);
  return items;
}
