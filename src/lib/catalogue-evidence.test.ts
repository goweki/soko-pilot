import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCatalogueEvidence,
  rankCatalogueProducts,
  type RankableProduct,
} from "./catalogue-evidence";
import { buildConstrainedBundle } from "./bundle";

function product(
  overrides: Partial<RankableProduct> & { id: string; name: string },
): RankableProduct {
  return {
    description: null,
    category: null,
    status: "active",
    variants: [
      {
        id: `${overrides.id}-v1`,
        label: null,
        size: null,
        color: null,
        priceMinor: 100_000,
        currency: "KES",
        stockQuantity: 3,
        isActive: true,
      },
    ],
    ...overrides,
  };
}

const shirt = product({ id: "p1", name: "Kito linen shirt", category: "shirts" });
const scarf = product({ id: "p2", name: "Nia silk scarf", category: "accessories" });

test("ranked search prefers all-term matches and handles Swahili synonyms", () => {
  assert.deepEqual(
    rankCatalogueProducts([scarf, shirt], "linen shirt").map((p) => p.id),
    ["p1"],
  );
  assert.deepEqual(
    rankCatalogueProducts([scarf, shirt], "shati").map((p) => p.id),
    ["p1"],
  );
  assert.deepEqual(rankCatalogueProducts([scarf, shirt], "leather jacket"), []);
});

test("catalogue evidence preserves product/variant IDs and freshness timestamp", () => {
  const evidence = buildCatalogueEvidence([shirt], "2026-11-03T12:00:00.000Z");
  assert.equal(evidence.retrievedAt, "2026-11-03T12:00:00.000Z");
  assert.equal(evidence.products[0].productId, "p1");
  assert.equal(evidence.products[0].variants[0].variantId, "p1-v1");
});

test("constrained bundle stays within budget with exact deterministic total", () => {
  const wrap = product({
    id: "p3",
    name: "Maua cotton wrap",
    category: "wraps",
    variants: [
      {
        id: "p3-v1",
        label: null,
        size: null,
        color: null,
        priceMinor: 150_000,
        currency: "KES",
        stockQuantity: 2,
        isActive: true,
      },
    ],
  });
  const bundle = buildConstrainedBundle([shirt, scarf, wrap], 300_000, "KES");
  assert.ok(bundle);
  assert.equal(bundle.totalMinor, 200_000);
  assert.equal(bundle.remainingMinor, 100_000);
  assert.ok(bundle.items.every((item) => item.variantId));
  assert.equal(buildConstrainedBundle([shirt], 500_000, "KES"), null);
  assert.equal(buildConstrainedBundle([shirt, wrap], 0, "KES"), null);
});
