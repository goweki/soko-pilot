import { Suspense } from "react";
import { SettingsClient } from "@/components/pages/page-placeholders";
import { WorkspaceLoading } from "@/components/pages/workspace-loading";
import { requireDemoAccess } from "@/lib/demo-gate";
import { getDemoReadiness } from "@/lib/demo-readiness";
import { getDemoAssistantConfig } from "@/lib/assistant-config";
import { requireLocale } from "@/lib/i18n";

export default function SettingsPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <ProtectedSettings params={params} />
    </Suspense>
  );
}

async function ProtectedSettings({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  await requireDemoAccess(locale, `/${locale}/settings?tab=assistant`);

  const readiness = await getDemoReadiness();
  const assistantConfig = await getDemoAssistantConfig();
  const appId = process.env.META_APP_ID?.trim() ?? "";
  const configId = process.env.META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() ?? "";
  const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() ?? "";
  const embeddedSignupConfig =
    appId && configId && /^v\d+\.\d+$/.test(graphVersion)
      ? { appId, configId, graphVersion }
      : null;
  return (
    <SettingsClient
      locale={locale}
      readiness={readiness}
      assistantConfig={assistantConfig}
      embeddedSignupConfig={embeddedSignupConfig}
    />
  );
}
