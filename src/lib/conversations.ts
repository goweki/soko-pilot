import "server-only";

import { db } from "@/prisma/db";
import { DEMO_MERCHANT_ID, demoDatabaseWritesEnabled } from "@/lib/demo-tenant";

export type DemoConversation = {
  id: string;
  customerName: string | null;
  latestMessage: string | null;
  updatedAt: string;
  status: "open" | "handoff" | "closed";
  automationPaused: boolean;
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

  try {
    const merchant = await db.orm.public.Merchant.first({
      id: DEMO_MERCHANT_ID,
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

    return {
      ok: true,
      merchantName: merchant.businessName,
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        customerName: conversation.customer.displayName,
        latestMessage: conversation.messages[0]?.body ?? null,
        updatedAt: conversation.updatedAt,
        status: conversation.status,
        automationPaused: conversation.automationPausedAt !== null,
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
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false as const, error: "database-not-configured" as const };
  }
  if (!demoDatabaseWritesEnabled()) {
    return { ok: false as const, error: "writes-not-approved" as const };
  }

  try {
    const conversation = await db.orm.public.Conversation.where({
      id: conversationId,
      merchantId: DEMO_MERCHANT_ID,
    }).first();
    if (!conversation) {
      return { ok: false as const, error: "not-found" as const };
    }

    await db.orm.public.Conversation.where({
      id: conversation.id,
      merchantId: DEMO_MERCHANT_ID,
    }).update({
      status: "handoff",
      automationPausedAt: new Date().toISOString(),
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
