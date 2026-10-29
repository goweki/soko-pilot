"use server";

import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import { db } from "@/prisma/db";
import {
  getDemoMerchantId,
  demoDatabaseWritesEnabled,
} from "@/lib/demo-tenant";
import { isLocale, type Locale } from "@/lib/i18n";
import { decryptWhatsAppToken } from "@/lib/whatsapp-token";

export type WhatsAppReplyState =
  | { status: "success" }
  | {
      status: "error";
      reason: "provider-failed";
      providerCode?: string;
      providerMessage?: string;
    }
  | {
      status: "error";
      reason:
        | "invalid-input"
        | "not-authorized"
        | "writes-not-approved"
        | "not-configured"
        | "not-found"
        | "not-handed-off"
        | "customer-opted-out"
        | "persist-failed";
    }
  | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeProviderText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/\b(?:sk|key|token)[-_][A-Za-z0-9_-]{12,}\b/gi, "[redacted]")
    .slice(0, 500);
}

type MetaSendError = {
  providerCode?: string;
  providerSubcode?: string;
  providerType?: string;
  providerTitle?: string;
  providerMessage?: string;
  traceId?: string;
};

async function readMetaSendError(response: Response): Promise<MetaSendError> {
  try {
    const payload: unknown = await response.json();
    const error =
      isRecord(payload) && isRecord(payload.error) ? payload.error : null;
    if (!error) return {};
    const rawCode = error.code;
    return {
      providerCode:
        typeof rawCode === "string" || typeof rawCode === "number"
          ? String(rawCode).slice(0, 40)
          : undefined,
      providerSubcode:
        typeof error.error_subcode === "string" ||
        typeof error.error_subcode === "number"
          ? String(error.error_subcode).slice(0, 40)
          : undefined,
      providerType: safeProviderText(error.type),
      providerTitle: safeProviderText(error.error_user_title),
      providerMessage:
        safeProviderText(error.error_user_msg) ??
        safeProviderText(error.message),
      traceId: safeProviderText(error.fbtrace_id),
    };
  } catch {
    return {};
  }
}

export async function sendWhatsAppManualReply(
  _previousState: WhatsAppReplyState,
  formData: FormData,
): Promise<WhatsAppReplyState> {
  const localeValue = formData.get("locale");
  const conversationId = formData.get("conversationId");
  const demoMerchantId = getDemoMerchantId();
  const bodyValue = formData.get("body");
  if (
    typeof localeValue !== "string" ||
    !isLocale(localeValue) ||
    typeof conversationId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(conversationId) ||
    typeof bodyValue !== "string" ||
    bodyValue.trim().length === 0 ||
    bodyValue.trim().length > 4096
  ) {
    return { status: "error", reason: "invalid-input" };
  }
  const locale: Locale = localeValue;
  if (!(await hasDemoAccess())) {
    return { status: "error", reason: "not-authorized" };
  }
  if (!demoDatabaseWritesEnabled()) {
    return { status: "error", reason: "writes-not-approved" };
  }

  const graphVersion = process.env.META_GRAPH_API_VERSION?.trim();
  if (
    !process.env.DATABASE_URL?.trim() ||
    !graphVersion ||
    !/^v\d+\.\d+$/.test(graphVersion) ||
    !process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY?.trim()
  ) {
    return { status: "error", reason: "not-configured" };
  }

  let conversation;
  try {
    conversation = await db.orm.public.Conversation.include("customer")
      .include("whatsappConnection")
      .where({ id: conversationId, merchantId: demoMerchantId })
      .first();
  } catch (error) {
    console.error(
      "[whatsapp-reply] Conversation lookup failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { status: "error", reason: "not-configured" };
  }

  if (!conversation) return { status: "error", reason: "not-found" };
  if (conversation.status !== "handoff" || !conversation.automationPausedAt) {
    return { status: "error", reason: "not-handed-off" };
  }
  if (conversation.customer.optedOutAt) {
    return { status: "error", reason: "customer-opted-out" };
  }
  if (conversation.whatsappConnection.status !== "connected") {
    return { status: "error", reason: "not-configured" };
  }
  if (
    conversation.whatsappConnection.tokenExpiresAt &&
    Date.parse(conversation.whatsappConnection.tokenExpiresAt) <= Date.now()
  ) {
    return { status: "error", reason: "not-configured" };
  }

  let accessToken: string;
  try {
    accessToken = decryptWhatsAppToken(
      conversation.whatsappConnection.accessTokenCiphertext,
    );
  } catch (error) {
    console.error(
      "[whatsapp-reply] Stored WhatsApp token could not be decrypted.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { status: "error", reason: "not-configured" };
  }

  let providerMessageId: string;
  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${conversation.whatsappConnection.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.customer.waId,
          type: "text",
          text: { body: bodyValue.trim() },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      const providerError = await readMetaSendError(response);
      console.error("[whatsapp-reply] Meta send failed.", {
        httpStatus: response.status,
        ...providerError,
      });
      return {
        status: "error",
        reason: "provider-failed",
        providerCode: providerError.providerCode,
        providerMessage:
          providerError.providerMessage ?? providerError.providerTitle,
      };
    }
    const payload: unknown = await response.json();
    const messages = isRecord(payload) ? payload.messages : null;
    const firstMessage = Array.isArray(messages) ? messages[0] : null;
    const id = isRecord(firstMessage) ? firstMessage.id : null;
    if (typeof id !== "string" || id.length === 0) {
      console.error(
        "[whatsapp-reply] Meta accepted a response without a message id.",
      );
      return { status: "error", reason: "provider-failed" };
    }
    providerMessageId = id;
  } catch (error) {
    console.error(
      "[whatsapp-reply] Meta send request failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { status: "error", reason: "provider-failed" };
  }

  const sentAt = new Date().toISOString();
  try {
    await db.transaction(async (tx) => {
      await tx.orm.public.Message.create({
        conversationId: conversation.id,
        whatsappConnectionId: conversation.whatsappConnectionId,
        direction: "outbound",
        contentType: "text",
        status: "sent",
        body: bodyValue.trim(),
        providerMessageId,
        sentAt,
      });
      await tx.orm.public.Conversation.where({
        id: conversation.id,
        merchantId: demoMerchantId,
      }).update({ lastMessageAt: sentAt });
    });
  } catch (error) {
    console.error(
      "[whatsapp-reply] Message was sent but persistence failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { status: "error", reason: "persist-failed" };
  }

  revalidatePath(`/${locale}/dashboard/conversations`);
  revalidatePath(`/${locale}/dashboard`);
  return { status: "success" };
}
