import type { RankableProduct } from "./catalogue-evidence";

export type BundleItem = {
  productId: string;
  variantId: string;
  name: string;
  category: string | null;
  priceMinor: number;
  currency: string;
};

export type ConstrainedBundle = {
  items: BundleItem[];
  totalMinor: number;
  currency: string;
  budgetMinor: number;
  remainingMinor: number;
};

/**
 * Deterministic constrained bundle: cheapest in-stock variant per distinct
 * category, added cheapest-first while the running total stays within budget.
 * No discounts are invented; totals are exact sums of catalogue prices.
 */
export function buildConstrainedBundle(
  products: RankableProduct[],
  budgetMinor: number,
  currency: string,
): ConstrainedBundle | null {
  if (!Number.isSafeInteger(budgetMinor) || budgetMinor <= 0) return null;
  const cheapestPerCategory = new Map<string, BundleItem>();
  for (const product of products) {
    if (product.status !== "active") continue;
    const category = (product.category ?? product.name).toLocaleLowerCase();
    for (const variant of product.variants) {
      if (!variant.isActive || variant.stockQuantity <= 0) continue;
      if (variant.currency !== currency) continue;
      const existing = cheapestPerCategory.get(category);
      if (!existing || variant.priceMinor < existing.priceMinor) {
        cheapestPerCategory.set(category, {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          category: product.category,
          priceMinor: variant.priceMinor,
          currency: variant.currency,
        });
      }
    }
  }
  const candidates = [...cheapestPerCategory.values()].sort(
    (a, b) => a.priceMinor - b.priceMinor || a.name.localeCompare(b.name),
  );
  const items: BundleItem[] = [];
  let totalMinor = 0;
  for (const candidate of candidates) {
    if (totalMinor + candidate.priceMinor > budgetMinor) continue;
    items.push(candidate);
    totalMinor += candidate.priceMinor;
  }
  if (items.length < 2) return null;
  return {
    items,
    totalMinor,
    currency,
    budgetMinor,
    remainingMinor: budgetMinor - totalMinor,
  };
}
