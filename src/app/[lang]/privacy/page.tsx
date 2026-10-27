import { Suspense } from "react";
import { PrivacyClient } from "@/components/pages/page-placeholders";
import { requireLocale } from "@/lib/i18n";

export default function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PrivacyPageContent params={params} />
    </Suspense>
  );
}

async function PrivacyPageContent({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PrivacyClient locale={requireLocale(lang)} />;
}
