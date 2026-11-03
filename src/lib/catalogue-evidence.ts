export type RankableVariant = {
  id: string;
  label: string | null;
  size: string | null;
  color: string | null;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
};

export type RankableProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: "draft" | "active" | "archived";
  variants: RankableVariant[];
};

const SYNONYM_GROUPS: string[][] = [
  ["shirt", "shati"],
  ["shoes", "shoe", "viatu", "kiatu"],
  ["dress", "gauni"],
  ["skirt", "sketi"],
  ["trousers", "pants", "suruali"],
  ["bag", "mkoba"],
  ["hat", "cap", "kofia"],
  ["scarf", "skafu"],
  ["jacket", "jaketi", "koti"],
  ["cheap", "affordable", "nafuu"],
  ["red", "nyekundu"],
  ["blue", "buluu", "bluu"],
  ["black", "nyeusi"],
  ["white", "nyeupe"],
  ["green", "kijani"],
];

function expandTerm(term: string): string[] {
  const group = SYNONYM_GROUPS.find((candidate) => candidate.includes(term));
  return group ?? [term];
}

export function scoreCatalogueProduct(
  product: RankableProduct,
  query: string,
): number {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return 0;
  const terms = normalized.split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;
  const activeVariants = product.variants.filter((v) => v.isActive);
  const searchable = [
    product.name,
    product.description ?? "",
    product.category ?? "",
    ...activeVariants.flatMap((v) => [v.label ?? "", v.size ?? "", v.color ?? ""]),
  ]
    .join(" ")
    .toLocaleLowerCase();
  let matched = 0;
  for (const term of terms) {
    if (expandTerm(term).some((candidate) => searchable.includes(candidate))) {
      matched += 1;
    }
  }
  if (matched === 0) return 0;
  let score = matched * 10;
  if (product.name.toLocaleLowerCase().includes(normalized)) score += 50;
  if (matched === terms.length) score += 20;
  if (activeVariants.some((v) => v.stockQuantity > 0)) score += 5;
  return score;
}

export function rankCatalogueProducts<T extends RankableProduct>(
  products: T[],
  query: string,
): T[] {
  return products
    .map((product) => ({ product, score: scoreCatalogueProduct(product, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .map(({ product }) => product);
}

export function buildCatalogueEvidence(
  products: RankableProduct[],
  retrievedAt = new Date().toISOString(),
) {
  return {
    retrievedAt,
    products: products.slice(0, 8).map((product) => ({
      productId: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      variants: product.variants.map((variant) => ({
        variantId: variant.id,
        label: variant.label,
        size: variant.size,
        color: variant.color,
        priceMinor: variant.priceMinor,
        currency: variant.currency,
        stockQuantity: variant.stockQuantity,
      })),
    })),
  };
}
