import "server-only";

import { createHash } from "node:crypto";
import { db } from "@/prisma/db";
import { demoDatabaseWritesEnabled } from "@/lib/demo-tenant";
import { processMetaAssistantReply } from "@/lib/meta-assistant";

const MAX_WEBHOOK_BYTES = 1_000_000;

type JsonRecord = Record<string, unknown>;

type InboundMessage = {
  id: string;
  from: string;
  type: string;
  body: string | null;
  mediaId: string | null;
  displayName: string | null;
};

type IncomingChange = {
  phoneNumberId: string;
  messages: InboundMessage[];
  statuses: {
    id: string;
    status: string;
    recipientId: string | null;
    timestamp: string | null;
    errors: {
      code: string | null;
      title: string | null;
      detail: string | null;
    }[];
  }[];
};

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

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function maskPhoneNumber(phoneNumber: string): string {
  return `${"•".repeat(Math.max(0, phoneNumber.length - 4))}${phoneNumber.slice(-4)}`;
}

function getContentType(
  type: string,
): "text" | "image" | "audio" | "video" | "document" | "sticker" | "unknown" {
  switch (type) {
    case "text":
    case "image":
    case "audio":
    case "video":
    case "document":
    case "sticker":
      return type;
    default:
      return "unknown";
  }
}

function readMediaId(message: JsonRecord, type: string): string | null {
  const media = message[type];
  return isRecord(media) ? getString(media.id) : null;
}

function parseChanges(payload: unknown): IncomingChange[] | null {
  if (!isRecord(payload) || !Array.isArray(payload.entry)) return null;
  const changes: IncomingChange[] = [];

  for (const entry of payload.entry) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) return null;
    for (const change of entry.changes) {
      if (!isRecord(change) || !isRecord(change.value)) return null;
      const value = change.value;
      const metadata = value.metadata;
      if (!isRecord(metadata)) return null;
      const phoneNumberId = getString(metadata.phone_number_id);
      if (!phoneNumberId) return null;

      const names = new Map<string, string>();
      if (Array.isArray(value.contacts)) {
        for (const contact of value.contacts) {
          if (!isRecord(contact)) continue;
          const waId = getString(contact.wa_id);
          const profile = contact.profile;
          const name = isRecord(profile) ? getString(profile.name) : null;
          if (waId && name) names.set(waId, name.slice(0, 120));
        }
      }

      const messages: InboundMessage[] = [];
      if (value.messages !== undefined && !Array.isArray(value.messages))
        return null;
      for (const message of Array.isArray(value.messages)
        ? value.messages
        : []) {
        if (!isRecord(message)) return null;
        const id = getString(message.id);
        const from = getString(message.from);
        const type = getString(message.type);
        if (!id || !from || !type) return null;
        const text = message.text;
        const body =
          type === "text" && isRecord(text) ? getString(text.body) : null;
        messages.push({
          id,
          from,
          type,
          body: body?.slice(0, 4000) ?? null,
          mediaId: readMediaId(message, type),
          displayName: names.get(from) ?? null,
        });
      }

      const statuses: IncomingChange["statuses"] = [];
      if (value.statuses !== undefined && !Array.isArray(value.statuses)) {
        return null;
      }
      for (const status of Array.isArray(value.statuses)
        ? value.statuses
        : []) {
        if (!isRecord(status)) return null;
        const id = getString(status.id);
        const currentStatus = getString(status.status);
        if (!id || !currentStatus) return null;
        const errors: IncomingChange["statuses"][number]["errors"] = [];
        for (const error of Array.isArray(status.errors) ? status.errors : []) {
          if (!isRecord(error)) continue;
          errors.push({
            code:
              typeof error.code === "string" || typeof error.code === "number"
                ? String(error.code).slice(0, 40)
                : null,
            title:
              typeof error.title === "string"
                ? error.title.slice(0, 160)
                : null,
            detail:
              typeof error.message === "string"
                ? error.message.slice(0, 240)
                : isRecord(error.error_data) &&
                    typeof error.error_data.details === "string"
                  ? error.error_data.details.slice(0, 240)
                  : null,
          });
        }
        statuses.push({
          id,
          status: currentStatus,
          recipientId: getString(status.recipient_id),
          timestamp: getString(status.timestamp),
          errors,
        });
      }
      changes.push({ phoneNumberId, messages, statuses });
    }
  }

  return changes;
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
      message.body &&
      /^(?:stop|stop all|unsubscribe)$/i.test(message.body.trim()),
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
    if (message.type !== "text") automationBlockers.push("not-text-message");
    if (!message.body?.trim()) automationBlockers.push("empty-message");
    if (customerOptedOut || customer.optedOutAt) {
      automationBlockers.push("customer-opted-out");
    }
    const assistantPhoneNumberId =
      process.env.META_PHONE_NUMBER_ID?.trim() ?? "";
    if (!assistantPhoneNumberId) {
      automationBlockers.push("assistant-phone-number-not-configured");
    } else if (phoneNumberId !== assistantPhoneNumberId) {
      automationBlockers.push("not-assistant-phone-number");
    }
    if (existingConversation?.status !== undefined) {
      if (existingConversation.status !== "open") {
        automationBlockers.push("conversation-not-open");
      }
      if (existingConversation.automationPausedAt !== null) {
        automationBlockers.push("automation-paused");
      }
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
      contentType: getContentType(message.type),
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
      automationPausedAt: now,
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

  const changes = parseChanges(payload);
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
      sender: message.from,
      type: message.type,
      bodyPreview: message.body?.slice(0, 160) ?? null,
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
