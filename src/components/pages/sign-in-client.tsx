"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { unlockDemoAccess } from "@/app/actions/demo-gate";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";
import { Navbar } from "../ui/navbar";

export function SignInClient({
  locale,
  nextPath,
  gateConfigured,
}: {
  locale: Locale;
  nextPath: string;
  gateConfigured: boolean;
}) {
  const text = messages[locale];
  const [state, action, pending] = useActionState(unlockDemoAccess, null);

  const signInHref = (target: Locale) => {
    const targetPath = nextPath.startsWith(`/${locale}/`)
      ? `/${target}${nextPath.slice(locale.length + 1)}`
      : `/${target}/dashboard`;
    return `/${target}/sign-in?next=${encodeURIComponent(targetPath)}`;
  };

  return (
    <main lang={locale} className="min-h-screen bg-background">
      <Navbar
        locale={locale}
        route="sign-in"
        text={{
          brand: text.brand,
          navigationLabel: text.navigationLabel,
          switchToEnglish: text.switchToEnglish,
          switchToSwahili: text.switchToSwahili,
        }}
        publicHref={(lang) => signInHref(lang as Locale)}
      />

      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-12 px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:gap-20 lg:px-12 lg:pb-20">
        <section className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden rounded-[2rem] bg-primary p-9 text-primary-foreground shadow-xl shadow-primary/10 lg:flex xl:p-12">
          <div
            className="absolute -right-24 -top-20 size-80 rounded-full border border-primary-foreground/10"
            aria-hidden="true"
          />
          <div
            className="absolute -right-8 -top-4 size-48 rounded-full border border-primary-foreground/10"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-28 -left-20 size-72 rounded-full bg-primary-foreground/[0.06] blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-2 text-[10px] font-semibold tracking-[0.16em]">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {text.previewBadge}
            </span>
            <h1 className="mt-8 max-w-lg font-heading text-4xl leading-tight tracking-tight xl:text-5xl">
              {text.tagline}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-primary-foreground/75">
              {text.intro}
            </p>
          </div>

          <div className="relative rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.08] p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary-foreground/15">
                <KeyRound className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">{text.demoWorkspace}</p>
                <p className="mt-0.5 text-xs text-primary-foreground/65">
                  {text.securityNote}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {text.brand}
          </Link>
          <div className="mt-6 rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-xl shadow-foreground/[0.04] sm:p-8">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-6 text-[10px] font-semibold tracking-[0.18em] text-primary">
              {text.previewBadge}
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight">
              {text.signInTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {text.signInDescription}
            </p>

            <form action={action} className="mt-7 space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={nextPath} />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="accessCode">
                  {text.accessCode}
                </label>
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!gateConfigured || pending}
                  id="accessCode"
                  name="accessCode"
                  placeholder="••••••••••••"
                  required
                  type="password"
                />
              </div>
              <Button
                className="h-12 w-full rounded-xl"
                disabled={!gateConfigured || pending}
                type="submit"
              >
                {pending ? text.checkingCode : text.enterDemo}
                <ArrowRight aria-hidden="true" />
              </Button>
            </form>

            {!gateConfigured && (
              <p
                className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-5 text-destructive"
                role="status"
              >
                {text.gateNotConfigured}
              </p>
            )}
            {state?.error === "not-configured" && (
              <p
                className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-5 text-destructive"
                role="alert"
              >
                {text.gateNotConfigured}
              </p>
            )}
            {state?.error === "invalid-code" && (
              <p
                className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-5 text-destructive"
                role="alert"
              >
                {text.invalidCode}
              </p>
            )}

            <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-muted/60 p-3.5">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                {text.securityNote}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
