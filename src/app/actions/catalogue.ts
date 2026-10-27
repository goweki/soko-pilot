"use server";

import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import { isLocale, type Locale } from "@/lib/i18n";
import {
  createDemoProduct,
  updateDemoVariantStock,
} from "@/lib/catalogue";

export type CatalogueActionState =
  | { status: "success"; operation: "created" | "stock-updated" }
  | {
      status: "error";
      reason:
        | "invalid-input"
        | "not-authorized"
        | "database-not-configured"
        | "merchant-not-seeded"
        | "writes-not-approved"
        | "writes-not-approved"
        | "not-found"
        | "storage-unavailable";
    }
  | null;

function getLocale(formData: FormData): Locale | null {
  const locale = formData.get("locale");
  return typeof locale === "string" && isLocale(locale) ? locale : null;
}

export async function createCatalogueProduct(
  _previousState: CatalogueActionState,
  formData: FormData,
): Promise<CatalogueActionState> {
  const locale = getLocale(formData);
  if (!locale) return { status: "error", reason: "invalid-input" };
  if (!(await hasDemoAccess())) return { status: "error", reason: "not-authorized" };

  const name = formData.get("name");
  const description = formData.get("description");
  const category = formData.get("category");
  const label = formData.get("label");
  const size = formData.get("size");
  const color = formData.get("color");
  const price = formData.get("price");
  const currency = formData.get("currency");
  const stock = formData.get("stock");

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 120 ||
    typeof price !== "string" ||
    !/^\d{1,8}(?:\.\d{1,2})?$/.test(price) ||
    Number(price) < 0 ||
    typeof currency !== "string" ||
    !/^[A-Z]{3}$/.test(currency) ||
    typeof stock !== "string" ||
    !/^\d{1,6}$/.test(stock) ||
    [description, category, label, size, color].some(
      (value) => value !== null && typeof value !== "string",
    )
  ) {
    return { status: "error", reason: "invalid-input" };
  }

  const priceMinor = Math.round(Number(price) * 100);
  const stockQuantity = Number(stock);
  if (!Number.isSafeInteger(priceMinor) || !Number.isSafeInteger(stockQuantity)) {
    return { status: "error", reason: "invalid-input" };
  }
  try {
    new Intl.NumberFormat("en", { style: "currency", currency }).format(0);
  } catch {
    return { status: "error", reason: "invalid-input" };
  }

  const result = await createDemoProduct({
    name: name.trim(),
    description: typeof description === "string" && description.trim()
      ? description.trim().slice(0, 1000)
      : null,
    category: typeof category === "string" && category.trim()
      ? category.trim().slice(0, 80)
      : null,
    label: typeof label === "string" && label.trim() ? label.trim().slice(0, 80) : null,
    size: typeof size === "string" && size.trim() ? size.trim().slice(0, 40) : null,
    color: typeof color === "string" && color.trim() ? color.trim().slice(0, 60) : null,
    priceMinor,
    currency,
    stockQuantity,
  });

  if (!result.ok) return { status: "error", reason: result.error };
  revalidatePath(`/${locale}/dashboard/products`);
  revalidatePath(`/${locale}/dashboard`);
  return { status: "success", operation: "created" };
}

export async function updateCatalogueStock(
  _previousState: CatalogueActionState,
  formData: FormData,
): Promise<CatalogueActionState> {
  const locale = getLocale(formData);
  if (!locale) return { status: "error", reason: "invalid-input" };
  if (!(await hasDemoAccess())) return { status: "error", reason: "not-authorized" };

  const variantId = formData.get("variantId");
  const stock = formData.get("stock");
  if (
    typeof variantId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(variantId) ||
    typeof stock !== "string" ||
    !/^\d{1,6}$/.test(stock)
  ) {
    return { status: "error", reason: "invalid-input" };
  }

  const result = await updateDemoVariantStock(variantId, Number(stock));
  if (!result.ok) return { status: "error", reason: result.error };
  revalidatePath(`/${locale}/dashboard/products`);
  revalidatePath(`/${locale}/dashboard`);
  return { status: "success", operation: "stock-updated" };
}
