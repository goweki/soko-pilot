"use client";

import { useActionState } from "react";
import {
  createCatalogueProduct,
  updateCatalogueStock,
  type CatalogueActionState,
} from "@/app/actions/catalogue";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/pages/page-placeholders";
import type { CatalogueProduct, CatalogueReadResult } from "@/lib/catalogue";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";

function ActionMessage({
  state,
  locale,
}: {
  state: CatalogueActionState;
  locale: Locale;
}) {
  if (!state) return null;
  const text = messages[locale];
  const message =
    state.status === "success"
      ? state.operation === "created"
        ? text.productCreated
        : text.stockUpdated
      : state.reason === "database-not-configured"
        ? text.databaseNotConfigured
        : state.reason === "merchant-not-seeded"
          ? text.demoDataNotSeeded
          : state.reason === "writes-not-approved"
            ? text.databaseWritesNotApproved
            : state.reason === "not-authorized"
              ? text.demoAccessExpired
              : state.reason === "not-found"
                ? text.productNotFound
                : state.reason === "invalid-input"
                  ? text.invalidProductInput
                  : text.storageUnavailable;

  return (
    <p
      className={`mt-3 rounded-xl px-3 py-2 text-sm ${
        state.status === "success"
          ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          : "bg-destructive/10 text-destructive"
      }`}
      role={state.status === "success" ? "status" : "alert"}
    >
      {message}
    </p>
  );
}

function StockEditor({
  product,
  variant,
  locale,
}: {
  product: CatalogueProduct;
  variant: CatalogueProduct["variants"][number];
  locale: Locale;
}) {
  const text = messages[locale];
  const [state, action, pending] = useActionState(updateCatalogueStock, null);

  return (
    <div>
      <form action={action} className="flex items-end gap-2">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="variantId" value={variant.id} />
        <label className="min-w-0 flex-1 text-xs text-muted-foreground">
          {text.stockQuantity}
          <input
            aria-label={`${text.stockQuantity}: ${product.name}`}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            defaultValue={variant.stockQuantity}
            min={0}
            max={999999}
            name="stock"
            required
            type="number"
          />
        </label>
        <Button disabled={pending} size="sm" type="submit">
          {pending ? text.saving : text.updateStock}
        </Button>
      </form>
      <ActionMessage state={state} locale={locale} />
    </div>
  );
}

function ProductCard({
  product,
  locale,
}: {
  product: CatalogueProduct;
  locale: Locale;
}) {
  const text = messages[locale];

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold tracking-tight">{product.name}</h2>
          {product.description && (
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              {product.description}
            </p>
          )}
          <span className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {product.status === "active"
              ? text.productActive
              : product.status === "draft"
                ? text.productDraft
                : text.productArchived}
          </span>
        </div>
        {product.category && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {product.category}
          </span>
        )}
      </div>
      {product.variants.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{text.noVariants}</p>
      ) : (
        <div className="mt-4 divide-y divide-border/70">
          {product.variants.map((variant) => {
            const available = variant.isActive && variant.stockQuantity > 0;
            const price = new Intl.NumberFormat(locale, {
              style: "currency",
              currency: variant.currency,
            }).format(variant.priceMinor / 100);

            return (
              <div
                key={variant.id}
                className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-sm font-medium">
                    {variant.label ?? text.defaultVariant}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[variant.size, variant.color]
                      .filter(Boolean)
                      .join(" · ") || text.noVariantDetails}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{price}</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      available
                        ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                        : "bg-amber-500/10 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {available ? text.inStock : text.outOfStock}
                    <span className="ml-1.5 font-normal">
                      ({variant.stockQuantity})
                    </span>
                  </span>
                </div>
                <StockEditor
                  product={product}
                  variant={variant}
                  locale={locale}
                />
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function ProductsWorkspace({
  locale,
  result,
}: {
  locale: Locale;
  result: CatalogueReadResult;
}) {
  const text = messages[locale];
  const [state, action, pending] = useActionState(createCatalogueProduct, null);
  const errorMessage = result.ok
    ? null
    : result.error === "database-not-configured"
      ? text.databaseNotConfigured
      : result.error === "merchant-not-seeded"
        ? text.demoDataNotSeeded
        : text.storageUnavailable;

  return (
    <DashboardShell
      locale={locale}
      section="products"
      title={text.products}
      description={text.productsDescription}
      workspaceName={result.ok ? result.merchantName : null}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight">
              {text.addProduct}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {text.addProductDescription}
            </p>
          </div>
          <form
            action={action}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <input type="hidden" name="locale" value={locale} />
            <label className="text-sm font-medium">
              {text.productName}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                maxLength={120}
                minLength={2}
                name="name"
                required
              />
            </label>
            <label className="text-sm font-medium">
              {text.category}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                maxLength={80}
                name="category"
              />
            </label>
            <label className="text-sm font-medium">
              {text.variantLabel}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                maxLength={80}
                name="label"
              />
            </label>
            <label className="text-sm font-medium">
              {text.size}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                maxLength={40}
                name="size"
              />
            </label>
            <label className="text-sm font-medium">
              {text.color}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                maxLength={60}
                name="color"
              />
            </label>
            <label className="text-sm font-medium">
              {text.price}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                inputMode="decimal"
                name="price"
                placeholder="0.00"
                required
                type="number"
                min="0"
                step="0.01"
              />
            </label>
            <label className="text-sm font-medium">
              {text.currency}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal uppercase"
                defaultValue="KES"
                maxLength={3}
                minLength={3}
                name="currency"
                required
              />
            </label>
            <label className="text-sm font-medium">
              {text.stockQuantity}
              <input
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                defaultValue={0}
                min={0}
                max={999999}
                name="stock"
                required
                type="number"
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2 lg:col-span-3">
              {text.description}
              <textarea
                className="mt-1.5 min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal"
                maxLength={1000}
                name="description"
              />
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button disabled={pending || !result.ok} type="submit">
                {pending ? text.saving : text.saveProduct}
              </Button>
              <ActionMessage state={state} locale={locale} />
            </div>
          </form>
        </section>

        <section aria-labelledby="catalogue-heading" className="space-y-4">
          <div>
            <h2
              id="catalogue-heading"
              className="text-lg font-semibold tracking-tight"
            >
              {text.catalogueProducts}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {text.catalogueSourceNote}
            </p>
          </div>
          {errorMessage ? (
            <p
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-amber-900 dark:text-amber-100"
              role="status"
            >
              {errorMessage}
            </p>
          ) : result.ok && result.products.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {result.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {text.noProductsYet}
            </p>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
