import { Suspense } from "react";
import type { ReactNode } from "react";
import { requireLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "sw" }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<div className="contents">{children}</div>}>
      <LocalizedContent params={params}>{children}</LocalizedContent>
    </Suspense>
  );
}

async function LocalizedContent({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = requireLocale(lang);

  return (
    <div lang={locale} className="contents">
      {children}
    </div>
  );
}
