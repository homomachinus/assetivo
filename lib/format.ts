export function formatPrice(value: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  }).format(value);

  return `Rp. ${formatted}`;
}
