import { Suspense } from "react";
import { SignInClient } from "@/components/pages/sign-in-client";
import {
  isDemoGateConfigured,
  sanitizeGateDestination,
} from "@/lib/demo-gate";
import { requireLocale } from "@/lib/i18n";

export default function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const gateConfigured = isDemoGateConfigured();

  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInWithDestination
        gateConfigured={gateConfigured}
        params={params}
        searchParams={searchParams}
      />
    </Suspense>
  );
}

async function SignInWithDestination({
  gateConfigured,
  params,
  searchParams,
}: {
  gateConfigured: boolean;
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const [{ lang }, { next }] = await Promise.all([params, searchParams]);
  const locale = requireLocale(lang);

  return (
    <SignInClient
      locale={locale}
      nextPath={sanitizeGateDestination(typeof next === "string" ? next : null, locale)}
      gateConfigured={gateConfigured}
    />
  );
}

function SignInLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-5">
        <div
          aria-label="Loading demo access"
          className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
          role="status"
        />
      </div>
    </main>
  );
}
