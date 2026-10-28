export function parsePriceMinor(value: string): number | null {
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) return null;
  const minor = Math.round(Number(value) * 100);
  return Number.isSafeInteger(minor) ? minor : null;
}

export function parseStockQuantity(value: string): number | null {
  if (!/^\d{1,6}$/.test(value)) return null;
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) ? quantity : null;
}
