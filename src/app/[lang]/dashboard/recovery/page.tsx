import { Suspense } from "react";
import { SalesRecoveryWorkspace } from "@/components/pages/sales-recovery-workspace";
import { WorkspaceLoading } from "@/components/pages/workspace-loading";
import { requireDemoAccess } from "@/lib/demo-gate";
import { getSalesRecoverySettings, listSalesRecoveryOpportunities } from "@/lib/sales-recovery-store";
import { requireLocale } from "@/lib/i18n";

export default function SalesRecoveryPage({ params }: { params: Promise<{ lang: string }> }) {
  return <Suspense fallback={<WorkspaceLoading />}><ProtectedSalesRecovery params={params} /></Suspense>;
}

async function ProtectedSalesRecovery({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  await requireDemoAccess(locale, `/${locale}/dashboard/recovery`);
  const [settings, result] = await Promise.all([
    getSalesRecoverySettings(),
    listSalesRecoveryOpportunities(),
  ]);
  return (
    <SalesRecoveryWorkspace
      locale={locale}
      enabled={settings.ok && settings.enabled}
      merchantName={settings.ok ? settings.merchantName : null}
      opportunities={result.ok ? result.opportunities : []}
      error={settings.ok ? (result.ok ? null : result.error) : settings.error}
    />
  );
}
