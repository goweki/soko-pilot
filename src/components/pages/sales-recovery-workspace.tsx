"use client";

import { useActionState } from "react";
import {
  dismissRecoveryOpportunity,
  sendApprovedRecoveryMessage,
  setSalesRecoveryAutomation,
  type SalesRecoveryActionState,
} from "@/app/actions/sales-recovery";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/pages/page-placeholders";
import type { Locale } from "@/lib/i18n";

type Opportunity = {
  id: string;
  customerName: string | null;
  reason: string;
  evidence: string;
  suggestedMessage: string;
  status: string;
  failureCode: string | null;
  createdAt: string;
};

const translations = {
  en: {
    title: "Sales recovery",
    description: "Review eligible stalled conversations and approve each follow-up before it is sent.",
    enabled: "Sales recovery is enabled. Messages still require your approval.",
    paused: "Sales recovery is paused.",
    enable: "Enable detection",
    pause: "Pause detection",
    empty: "No recovery opportunities yet.",
    evidence: "Conversation evidence",
    suggestion: "Suggested message (edit before sending)",
    approve: "Approve and send",
    dismiss: "Dismiss",
    sent: "Sent",
    pending: "Needs review",
    failed: "Send failed",
    dismissed: "Dismissed",
    approved: "Sending",
    rejected: "Rejected",
    unknown: "Unknown",
    notConfigured: "Configure database and WhatsApp before sending.",
    noLongerEligible: "This opportunity is no longer eligible to send.",
    sendFailed: "WhatsApp did not confirm the send. This item is locked to prevent duplicate sends.",
    error: "The action failed. Refresh and check the opportunity status.",
  },
  sw: {
    title: "Urejeshaji wa mauzo",
    description: "Kagua mazungumzo yaliyosimama na uidhinishe kila ujumbe kabla ya kutumwa.",
    enabled: "Urejeshaji wa mauzo umewashwa. Ujumbe bado unahitaji idhini yako.",
    paused: "Urejeshaji wa mauzo umesitishwa.",
    enable: "Washa utambuzi",
    pause: "Sitisha utambuzi",
    empty: "Bado hakuna fursa za urejeshaji.",
    evidence: "Ushahidi wa mazungumzo",
    suggestion: "Ujumbe unaopendekezwa (hariri kabla ya kutuma)",
    approve: "Idhinisha na utume",
    dismiss: "Ondoa",
    sent: "Umetumwa",
    pending: "Unahitaji ukaguzi",
    failed: "Imeshindwa kutuma",
    dismissed: "Imeondolewa",
    approved: "Inatuma",
    rejected: "Imekataliwa",
    unknown: "Haijulikani",
    notConfigured: "Sanidi hifadhidata na WhatsApp kabla ya kutuma.",
    noLongerEligible: "Fursa hii haifai tena kutumwa.",
    sendFailed: "WhatsApp haijathibitisha utumaji. Fursa imefungwa ili kuzuia ujumbe kurudiwa.",
    error: "Hatua imeshindwa. Onyesha upya na ukague hali ya fursa.",
  },
} as const;

function actionMessage(state: SalesRecoveryActionState, locale: Locale, t: (typeof translations)[Locale]) {
  if (!state) return null;
  if (state.status === "success") return state.operation === "sent" ? t.sent : state.operation === "dismissed" ? t.dismissed : state.operation === "enabled" ? t.enabled : t.paused;
  if (state.reason === "not-configured" || state.reason === "database-not-configured") return t.notConfigured;
  if (state.reason === "no-longer-eligible") return t.noLongerEligible;
  if (state.reason === "send-failed" || state.reason === "persist-failed") return t.sendFailed;
  return t.error;
}

function OpportunityCard({ opportunity, locale, t }: { opportunity: Opportunity; locale: Locale; t: (typeof translations)[Locale] }) {
  const [state, action, pending] = useActionState(sendApprovedRecoveryMessage, null);
  const [dismissState, dismissAction, dismissPending] = useActionState(dismissRecoveryOpportunity, null);
  const dismissFeedback = actionMessage(dismissState, locale, t);
  const feedback = actionMessage(state, locale, t);
  const reason = opportunity.reason.replaceAll("_", " ");
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">{opportunity.customerName ?? "Customer"}</h2>
          <p className="mt-1 text-xs capitalize text-muted-foreground">{reason} · {new Date(opportunity.createdAt).toLocaleString(locale)}</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{opportunity.status.replaceAll("_", " ")}</span>
      </div>
      <div className="mt-4 rounded-xl bg-muted/50 p-3">
        <p className="text-xs font-medium">{t.evidence}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">{opportunity.evidence}</p>
      </div>
      {opportunity.status === "pending" && (
        <form action={action} className="mt-4 space-y-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <label className="block text-xs font-medium" htmlFor={`recovery-${opportunity.id}`}>{t.suggestion}</label>
          <textarea id={`recovery-${opportunity.id}`} name="body" defaultValue={opportunity.suggestedMessage} maxLength={4096} required className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <Button type="submit" size="sm" disabled={pending}>{pending ? "…" : t.approve}</Button>
        </form>
      )}
      {opportunity.status === "pending" && (
        <form action={dismissAction} className="mt-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <Button type="submit" size="sm" variant="outline" disabled={dismissPending}>{dismissPending ? "…" : t.dismiss}</Button>
        </form>
      )}
      {dismissFeedback && <p className="mt-3 text-xs text-muted-foreground" role="status">{dismissFeedback}</p>}
      {opportunity.failureCode && <p className="mt-3 text-xs text-destructive">{opportunity.failureCode}</p>}
      {feedback && <p className="mt-3 text-xs text-muted-foreground" role="status">{feedback}</p>}
    </article>
  );
}

export function SalesRecoveryWorkspace({
  locale,
  enabled,
  merchantName,
  opportunities,
  error,
}: {
  locale: Locale;
  enabled: boolean;
  merchantName: string | null;
  opportunities: Opportunity[];
  error: string | null;
}) {
  const t = translations[locale];
  const [state, action, pending] = useActionState(setSalesRecoveryAutomation, null);
  const feedback = actionMessage(state, locale, t);
  return (
    <DashboardShell locale={locale} section="recovery" title={t.title} description={t.description} workspaceName={merchantName}>
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-sm text-muted-foreground">{enabled ? t.enabled : t.paused}</p>
          <form action={action}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="operation" value={enabled ? "pause" : "enable"} />
            <Button size="sm" type="submit" disabled={pending}>{enabled ? t.pause : t.enable}</Button>
          </form>
        </div>
        {(error || feedback) && <p className="rounded-xl border border-border bg-muted/40 p-4 text-sm" role="status">{feedback ?? error}</p>}
        {opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">{t.empty}</div>
        ) : (
          <div className="space-y-3">{opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} locale={locale} t={t} />)}</div>
        )}
      </section>
    </DashboardShell>
  );
}
