"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  MessageSquareText,
  Package,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
  WandSparkles,
} from "lucide-react";
import { lockDemoAccess } from "@/app/actions/demo-gate";
import {
  runAssistantPreview,
  setAssistantAutomation,
  saveAssistantInstructions,
  type AssistantActionState,
  type AssistantPreviewState,
} from "@/app/actions/assistant";
import { Button, buttonVariants } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/toggle-theme";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { DemoReadiness } from "@/lib/demo-readiness";
import type { DemoAssistantConfig } from "@/lib/assistant-config";
import type { CatalogueReadResult } from "@/lib/catalogue";
import { getPrivacyPolicyContent } from "@/lib/privacy-policy-content";
import { Navbar } from "../ui/navbar";
import {
  WhatsAppEmbeddedSignup,
  type EmbeddedSignupClientConfig,
} from "./whatsapp-embedded-signup";

export type DashboardSection =
  "dashboard" | "conversations" | "products" | "settings";
type PublicRoute = "home" | "privacy" | "recovery" | "sign-in";

function dashboardHref(locale: Locale, section: DashboardSection): string {
  if (section === "settings") {
    return `/${locale}/settings?tab=assistant`;
  }
  if (section === "dashboard") {
    return `/${locale}/dashboard`;
  }
  return `/${locale}/dashboard/${section}`;
}

function publicHref(locale: Locale, route: PublicRoute): string {
  if (route === "home") {
    return `/${locale}`;
  }
  return `/${locale}/${route === "recovery" ? "account-recovery" : route}`;
}

const navigation: {
  key: DashboardSection;
  icon: typeof LayoutDashboard;
  href: (locale: Locale) => string;
}[] = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    href: (locale) => `/${locale}/dashboard`,
  },
  {
    key: "conversations",
    icon: MessageSquareText,
    href: (locale) => `/${locale}/dashboard/conversations`,
  },
  {
    key: "products",
    icon: Package,
    href: (locale) => `/${locale}/dashboard/products`,
  },
  {
    key: "settings",
    icon: WandSparkles,
    href: (locale) => `/${locale}/settings?tab=assistant`,
  },
];

function ProductShell({
  locale,
  route = "home",
  children,
}: {
  locale: Locale;
  route?: PublicRoute;
  children: React.ReactNode;
}) {
  const text = messages[locale];

  return (
    <main lang={locale} className="min-h-screen overflow-hidden bg-background">
      <Navbar
        locale={locale}
        route={route}
        text={{
          brand: text.brand,
          navigationLabel: text.navigationLabel,
          switchToEnglish: text.switchToEnglish,
          switchToSwahili: text.switchToSwahili,
        }}
        publicHref={publicHref}
        cta={{ text: text.signIn, href: `/${locale}/sign-in` }}
      />

      {children}
    </main>
  );
}

