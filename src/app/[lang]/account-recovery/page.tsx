import { AccountRecoveryClient } from "@/components/pages/page-placeholders";
import { requireLocale } from "@/lib/i18n";

export default async function AccountRecoveryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AccountRecoveryClient locale={requireLocale(lang)} />;
}
