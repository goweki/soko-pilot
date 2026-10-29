"use client";

import { useActionState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  updateConversationHandoff,
  type ConversationActionState,
} from "@/app/actions/conversations";
import {
  sendWhatsAppManualReply,
  type WhatsAppReplyState,
} from "@/app/actions/whatsapp-replies";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/pages/page-placeholders";
import type {
  ConversationsReadResult,
  DemoConversation,
} from "@/lib/conversations";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";

function ConversationControl({
  conversation,
  locale,
}: {
  conversation: DemoConversation;
  locale: Locale;
}) {
  const text = messages[locale];
  const [state, action, pending] = useActionState(
    updateConversationHandoff,
    null,
  );
  const feedback = getActionFeedback(state, locale);

  useEffect(() => {
    if (!state || !feedback) return;
    if (state.status === "success") {
      toast.success(feedback);
    } else {
      toast.error(feedback);
    }
  }, [feedback, state]);

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      {(conversation.status === "open" ||
        conversation.status === "handoff") && (
        <form action={action}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="conversationId" value={conversation.id} />
          <input
            type="hidden"
            name="operation"
            value={conversation.status === "handoff" ? "resume" : "handoff"}
          />
          <Button
            size="sm"
            variant={conversation.status === "handoff" ? "outline" : "default"}
            type="submit"
            disabled={
              pending ||
              (conversation.status === "open" && conversation.optedOut)
            }
          >
            {pending
              ? text.saving
              : conversation.status === "handoff"
                ? text.resumeAutomation
                : text.handoff}
          </Button>
        </form>
      )}
    </div>
  );
}

