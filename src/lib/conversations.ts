import "server-only";

import { db } from "@/prisma/db";
import {
  getDemoMerchantId,
  demoDatabaseWritesEnabled,
} from "@/lib/demo-tenant";

const FAILED_HANDOFF_TIMEOUT_MS = 10 * 60 * 1000;

export type DemoConversation = {
  id: string;
  customerName: string | null;
  latestMessage: string | null;
  updatedAt: string;
  status: "open" | "handoff" | "closed";
  automationPaused: boolean;
  handoffAt: string | null;
  optedOut: boolean;
  latestAssistantRun: {
    provider: string;
    model: string;
    status: "started" | "succeeded" | "failed" | "canceled";
    startedAt: string;
    completedAt: string | null;
  } | null;
  messages: {
    id: string;
    direction: "inbound" | "outbound" | "internal";
    body: string | null;
    contentType: string;
    status: string;
    createdAt: string;
  }[];
};

export type ConversationsReadResult =
  | { ok: true; merchantName: string; conversations: DemoConversation[] }
  | {
      ok: false;
      error:
        | "database-not-configured"
        | "merchant-not-seeded"
        | "storage-unavailable";
    };

export async function listDemoConversations(): Promise<ConversationsReadResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false, error: "database-not-configured" };
  }

  const demoMerchantId = getDemoMerchantId();

  try {
    const merchant = await db.orm.public.Merchant.first({
      id: demoMerchantId,
    });
    if (!merchant) {
      return { ok: false, error: "merchant-not-seeded" };
    }

    const conversations = await db.orm.public.Conversation.include("customer")
      .include("messages", (messages) =>
        messages.orderBy((message) => message.createdAt.desc()).limit(100),
      )
      .include("assistantRuns", (runs) =>
        runs.orderBy((run) => run.startedAt.desc()).limit(1),
      )
      .where({ merchantId: merchant.id })
      .orderBy((conversation) => conversation.updatedAt.desc())
      .limit(100)
      .all();

    const currentTime = Date.now();
    const recoveredConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const latestRun = conversation.assistantRuns[0];
        const pauseMarkerMatchesLastMessage = Boolean(
          conversation.automationPausedAt &&
          conversation.lastMessageAt &&
          conversation.automationPausedAt === conversation.lastMessageAt,
        );
        const lastMessageAge = conversation.lastMessageAt
          ? currentTime - new Date(conversation.lastMessageAt).getTime()
          : 0;
        if (
          !demoDatabaseWritesEnabled() ||
          conversation.status !== "handoff" ||
          !pauseMarkerMatchesLastMessage ||
          latestRun?.status !== "failed" ||
          lastMessageAge < FAILED_HANDOFF_TIMEOUT_MS
        ) {
          return conversation;
        }

        try {
          const updated = await db.orm.public.Conversation.where({
            id: conversation.id,
            merchantId: merchant.id,
            status: "handoff",
            automationPausedAt: conversation.automationPausedAt,
            lastMessageAt: conversation.lastMessageAt,
          }).update({
            status: "open",
            automationPausedAt: null,
          });
          if (!updated) return conversation;
          console.info("[conversations] Recovered stale assistant handoff.", {
            conversationId: conversation.id,
            failedRunId: latestRun.id,
          });
          return {
            ...conversation,
            status: "open" as const,
            automationPausedAt: null,
          };
        } catch (error) {
          console.error(
            "[conversations] Could not recover stale assistant handoff.",
            error instanceof Error ? error.name : "UnknownError",
          );
          return conversation;
        }
      }),
    );

    return {
      ok: true,
      merchantName: merchant.businessName,
      conversations: recoveredConversations.map((conversation) => ({
        id: conversation.id,
        customerName: conversation.customer.displayName,
        latestMessage: conversation.messages[0]?.body ?? null,
        updatedAt: conversation.updatedAt,
        status: conversation.status,
        automationPaused: conversation.automationPausedAt !== null,
        handoffAt:
          conversation.status === "handoff"
            ? conversation.automationPausedAt
            : null,
        optedOut: conversation.customer.optedOutAt !== null,
        latestAssistantRun: conversation.assistantRuns[0]
          ? {
              provider: conversation.assistantRuns[0].provider,
              model: conversation.assistantRuns[0].model,
              status: conversation.assistantRuns[0].status,
              startedAt: conversation.assistantRuns[0].startedAt,
              completedAt: conversation.assistantRuns[0].completedAt,
            }
          : null,
        messages: [...conversation.messages].reverse().map((message) => ({
          id: message.id,
          direction: message.direction,
          body: message.body,
          contentType: message.contentType,
          status: message.status,
          createdAt: message.createdAt,
        })),
      })),
    };
  } catch (error) {
    console.error(
      "[conversations] Database read failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false, error: "storage-unavailable" };
  }
}

export async function setDemoConversationHandoff(conversationId: string) {
  console.info("[conversations] Applying merchant takeover.", {
    conversationId,
  });
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "[conversations] Takeover failed: database is not configured.",
    );
    return { ok: false as const, error: "database-not-configured" as const };
  }
  const demoMerchantId = getDemoMerchantId();
  if (!demoDatabaseWritesEnabled()) {
    console.error(
      "[conversations] Takeover failed: database writes are disabled.",
    );
    return { ok: false as const, error: "writes-not-approved" as const };
  }

  try {
    const updated = await db.orm.public.Conversation.where({
      id: conversationId,
      merchantId: demoMerchantId,
    })
      .select("id")
      .update({
        status: "handoff",
        automationPausedAt: new Date().toISOString(),
      });
    if (!updated) {
      console.warn("[conversations] Takeover found no matching conversation.", {
        conversationId,
      });
      return { ok: false as const, error: "not-found" as const };
    }
    console.info("[conversations] Merchant takeover applied.", {
      conversationId: updated.id,
    });
    return { ok: true as const };
  } catch (error) {
    console.error(
      "[conversations] Handoff update failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false as const, error: "storage-unavailable" as const };
  }
}

export async function resumeDemoConversationAutomation(conversationId: string) {
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false as const, error: "database-not-configured" as const };
  }
  const demoMerchantId = getDemoMerchantId();
  if (!demoDatabaseWritesEnabled()) {
    return { ok: false as const, error: "writes-not-approved" as const };
  }

  try {
    const updated = await db.orm.public.Conversation.where({
      id: conversationId,
      merchantId: demoMerchantId,
      status: "handoff",
    })
      .select("id")
      .update({ status: "open", automationPausedAt: null });
    if (!updated) return { ok: false as const, error: "not-found" as const };
    return { ok: true as const };
  } catch (error) {
    console.error(
      "[conversations] Resume automation failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false as const, error: "storage-unavailable" as const };
  }
}
