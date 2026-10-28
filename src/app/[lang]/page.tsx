import { Suspense } from "react";
import { io } from "next/cache";
import { ProductStoryClient } from "@/components/pages/page-placeholders";
import { requireLocale } from "@/lib/i18n";
import { listDemoCatalogue } from "@/lib/catalogue";

export default function ProductStoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductStoryContent params={params} />
    </Suspense>
  );
}

async function ProductStoryContent({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  await io();
  const catalogue = await listDemoCatalogue();
  return <ProductStoryClient locale={locale} catalogue={catalogue} />;
}
