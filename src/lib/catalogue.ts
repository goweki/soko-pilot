import "server-only";

import { db } from "@/prisma/db";
import {
  DEMO_MERCHANT_ID,
  demoDatabaseWritesEnabled,
} from "@/lib/demo-tenant";

export type CatalogueVariant = {
  id: string;
  label: string | null;
  size: string | null;
  color: string | null;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
};

export type CatalogueProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: "draft" | "active" | "archived";
  variants: CatalogueVariant[];
};

export type CatalogueReadResult =
  | { ok: true; products: CatalogueProduct[] }
  | {
      ok: false;
      error: "database-not-configured" | "merchant-not-seeded" | "storage-unavailable";
    };

export async function listDemoCatalogue(): Promise<CatalogueReadResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false, error: "database-not-configured" };
  }

  try {
    const merchant = await db.orm.public.Merchant.first({ id: DEMO_MERCHANT_ID });
    if (!merchant) {
      return { ok: false, error: "merchant-not-seeded" };
    }

    const products = await db.orm.public.Product
      .include("variants")
      .where({ merchantId: merchant.id })
      .orderBy((product) => product.name.asc())
      .all();

    return {
      ok: true,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        status: product.status,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          size: variant.size,
          color: variant.color,
          priceMinor: variant.priceMinor,
          currency: variant.currency,
          stockQuantity: variant.stockQuantity,
          isActive: variant.isActive,
        })),
      })),
    };
  } catch (error) {
    console.error(
      "[catalogue] Database read failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false, error: "storage-unavailable" };
  }
}

export async function searchDemoCatalogue(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery || normalizedQuery.length > 200) {
    return { ok: false as const, error: "invalid-query" as const };
  }

  const result = await listDemoCatalogue();
  if (!result.ok) return result;

  const terms = normalizedQuery.split(/\s+/);
  const products = result.products
    .filter((product) => product.status === "active")
    .map((product) => {
      const activeVariants = product.variants.filter((variant) => variant.isActive);
      const searchableText = [
        product.name,
        product.description ?? "",
        product.category ?? "",
        ...activeVariants.flatMap((variant) => [
          variant.label ?? "",
          variant.size ?? "",
          variant.color ?? "",
        ]),
      ]
        .join(" ")
        .toLocaleLowerCase();
      return {
        product: { ...product, variants: activeVariants },
        matched: terms.every((term) => searchableText.includes(term)),
      };
    })
    .filter(({ matched }) => matched)
    .map(({ product }) => product);

  return { ok: true as const, products };
}

export async function createDemoProduct(input: {
  name: string;
  description: string | null;
  category: string | null;
  label: string | null;
  size: string | null;
  color: string | null;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
}) {
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false as const, error: "database-not-configured" as const };
  }
  if (!demoDatabaseWritesEnabled()) {
    return { ok: false as const, error: "writes-not-approved" as const };
  }

  try {
    const merchant = await db.orm.public.Merchant.first({ id: DEMO_MERCHANT_ID });
    if (!merchant) {
      return { ok: false as const, error: "merchant-not-seeded" as const };
    }

    await db.transaction(async (tx) => {
      const product = await tx.orm.public.Product.create({
        merchantId: merchant.id,
        name: input.name,
        description: input.description,
        category: input.category,
        status: "active",
      });

      await tx.orm.public.ProductVariant.create({
        productId: product.id,
        sku: `DEMO-${crypto.randomUUID()}`,
        label: input.label,
        size: input.size,
        color: input.color,
        priceMinor: input.priceMinor,
        currency: input.currency,
        stockQuantity: input.stockQuantity,
        isActive: true,
      });
    });

    return { ok: true as const };
  } catch (error) {
    console.error(
      "[catalogue] Product creation failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false as const, error: "storage-unavailable" as const };
  }
}

export async function updateDemoVariantStock(variantId: string, stockQuantity: number) {
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false as const, error: "database-not-configured" as const };
  }
  if (!demoDatabaseWritesEnabled()) {
    return { ok: false as const, error: "writes-not-approved" as const };
  }

  try {
    const variant = await db.orm.public.ProductVariant
      .include("product")
      .first({ id: variantId });

    if (!variant || variant.product.merchantId !== DEMO_MERCHANT_ID) {
      return { ok: false as const, error: "not-found" as const };
    }

    await db.orm.public.ProductVariant
      .where({ id: variant.id, productId: variant.productId })
      .update({ stockQuantity });

    return { ok: true as const };
  } catch (error) {
    console.error(
      "[catalogue] Stock update failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false as const, error: "storage-unavailable" as const };
  }
}
