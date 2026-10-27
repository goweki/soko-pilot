import { Suspense } from "react";
import { ProductsWorkspace } from "@/components/pages/products-workspace";
import { WorkspaceLoading } from "@/components/pages/workspace-loading";
import { listDemoCatalogue } from "@/lib/catalogue";
import { requireDemoAccess } from "@/lib/demo-gate";
import { requireLocale } from "@/lib/i18n";

export default function ProductsPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <ProtectedProducts params={params} />
    </Suspense>
  );
}

async function ProtectedProducts({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  await requireDemoAccess(locale, `/${locale}/dashboard/products`);

  const catalogue = await listDemoCatalogue();
  return <ProductsWorkspace locale={locale} result={catalogue} />;
}
