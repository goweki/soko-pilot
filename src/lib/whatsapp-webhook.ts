import "server-only";

import { createHash } from "node:crypto";
import { db } from "@/prisma/db";
import { demoDatabaseWritesEnabled } from "@/lib/demo-tenant";
import { processMetaAssistantReply } from "@/lib/meta-assistant";

const MAX_WEBHOOK_BYTES = 1_000_000;

import {
  getWebhookContentType,
  isOptOutMessage,
  parseWhatsAppChanges,
  type InboundMessage,
} from "@/lib/whatsapp-webhook-parse";

export type WebhookProcessResult =
  | { ok: true; accepted: number; duplicates: number }
  | {
      ok: false;
      error:
        | "database-not-configured"
        | "writes-not-approved"
        | "invalid-payload"
        | "connection-not-found"
        | "storage-unavailable";
    };

type PersistMessageResult =
  | {
      kind: "accepted";
      conversationId: string;
      automationEligible: boolean;
      automationBlockers: string[];
    }
  | { kind: "duplicate" }
  | { kind: "connection-not-found" };

function maskPhoneNumber(phoneNumber: string): string {
  return `${"•".repeat(Math.max(0, phoneNumber.length - 4))}${phoneNumber.slice(-4)}`;
}

async function persistMessage(
  phoneNumberId: string,
  message: InboundMessage,
  payloadHash: string,
): Promise<PersistMessageResult> {
  const connection = await db.orm.public.WhatsAppConnection.first({
    phoneNumberId,
  });
  if (!connection || connection.status !== "connected") {
    return { kind: "connection-not-found" };
  }

  return db.transaction(async (tx) => {
    const alreadyHandled = await tx.orm.public.WebhookEvent.where({
      whatsappConnectionId: connection.id,
      deduplicationKey: message.id,
    }).first();
    if (alreadyHandled) return { kind: "duplicate" };

    await tx.orm.public.WebhookEvent.create({
      whatsappConnectionId: connection.id,
      deduplicationKey: message.id,
      payloadHash,
      status: "processing",
      attemptCount: 1,
    });

    const existingCustomer = await tx.orm.public.Customer.where({
      merchantId: connection.merchantId,
      waId: message.from,
    }).first();
    const customer = existingCustomer
      ? existingCustomer
      : await tx.orm.public.Customer.create({
          merchantId: connection.merchantId,
          waId: message.from,
          phoneNumber: message.from,
          displayName: message.displayName,
        });

    const now = new Date().toISOString();
    const customerOptedOut = Boolean(
      isOptOutMessage(message.body),
    );
    if (customerOptedOut) {
      await tx.orm.public.Customer.where({
        id: customer.id,
        merchantId: connection.merchantId,
      }).update({ optedOutAt: now });
    } else if (
      existingCustomer &&
      message.displayName &&
      !existingCustomer.displayName
    ) {
      await tx.orm.public.Customer.where({
        id: customer.id,
        merchantId: connection.merchantId,
      }).update({ displayName: message.displayName });
    }

    const existingConversation = await tx.orm.public.Conversation.where({
      merchantId: connection.merchantId,
      customerId: customer.id,
      whatsappConnectionId: connection.id,
    })
      .orderBy((conversation) => conversation.updatedAt.desc())
      .first();
    const automationBlockers: string[] = [];
    if (
      message.type !== "text" &&
      message.type !== "image" &&
      message.type !== "interactive"
    ) {
      automationBlockers.push("unsupported-message-type");
    }
    if (
      (message.type === "text" && !message.body?.trim()) ||
      (message.type === "image" && !message.mediaId) ||
      (message.type === "interactive" && !message.body?.trim())
    ) automationBlockers.push("empty-message");
    if (
      connection.tokenExpiresAt &&
      Date.parse(connection.tokenExpiresAt) <= Date.now()
    ) {
      automationBlockers.push("whatsapp-token-expired");
    }
    if (customerOptedOut || customer.optedOutAt) {
      automationBlockers.push("customer-opted-out");
    }
    const merchantHasTakenOver = Boolean(
      existingConversation?.status === "handoff" &&
      existingConversation.automationPausedAt &&
      existingConversation.automationPausedAt !==
        existingConversation.lastMessageAt,
    );
    if (merchantHasTakenOver) {
      automationBlockers.push("merchant-takeover-active");
    }
    const automationEligible = automationBlockers.length === 0;
    const conversation = existingConversation
      ? existingConversation
      : await tx.orm.public.Conversation.create({
          merchantId: connection.merchantId,
          customerId: customer.id,
          whatsappConnectionId: connection.id,
          status: "handoff",
          automationPausedAt: now,
        });

    await tx.orm.public.Message.create({
      conversationId: conversation.id,
      whatsappConnectionId: connection.id,
      direction: "inbound",
      contentType: getWebhookContentType(message.type),
      status: "received",
      body: message.body,
      mediaId: message.mediaId,
      providerMessageId: message.id,
    });

    await tx.orm.public.Conversation.where({
      id: conversation.id,
      merchantId: connection.merchantId,
    }).update({
      status: "handoff",
      automationPausedAt: merchantHasTakenOver
        ? (existingConversation?.automationPausedAt ?? now)
        : now,
      lastMessageAt: now,
    });

    await tx.orm.public.WebhookEvent.where({
      whatsappConnectionId: connection.id,
      deduplicationKey: message.id,
    }).update({ status: "processed", processedAt: now });
    await tx.orm.public.WhatsAppConnection.where({
      id: connection.id,
      merchantId: connection.merchantId,
    }).update({ lastWebhookAt: now });

    return {
      kind: "accepted",
      conversationId: conversation.id,
      automationEligible,
      automationBlockers,
    };
  });
}

