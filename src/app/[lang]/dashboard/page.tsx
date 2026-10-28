import { Suspense } from "react";
import { DashboardClient } from "@/components/pages/page-placeholders";
import { WorkspaceLoading } from "@/components/pages/workspace-loading";
import { requireDemoAccess } from "@/lib/demo-gate";
import { listDemoCatalogue } from "@/lib/catalogue";
import { listDemoConversations } from "@/lib/conversations";
import { requireLocale } from "@/lib/i18n";

export default function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <ProtectedDashboard params={params} />
    </Suspense>
  );
}

async function ProtectedDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  await requireDemoAccess(locale, `/${locale}/dashboard`);

  const [catalogue, inbox] = await Promise.all([
    listDemoCatalogue(),
    listDemoConversations(),
  ]);
  return (
    <DashboardClient
      locale={locale}
      name={null}
      snapshot={{
        workspaceName: catalogue.ok ? catalogue.merchantName : null,
        productCount: catalogue.ok ? catalogue.products.length : null,
        openConversationCount: inbox.ok
          ? inbox.conversations.filter(
              (conversation) => conversation.status !== "closed",
            ).length
          : null,
        handoffCount: inbox.ok
          ? inbox.conversations.filter(
              (conversation) => conversation.automationPaused,
            ).length
          : null,
        recentConversations: inbox.ok
          ? inbox.conversations.slice(0, 3).map((conversation) => ({
              id: conversation.id,
              customerName: conversation.customerName,
              latestMessage: conversation.latestMessage,
            }))
          : [],
      }}
    />
  );
}
