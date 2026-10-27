import { PrivacyClient } from "@/components/pages/page-placeholders";
import { requireLocale } from "@/lib/i18n";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PrivacyClient locale={requireLocale(lang)} />;
}