export async function processWhatsAppWebhook(
  body: Buffer,
): Promise<WebhookProcessResult> {
  if (body.byteLength > MAX_WEBHOOK_BYTES) {
    console.warn("[whatsapp-webhook] Rejected oversized payload.", {
      payloadBytes: body.byteLength,
    });
    return { ok: false, error: "invalid-payload" };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body.toString("utf8")) as unknown;
  } catch {
    console.warn("[whatsapp-webhook] Rejected invalid JSON payload.");
    return { ok: false, error: "invalid-payload" };
  }

  const changes = parseWhatsAppChanges(payload);
  if (!changes) {
    console.warn("[whatsapp-webhook] Rejected invalid WhatsApp payload.");
    return { ok: false, error: "invalid-payload" };
  }

  const incomingMessages = changes.flatMap((change) =>
    change.messages.map((message) => ({ change, message })),
  );
  console.info("[whatsapp-webhook] Payload parsed.", {
    changes: changes.length,
    incomingMessages: incomingMessages.length,
  });
  for (const { change, message } of incomingMessages) {
    console.info("[whatsapp-webhook] Incoming message received.", {
      messageId: message.id,
      phoneNumberId: change.phoneNumberId,
      // sender: maskPhoneNumber(message.from),
      sender: maskPhoneNumber(message.from),
      type: message.type,
    });
  }
  for (const change of changes) {
    for (const status of change.statuses) {
      const details = {
        messageId: status.id,
        phoneNumberId: change.phoneNumberId,
        recipient: status.recipientId
          ? maskPhoneNumber(status.recipientId)
          : null,
        timestamp: status.timestamp,
        errors: status.errors,
      };
      if (status.status === "failed") {
        console.error("[whatsapp-webhook] Outbound message failed.", details);
      } else {
        console.info(
          `[whatsapp-webhook] Outbound message ${status.status}.`,
          details,
        );
      }
    }
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[whatsapp-webhook] Database is not configured.");
    return { ok: false, error: "database-not-configured" };
  }
  if (!demoDatabaseWritesEnabled()) {
    console.error("[whatsapp-webhook] Database writes are not approved.");
    return { ok: false, error: "writes-not-approved" };
  }

  const payloadHash = createHash("sha256").update(body).digest("hex");
  let accepted = 0;
  let duplicates = 0;

  try {
    for (const change of changes) {
      for (const message of change.messages) {
        const result = await persistMessage(
          change.phoneNumberId,
          message,
          payloadHash,
        );
        if (result.kind === "connection-not-found") {
          return { ok: false, error: "connection-not-found" };
        }
        if (result.kind === "duplicate") {
          duplicates += 1;
        } else {
          accepted += 1;
          if (result.automationEligible) {
            console.info("[whatsapp-webhook] Starting assistant reply.", {
              messageId: message.id,
              conversationId: result.conversationId,
            });
            await processMetaAssistantReply(result.conversationId, message.id);
          } else {
            console.info("[whatsapp-webhook] Assistant reply skipped.", {
              messageId: message.id,
              conversationId: result.conversationId,
              reasons: result.automationBlockers,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(
      "[whatsapp-webhook] Inbound persistence failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false, error: "storage-unavailable" };
  }

  return { ok: true, accepted, duplicates };
}