function ManualReplyForm({
  conversation,
  locale,
}: {
  conversation: DemoConversation;
  locale: Locale;
}) {
  const text = messages[locale];
  const [state, action, pending] = useActionState(
    sendWhatsAppManualReply,
    null,
  );
  const error = getReplyFeedback(state, locale);
  return (
    <div className="mt-4 border-t border-border/70 pt-4">
      <form action={action} className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="conversationId" value={conversation.id} />
        <label className="sr-only" htmlFor={`reply-${conversation.id}`}>
          {text.manualReply}
        </label>
        <textarea
          className="min-h-10 flex-1 resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm"
          id={`reply-${conversation.id}`}
          maxLength={4096}
          name="body"
          placeholder={text.manualReply}
          required
        />
        <Button className="self-end" disabled={pending} size="sm" type="submit">
          {pending ? text.sending : text.sendReply}
        </Button>
      </form>
      {state?.status === "success" && (
        <p
          className="mt-2 text-xs text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {text.replySent}
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function getActionFeedback(state: ConversationActionState, locale: Locale) {
  if (!state) return null;
  const text = messages[locale];
  if (state.status === "success") {
    return state.operation === "resume"
      ? text.assistantResumed
      : text.merchantHandoffStarted;
  }
  if (state.reason === "database-not-configured")
    return text.databaseNotConfigured;
  if (state.reason === "writes-not-approved")
    return text.databaseWritesNotApproved;
  if (state.reason === "not-authorized") return text.demoAccessExpired;
  if (state.reason === "not-found") return text.conversationNotFound;
  if (state.reason === "invalid-input") return text.invalidConversationAction;
  return text.storageUnavailable;
}

function getReplyFeedback(state: WhatsAppReplyState, locale: Locale) {
  if (!state || state.status === "success") return null;
  const text = messages[locale];
  if (state.reason === "not-authorized") return text.demoAccessExpired;
  if (state.reason === "writes-not-approved")
    return text.databaseWritesNotApproved;
  if (state.reason === "not-configured") return text.whatsappReplyNotConfigured;
  if (state.reason === "not-found") return text.conversationNotFound;
  if (state.reason === "not-handed-off") return text.replyRequiresHandoff;
  if (state.reason === "customer-opted-out") return text.customerOptedOut;
  if (state.reason === "provider-failed") {
    const providerDetails = [
      state.providerCode ? `Meta ${state.providerCode}` : null,
      state.providerMessage,
    ]
      .filter(Boolean)
      .join(": ");
    return providerDetails
      ? `${text.whatsappProviderFailed} ${providerDetails}`
      : text.whatsappProviderFailed;
  }
  if (state.reason === "persist-failed") return text.whatsappSentNotSaved;
  return text.invalidConversationAction;
}

export function ConversationsWorkspace({
  locale,
  result,
}: {
  locale: Locale;
  result: ConversationsReadResult;
}) {
  const text = messages[locale];
  const errorMessage = result.ok
    ? null
    : result.error === "database-not-configured"
      ? text.databaseNotConfigured
      : result.error === "merchant-not-seeded"
        ? text.demoDataNotSeeded
        : text.storageUnavailable;

  return (
    <DashboardShell
      locale={locale}
      section="conversations"
      title={text.conversations}
      description={text.conversationsDescription}
      workspaceName={result.ok ? result.merchantName : null}
    >
      <section className="space-y-4">
        <Toaster position="top-right" />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm sm:px-5">
          <p className="text-sm text-muted-foreground">
            {text.inboxSourceNote}
          </p>
          {result.ok && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {result.conversations.length}
            </span>
          )}
        </div>
        {errorMessage ? (
          <p
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-amber-900 dark:text-amber-100"
            role="status"
          >
            {errorMessage}
          </p>
        ) : result.ok && result.conversations.length > 0 ? (
          <div className="space-y-3">
            {result.conversations.map((conversation) => (
              <article
                key={conversation.id}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {conversation.customerName ?? text.customer}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          conversation.automationPaused
                            ? "bg-amber-500/10 text-amber-800 dark:text-amber-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {conversation.automationPaused
                          ? text.handoffActive
                          : text.assistantUnavailable}
                      </span>
                      {conversation.optedOut && (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs text-destructive">
                          {text.customerOptedOut}
                        </span>
                      )}
                    </div>
                    {conversation.status === "handoff" &&
                      conversation.handoffAt && (
                        <p className="mt-1.5 text-xs text-amber-800 dark:text-amber-200">
                          {text.handoffSince}{" "}
                          <time dateTime={conversation.handoffAt}>
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(conversation.handoffAt))}
                          </time>
                        </p>
                      )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {text.latestMessage}:{" "}
                      </span>
                      {conversation.latestMessage ??
                        text.noConversationMessages}
                    </p>
                    {conversation.latestAssistantRun && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {text.latestAssistantRun}:
                        </span>
                        {conversation.latestAssistantRun.provider} ·{" "}
                        {conversation.latestAssistantRun.model} ·{" "}
                        {getAssistantRunStatusLabel(
                          conversation.latestAssistantRun.status,
                          locale,
                        )}
                      </p>
                    )}
                    <time
                      className="mt-2 block text-xs text-muted-foreground"
                      dateTime={conversation.updatedAt}
                    >
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(conversation.updatedAt))}
                    </time>
                  </div>
                  <div className="sm:shrink-0">
                    <ConversationControl
                      conversation={conversation}
                      locale={locale}
                    />
                  </div>
                </div>
                {conversation.messages.length > 0 && (
                  <ol
                    className="mt-4 max-h-96 space-y-2 overflow-y-auto rounded-xl bg-muted/35 p-3"
                    aria-label={text.conversationHistory}
                  >
                    {conversation.messages.map((message) => (
                      <li
                        key={message.id}
                        className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${message.direction === "outbound" ? "bg-primary text-primary-foreground" : "bg-card"}`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.body ?? `[${message.contentType}]`}
                          </p>
                          <time
                            className="mt-1 block text-[10px] opacity-70"
                            dateTime={message.createdAt}
                          >
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(message.createdAt))}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {conversation.status === "handoff" &&
                  !conversation.optedOut && (
                    <div className="w-full">
                      <ManualReplyForm
                        conversation={conversation}
                        locale={locale}
                      />
                    </div>
                  )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
            <h3 className="font-semibold">{text.conversationEmptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              {text.conversationsUnavailable}
            </p>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}

function getAssistantRunStatusLabel(
  status: NonNullable<DemoConversation["latestAssistantRun"]>["status"],
  locale: Locale,
) {
  const text = messages[locale];
  switch (status) {
    case "started":
      return text.assistantRunStarted;
    case "succeeded":
      return text.assistantRunSucceeded;
    case "failed":
      return text.assistantRunFailed;
    case "canceled":
      return text.assistantRunCanceled;
  }
}
