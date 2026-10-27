import { Suspense } from "react";
import { ProductStoryClient } from "@/components/pages/page-placeholders";
import { requireLocale } from "@/lib/i18n";

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
  return <ProductStoryClient locale={requireLocale(lang)} />;
}
