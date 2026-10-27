import { Suspense } from "react";
import { ConversationsWorkspace } from "@/components/pages/conversations-workspace";
import { WorkspaceLoading } from "@/components/pages/workspace-loading";
import { listDemoConversations } from "@/lib/conversations";
import { requireDemoAccess } from "@/lib/demo-gate";
import { requireLocale } from "@/lib/i18n";

export default function ConversationsPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <ProtectedConversations params={params} />
    </Suspense>
  );
}

async function ProtectedConversations({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  await requireDemoAccess(locale, `/${locale}/dashboard/conversations`);

  const conversations = await listDemoConversations();
  return <ConversationsWorkspace locale={locale} result={conversations} />;
}