export function DashboardShell({
  locale,
  section,
  title,
  description,
  workspaceName,
  children,
}: {
  locale: Locale;
  section: DashboardSection;
  title: string;
  description: string;
  workspaceName?: string | null;
  children: React.ReactNode;
}) {
  const text = messages[locale];

  return (
    <main lang={locale} className="min-h-screen bg-muted/35">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-border/70 bg-background px-5 py-6 md:flex">
          <Link
            className="group flex items-center gap-2.5 px-2"
            href={`/${locale}/dashboard`}
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-3">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {text.brand}
            </span>
          </Link>

          <div className="mt-9 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <Store className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {workspaceName || text.workspaceName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {text.workspaceType}
                </span>
              </span>
              <ArrowDownLeft
                className="size-4 rotate-[-45deg] text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/70 px-2.5 py-2 text-xs text-muted-foreground">
              <span
                className="size-1.5 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              {text.statusNotConnected}
            </div>
          </div>

          <nav aria-label={text.navigationLabel} className="mt-9">
            <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
              {text.navWorkspace}
            </p>
            <div className="mt-2 space-y-1">
              {navigation.slice(0, 3).map(({ key, icon: Icon, href }) => {
                const active = section === key;
                return (
                  <Link
                    key={key}
                    href={href(locale)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary dark:bg-primary/15"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] transition-transform group-hover:scale-105",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    {text[key]}
                  </Link>
                );
              })}
            </div>
            <p className="mt-8 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
              {text.navManage}
            </p>
            <div className="mt-2">
              {navigation.slice(3).map(({ key, icon: Icon, href }) => {
                const active = section === key;
                return (
                  <Link
                    key={key}
                    href={href(locale)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary dark:bg-primary/15"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] transition-transform group-hover:scale-105",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    {text[key]}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-[18px]" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold">{text.previewBadge}</p>

            <Link
              href={`/${locale}/privacy`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {text.privacy}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  className="flex items-center gap-2 md:hidden"
                  href={`/${locale}/dashboard`}
                  aria-label={text.brand}
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Store className="size-4" aria-hidden="true" />
                  </span>
                </Link>
                <div className="hidden size-9 place-items-center rounded-xl bg-muted sm:grid">
                  {section === "dashboard" && (
                    <LayoutDashboard className="size-4 text-muted-foreground" />
                  )}
                  {section === "conversations" && (
                    <MessageSquareText className="size-4 text-muted-foreground" />
                  )}
                  {section === "products" && (
                    <Package className="size-4 text-muted-foreground" />
                  )}
                  {section === "settings" && (
                    <WandSparkles className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{title}</p>
                  <p className="hidden truncate text-xs text-muted-foreground sm:block">
                    {workspaceName || text.workspaceName}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <nav
                  aria-label={text.navigationLabel}
                  className="flex items-center gap-0.5"
                >
                  <Link
                    href={dashboardHref("en", section)}
                    lang="en"
                    aria-label={text.switchToEnglish}
                    aria-current={locale === "en" ? "page" : undefined}
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-xs transition-colors hover:bg-muted",
                      locale === "en"
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    EN
                  </Link>
                  <Link
                    href={dashboardHref("sw", section)}
                    lang="sw"
                    aria-label={text.switchToSwahili}
                    aria-current={locale === "sw" ? "page" : undefined}
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-xs transition-colors hover:bg-muted",
                      locale === "sw"
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    SW
                  </Link>
                </nav>
                <span className="hidden items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 sm:inline-flex">
                  <span
                    className="size-1.5 rounded-full bg-amber-500"
                    aria-hidden="true"
                  />
                  {text.previewBadge}
                </span>
                <ThemeToggle locale={locale} variant="ghost" />
                <form action={lockDemoAccess}>
                  <input type="hidden" name="locale" value={locale} />
                  <Button
                    aria-label={text.signOut}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <LockKeyhole aria-hidden="true" />
                    <span className="hidden sm:inline">{text.signOut}</span>
                  </Button>
                </form>
              </div>
            </div>
            <nav
              aria-label={text.mobileMenuLabel}
              className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden"
            >
              {navigation.map(({ key, icon: Icon, href }) => {
                const active = section === key;
                return (
                  <Link
                    key={key}
                    href={href(locale)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {text[key]}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="mb-8 max-w-3xl">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">
                {section === "dashboard"
                  ? text.overviewEyebrow
                  : text.previewBadge}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                {description}
              </p>
            </div>
            {children}
            <footer className="mt-10 flex flex-col gap-2 border-t border-border/70 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/${locale}/privacy`}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                {text.privacy}
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
          —
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </article>
  );
}

function EmptyState({
  icon: Icon,
  label,
  title,
  description,
  action,
  href,
}: {
  icon: typeof MessageCircle;
  label: string;
  title: string;
  description: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-5 text-[10px] font-semibold tracking-[0.16em] text-primary">
        {label}
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && href && (
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-5 rounded-full",
          )}
        >
          {action}
          <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function ProductStoryClient({
  locale,
  catalogue,
}: {
  locale: Locale;
  catalogue: CatalogueReadResult;
}) {
  const text = messages[locale];
  const previewProducts = catalogue.ok
    ? catalogue.products
        .filter((product) => product.status === "active")
        .slice(0, 3)
    : [];

  console.log(catalogue);

  return (
    <ProductShell locale={locale} route="privacy">
      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:pb-28">
        <div
          className="absolute -left-40 top-16 -z-0 size-80 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-2 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {text.previewBadge}
          </span>
          <h1 className="mt-7 max-w-2xl font-heading text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.5rem]">
            {text.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {text.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/sign-in`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full px-6",
              )}
            >
              {text.getStarted}
              <ArrowRight aria-hidden="true" />
            </Link>
            <a
              href="#how-it-helps"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full px-6",
              )}
            >
              {text.learnMore}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">
            {[
              text.featureGrounded,
              text.featureControl,
              text.featureBilingual,
            ].map((feature) => (
              <span key={feature} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-primary" aria-hidden="true" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[480px]">
          <div
            className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-transparent to-amber-300/20 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-2xl shadow-foreground/[0.08]">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {text.catalogueProducts}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {text.catalogueSourceNote}
                  </p>
                </div>
              </div>
              {catalogue.ok && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  {previewProducts.length}
                </span>
              )}
            </div>
            <div className="min-h-56 space-y-3 bg-muted/35 px-5 py-5 sm:px-7">
              {catalogue.ok && previewProducts.length > 0 ? (
                previewProducts.map((product) => {
                  const variant = product.variants.find(
                    (item) => item.isActive,
                  );
                  return (
                    <div
                      key={product.id}
                      className="rounded-xl border border-border/70 bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold">
                            {product.name}
                          </h3>
                          {product.category && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {product.category}
                            </p>
                          )}
                        </div>
                        {variant && (
                          <span className="text-sm font-semibold">
                            {new Intl.NumberFormat(locale, {
                              style: "currency",
                              currency: variant.currency,
                            }).format(variant.priceMinor / 100)}
                          </span>
                        )}
                      </div>
                      {variant && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {[variant.label, variant.size, variant.color]
                            .filter(Boolean)
                            .join(" · ")}{" "}
                          ·{" "}
                          {variant.stockQuantity > 0
                            ? text.inStock
                            : text.outOfStock}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  {catalogue.ok
                    ? text.noProductsYet
                    : text.catalogueUnavailable}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border/70 px-5 py-4">
              <p className="text-[10px] leading-4 text-muted-foreground">
                {text.catalogueSourceNote}
              </p>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <ShieldCheck
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                {text.featureControl}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-helps"
        className="border-y border-border/60 bg-muted/35"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:py-20">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">
              {text.featureLabel}
            </p>
            <h2 className="mt-3 max-w-md font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
              {text.featureTitle}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              {text.featureBody}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Package, title: text.featureGrounded },
              { icon: ShieldCheck, title: text.featureControl },
              { icon: MessageCircle, title: text.featureBilingual },
            ].map(({ icon: Icon, title }, index) => (
              <article
                key={title}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-transform hover:-translate-y-1"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-8 text-2xl font-semibold text-muted-foreground/50">
                  0{index + 1}
                </p>
                <h3 className="mt-2 text-sm font-semibold leading-5">
                  {title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span>{text.footerTagline}</span>
        <nav className="flex items-center gap-5">
          <Link className="hover:text-foreground" href={`/${locale}/privacy`}>
            {text.privacy}
          </Link>
          <Link
            className="hover:text-foreground"
            href={`/${locale}/account-recovery`}
          >
            {text.recovery}
          </Link>
        </nav>
      </footer>
    </ProductShell>
  );
}

export function DashboardClient({
  locale,
  name,
  snapshot,
}: {
  locale: Locale;
  name: string | null;
  snapshot: {
    productCount: number | null;
    workspaceName: string | null;
    openConversationCount: number | null;
    handoffCount: number | null;
    recentConversations: {
      id: string;
      customerName: string | null;
      latestMessage: string | null;
    }[];
  };
}) {
  const text = messages[locale];
  const title = name ? `${text.welcome}, ${name}` : text.overviewTitle;

  return (
    <DashboardShell
      locale={locale}
      section="dashboard"
      title={title}
      description={text.overviewIntro}
      workspaceName={snapshot.workspaceName}
    >
      <section
        aria-label={text.overviewEyebrow}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          icon={MessageCircle}
          label={text.metricConversations}
          value={
            snapshot.openConversationCount === null
              ? text.noData
              : String(snapshot.openConversationCount)
          }
          hint={
            snapshot.openConversationCount === null
              ? text.metricUnavailable
              : text.currentRecords
          }
        />
        <MetricCard
          icon={Package}
          label={text.metricProducts}
          value={
            snapshot.productCount === null
              ? text.noData
              : String(snapshot.productCount)
          }
          hint={
            snapshot.productCount === null
              ? text.metricUnavailable
              : text.currentRecords
          }
        />
        <MetricCard
          icon={Clock3}
          label={text.metricResponse}
          value={text.noData}
          hint={text.metricUnavailable}
        />
        <MetricCard
          icon={ArrowUpRight}
          label={text.metricResolution}
          value={
            snapshot.handoffCount === null
              ? text.noData
              : String(snapshot.handoffCount)
          }
          hint={
            snapshot.handoffCount === null
              ? text.metricUnavailable
              : text.currentRecords
          }
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold">{text.activityTitle}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {text.conversationsDescription}
              </p>
            </div>
            <Link
              href={`/${locale}/dashboard/conversations`}
              aria-label={text.conversations}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "rounded-full",
              )}
            >
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="p-5 sm:p-6">
            {snapshot.recentConversations.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {snapshot.recentConversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      className="block rounded-xl px-2 py-4 first:pt-0 hover:bg-muted/50"
                      href={`/${locale}/dashboard/conversations`}
                    >
                      <p className="text-sm font-medium">
                        {conversation.customerName ?? text.customer}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {conversation.latestMessage ??
                          text.noConversationMessages}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={MessageCircle}
                label={text.connectedChannel}
                title={text.activityEmptyTitle}
                description={text.activityEmpty}
                action={text.connectWhatsApp}
                href={`/${locale}/settings?tab=assistant`}
              />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">
                {text.quickActionsTitle}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {text.previewBadge}
              </p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-border/70">
            <Link
              href={`/${locale}/dashboard/products`}
              className="group flex gap-3 py-4 first:pt-0"
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Package className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {text.quickActionProducts}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {text.quickActionProductsBody}
                </span>
              </span>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
            <Link
              href={`/${locale}/settings?tab=assistant`}
              className="group flex gap-3 py-4 last:pb-0"
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <WandSparkles className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {text.quickActionAssistant}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {text.quickActionAssistantBody}
                </span>
              </span>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}

export function ConversationsClient({ locale }: { locale: Locale }) {
  const text = messages[locale];
  return (
    <DashboardShell
      locale={locale}
      section="conversations"
      title={text.conversations}
      description={text.conversationsDescription}
    >
      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
        <EmptyState
          icon={MessageCircle}
          label={text.conversationEmptyLabel}
          title={text.conversationEmptyTitle}
          description={text.conversationEmptyBody}
          action={text.connectWhatsApp}
          href={`/${locale}/settings?tab=assistant`}
        />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {text.conversationEmptyHint}
        </p>
      </section>
    </DashboardShell>
  );
}

export function ProductsClient({ locale }: { locale: Locale }) {
  const text = messages[locale];
  return (
    <DashboardShell
      locale={locale}
      section="products"
      title={text.products}
      description={text.productsDescription}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">{text.productsEmptyLabel}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" disabled>
          <Plus aria-hidden="true" />
          {text.viewCatalogue}
        </Button>
      </div>
      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
        <EmptyState
          icon={Package}
          label={text.catalogueStatus}
          title={text.noProductsYet}
          description={text.noProductsBody}
          action={text.configureAssistant}
          href={`/${locale}/settings?tab=assistant`}
        />
      </section>
    </DashboardShell>
  );
}

export function SettingsClient({
  locale,
  readiness,
  assistantConfig,
  embeddedSignupConfig,
}: {
  locale: Locale;
  readiness: DemoReadiness;
  assistantConfig: DemoAssistantConfig;
  embeddedSignupConfig: EmbeddedSignupClientConfig | null;
}) {
  const text = messages[locale];
  const [assistantActionState, assistantAction, assistantPending] =
    useActionState(setAssistantAutomation, null);
  const [instructionsState, instructionsAction, instructionsPending] =
    useActionState(saveAssistantInstructions, null);
  const [previewState, previewAction, previewPending] = useActionState(
    runAssistantPreview,
    null,
  );
  const [shopInstructionsDraft, setShopInstructionsDraft] = useState(
    assistantConfig.ok ? (assistantConfig.systemInstructions ?? "") : "",
  );
  const setupItems = [
    {
      icon: MessageCircle,
      title: text.setupChannelTitle,
      body: text.setupChannelBody,
      configured: readiness.whatsapp,
    },
    {
      icon: Sparkles,
      title: text.setupModelTitle,
      body: text.setupModelBody,
      configured: readiness.metaModel,
    },
    {
      icon: ShieldCheck,
      title: text.setupSafetyTitle,
      body: text.setupSafetyBody,
      configured: readiness.demoGate,
    },
  ];

  return (
    <DashboardShell
      locale={locale}
      section="settings"
      title={text.settings}
      description={text.setupIntro}
      workspaceName={assistantConfig.ok ? assistantConfig.merchantName : null}
    >
      <section className="mb-6 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-primary">
              <Sparkles className="size-3" aria-hidden="true" />
              {text.previewBadge}
            </span>
            <h2 className="mt-3 font-heading text-2xl leading-tight tracking-tight sm:text-3xl">
              {text.setupTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {text.settingsDescription}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-amber-500/20 bg-background/80 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-200 sm:self-center">
            <span
              className="size-2 rounded-full bg-amber-500"
              aria-hidden="true"
            />
            {readiness.whatsapp ? text.configured : text.notConfigured}
          </div>
        </div>
      </section>
      <section
        aria-label={text.navManage}
        className="grid gap-4 lg:grid-cols-3"
      >
        {setupItems.map(({ icon: Icon, title, body, configured }) => (
          <article
            key={title}
            className="flex min-h-[220px] flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                {configured ? text.configured : text.notConfigured}
              </span>
            </div>
            <h3 className="mt-5 text-sm font-semibold">{title}</h3>
            <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">
              {body}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
              <span className="text-[10px] text-muted-foreground">
                {configured ? text.configured : text.setupNotConfigured}
              </span>
              <ArrowUpRight
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </article>
        ))}
      </section>
      <WhatsAppEmbeddedSignup
        locale={locale}
        config={embeddedSignupConfig}
        connectedNumbers={readiness.connectedWhatsAppNumbers}
      />
      <section className="mt-5 rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 className="text-sm font-semibold">{text.assistantConfiguration}</h2>
        {assistantConfig.ok ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <p className="rounded-xl bg-background px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                {text.assistantStatus}:{" "}
              </span>
              {assistantConfig.isActive
                ? text.assistantEnabled
                : text.assistantDisabled}
            </p>
            <p className="rounded-xl bg-background px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                {text.modelIdentifier}:{" "}
              </span>
              {assistantConfig.modelName}
            </p>
            <p className="rounded-xl bg-background px-3 py-2 text-xs sm:col-span-2">
              <span className="text-muted-foreground">
                {text.enabledTools}:{" "}
              </span>
              {assistantConfig.tools
                .filter((tool) => tool.enabled)
                .map((tool) => tool.name)
                .join(", ") || "—"}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            {assistantConfig.error === "database-not-configured"
              ? text.databaseNotConfigured
              : assistantConfig.error === "merchant-not-seeded"
                ? text.demoDataNotSeeded
                : text.storageUnavailable}
          </p>
        )}
        {assistantConfig.ok && (
          <form action={assistantAction} className="mt-4">
            <input type="hidden" name="locale" value={locale} />
            <input
              type="hidden"
              name="operation"
              value={assistantConfig.isActive ? "pause" : "enable"}
            />
            <Button
              disabled={
                assistantPending ||
                (!assistantConfig.isActive &&
                  (!readiness.metaModel || !readiness.whatsapp))
              }
              size="sm"
              type="submit"
            >
              {assistantPending
                ? text.saving
                : assistantConfig.isActive
                  ? text.pauseAssistant
                  : text.enableAssistant}
            </Button>
          </form>
        )}
        {assistantActionState && (
          <p
            className={`mt-3 text-xs leading-5 ${assistantActionState.status === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"}`}
            role={
              assistantActionState.status === "success" ? "status" : "alert"
            }
          >
            {getAssistantActionMessage(assistantActionState, locale)}
          </p>
        )}
        <p className="mt-3 text-xs leading-5 text-amber-800 dark:text-amber-200">
          {!readiness.metaModel
            ? text.modelPathUnavailable
            : assistantConfig.ok && assistantConfig.isActive
              ? text.assistantAutomationLive
              : text.assistantAutomationPaused}
        </p>
      </section>
      <section className="mt-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold">
            {text.shopAssistantInstructions}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {text.shopAssistantInstructionsDescription}
          </p>
        </div>
        {assistantConfig.ok ? (
          <form action={instructionsAction} className="mt-5">
            <input type="hidden" name="locale" value={locale} />
            <label
              className="block text-sm font-medium"
              htmlFor="shop-instructions"
            >
              {text.shopAssistantInstructionsLabel}
            </label>
            <textarea
              id="shop-instructions"
              className="mt-2 min-h-36 w-full max-w-3xl resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-6"
              onChange={(event) => setShopInstructionsDraft(event.target.value)}
              value={shopInstructionsDraft}
              maxLength={2000}
              name="systemInstructions"
              placeholder={text.shopAssistantInstructionsPlaceholder}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {text.shopAssistantInstructionsHint}
            </p>
            <Button
              className="mt-4"
              disabled={instructionsPending}
              size="sm"
              type="submit"
            >
              {instructionsPending ? text.saving : text.saveShopInstructions}
            </Button>
            {instructionsState && (
              <p
                className={`mt-3 text-xs leading-5 ${instructionsState.status === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"}`}
                role={
                  instructionsState.status === "success" ? "status" : "alert"
                }
              >
                {getAssistantActionMessage(instructionsState, locale)}
              </p>
            )}
          </form>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            {assistantConfig.error === "database-not-configured"
              ? text.databaseNotConfigured
              : assistantConfig.error === "merchant-not-seeded"
                ? text.demoDataNotSeeded
                : text.storageUnavailable}
          </p>
        )}
      </section>
      <section className="mt-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold">{text.testAssistant}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {text.testAssistantDescription}
          </p>
        </div>
        {assistantConfig.ok ? (
          <form action={previewAction} className="mt-5 max-w-3xl">
            <input type="hidden" name="locale" value={locale} />
            <input
              type="hidden"
              name="systemInstructions"
              value={shopInstructionsDraft}
            />
            <label
              className="block text-sm font-medium"
              htmlFor="assistant-test-message"
            >
              {text.testAssistantMessageLabel}
            </label>
            <textarea
              id="assistant-test-message"
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-6"
              maxLength={1000}
              name="customerMessage"
              placeholder={text.testAssistantMessagePlaceholder}
              required
            />
            <Button
              className="mt-4"
              disabled={previewPending}
              size="sm"
              type="submit"
            >
              {previewPending ? text.testingAssistant : text.runAssistantTest}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            {assistantConfig.error === "database-not-configured"
              ? text.databaseNotConfigured
              : assistantConfig.error === "merchant-not-seeded"
                ? text.demoDataNotSeeded
                : text.storageUnavailable}
          </p>
        )}
        {previewState?.status === "success" && (
          <div className="mt-5 max-w-3xl rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {text.assistantTestReply}
              </h3>
              {previewState.handedOff && (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-200">
                  {text.assistantTestHandoff}
                </span>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
              {previewState.reply || text.assistantTestHandoffOnly}
            </p>
          </div>
        )}
        {previewState?.status === "error" && (
          <div
            className="mt-5 max-w-3xl rounded-xl border border-destructive/20 bg-destructive/5 p-4"
            role="alert"
          >
            <p className="text-sm font-semibold text-destructive">
              {getAssistantPreviewMessage(previewState, locale).title}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-foreground/80">
              {getAssistantPreviewMessage(previewState, locale).description}
            </p>
          </div>
        )}
      </section>
      <section className="mt-5 rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 className="text-sm font-semibold">{text.demoReadiness}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            { label: text.databaseSetupNeeded, configured: readiness.database },
            { label: text.webhookSetupNeeded, configured: readiness.whatsapp },
            { label: text.modelSetupNeeded, configured: readiness.metaModel },
            { label: text.securityNote, configured: readiness.demoGate },
          ].map(({ label, configured }) => (
            <p
              className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2 text-xs"
              key={label}
            >
              <span className="text-muted-foreground">{label}</span>
              <span
                className={
                  configured
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300"
                }
              >
                {configured ? text.configured : text.notConfigured}
              </span>
            </p>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {text.setupBlockerNote}
        </p>
      </section>
    </DashboardShell>
  );
}

function getAssistantActionMessage(
  state: AssistantActionState,
  locale: Locale,
) {
  if (!state) return "";
  const text = messages[locale];
  if (state.status === "success") return text.assistantAutomationUpdated;
  switch (state.reason) {
    case "not-authorized":
      return text.demoAccessExpired;
    case "writes-not-approved":
      return text.databaseWritesNotApproved;
    case "database-not-configured":
      return text.databaseNotConfigured;
    case "model-not-configured":
      return text.modelPathUnavailable;
    case "whatsapp-not-configured":
      return text.whatsappReplyNotConfigured;
    case "assistant-not-seeded":
      return text.demoDataNotSeeded;
    case "invalid-input":
      return text.invalidShopAssistantInstructions;
    case "catalogue-search-required":
      return text.assistantCatalogueToolRequired;
    case "write-tools-must-stay-disabled":
      return text.assistantWriteToolsDisabled;
    default:
      return text.storageUnavailable;
  }
}

function getAssistantPreviewMessage(
  state: Extract<Exclude<AssistantPreviewState, null>, { status: "error" }>,
  locale: Locale,
) {
  const text = messages[locale];
  const description = (() => {
    switch (state.reason) {
      case "invalid-input":
        return text.invalidAssistantTestMessage;
      case "not-authorized":
        return text.demoAccessExpired;
      case "database-not-configured":
        return text.databaseNotConfigured;
      case "assistant-not-seeded":
        return text.demoDataNotSeeded;
      case "model-not-configured":
        return text.modelPathUnavailable;
      case "catalogue-unavailable":
        return text.assistantTestCatalogueUnavailable;
      case "response-too-long":
        return text.assistantTestOutputLimit;
      case "model-unavailable":
        return text.assistantTestModelUnavailable;
      case "model-credentials-rejected":
        return text.assistantTestCredentialsRejected;
      case "model-rate-limited":
        return text.assistantTestRateLimited;
      case "model-invalid-response":
        return text.assistantTestInvalidModelResponse;
      case "assistant-tool-issue":
        return text.assistantTestToolIssue;
      case "preview-failed":
        return text.assistantTestUnexpected;
    }
  })();

  return {
    title: text.assistantTestErrorTitle,
    description,
  };
}

export function PrivacyClient({ locale }: { locale: Locale }) {
  const policy = getPrivacyPolicyContent(locale);

  return (
    <ProductShell locale={locale} route="privacy">
      <article className="mx-auto w-full max-w-4xl flex-1 px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-7 text-sm font-medium text-muted-foreground">
          {policy.updatedLabel}: October 27, 2026
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
          {policy.title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">
          {policy.introduction}
        </p>
        <div className="mt-12 space-y-10">
          {policy.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="font-heading text-2xl tracking-tight">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-7 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc space-y-2 pl-6 text-sm leading-7 text-muted-foreground">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-2xl border border-border/70 bg-muted/40 p-5 text-xs leading-6 text-muted-foreground">
          {policy.draftNotice}
        </p>
      </article>
    </ProductShell>
  );
}

export function AccountRecoveryClient({ locale }: { locale: Locale }) {
  const text = messages[locale];
  return (
    <ProductShell locale={locale}>
      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-2xl rounded-[1.75rem] border border-border/70 bg-card p-7 shadow-lg shadow-foreground/[0.04] sm:p-10">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CircleHelp className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-7 text-[10px] font-semibold tracking-[0.18em] text-primary">
            {text.recovery}
          </p>
          <h1 className="mt-3 font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
            {text.recoveryTitle}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {text.recoveryAction}
          </p>
          <p className="mt-5 rounded-xl bg-muted/60 p-4 text-xs leading-5 text-muted-foreground">
            {text.recoveryDescription}
          </p>
          <Link
            href={`/${locale}/sign-in`}
            className={cn(buttonVariants(), "mt-6 rounded-full px-5")}
          >
            {text.signIn}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
      <footer className="mx-auto w-full max-w-7xl px-5 py-6 text-xs text-muted-foreground sm:px-8 lg:px-12">
        {text.footerTagline}
      </footer>
    </ProductShell>
  );
}
