"use server";

import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import { isLocale } from "@/lib/i18n";
import { db } from "@/prisma/db";
import { demoDatabaseWritesEnabled, getDemoMerchantId } from "@/lib/demo-tenant";
import { decryptWhatsAppToken } from "@/lib/whatsapp-token";
import { setSalesRecoveryEnabled } from "@/lib/sales-recovery-store";

export type SalesRecoveryActionState =
  | {
      status: "success";
      operation: "enabled" | "paused" | "sent" | "dismissed";
    }
  | { status: "error"; reason: string }
  | null;

function validId(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}

export async function setSalesRecoveryAutomation(
  _previous: SalesRecoveryActionState,
  formData: FormData,
): Promise<SalesRecoveryActionState> {
  const locale = formData.get("locale");
  const operation = formData.get("operation");
  if (typeof locale !== "string" || !isLocale(locale) || (operation !== "enable" && operation !== "pause")) {
    return { status: "error", reason: "invalid-input" };
  }
  if (!(await hasDemoAccess())) return { status: "error", reason: "not-authorized" };
  const result = await setSalesRecoveryEnabled(operation === "enable");
  if (!result.ok) return { status: "error", reason: result.error };
  revalidatePath(`/${locale}/dashboard/recovery`);
  return { status: "success", operation: operation === "enable" ? "enabled" : "paused" };
}

export async function dismissRecoveryOpportunity(
  _previous: SalesRecoveryActionState,
  formData: FormData,
): Promise<SalesRecoveryActionState> {
  const locale = formData.get("locale");
  const opportunityId = formData.get("opportunityId");
  if (
    typeof locale !== "string" ||
    !isLocale(locale) ||
    !validId(opportunityId)
  )
    return { status: "error", reason: "invalid-input" };
  if (!(await hasDemoAccess()))
    return { status: "error", reason: "not-authorized" };
  if (!process.env.DATABASE_URL?.trim())
    return { status: "error", reason: "database-not-configured" };
  if (!demoDatabaseWritesEnabled())
    return { status: "error", reason: "writes-not-approved" };
  try {
    const updated = await db.orm.public.SalesRecoveryOpportunity.where({
      id: opportunityId,
      merchantId: getDemoMerchantId(),
      status: "pending",
    }).update({
      status: "dismissed",
      reviewedAt: new Date().toISOString(),
    });
    if (!updated) return { status: "error", reason: "already-reviewed" };
  } catch (error) {
    console.error(
      "[sales-recovery] Dismiss failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { status: "error", reason: "storage-unavailable" };
  }
  revalidatePath(`/${locale}/dashboard/recovery`);
  return { status: "success", operation: "dismissed" };
}

export async function sendApprovedRecoveryMessage(
  _previous: SalesRecoveryActionState,
  formData: FormData,
): Promise<SalesRecoveryActionState> {
  const locale = formData.get("locale");
  const opportunityId = formData.get("opportunityId");
  const body = formData.get("body");
  if (
    typeof locale !== "string" || !isLocale(locale) || !validId(opportunityId) ||
    typeof body !== "string" || !body.trim() || body.trim().length > 4096
  ) return { status: "error", reason: "invalid-input" };
  if (!(await hasDemoAccess())) return { status: "error", reason: "not-authorized" };
  if (!process.env.DATABASE_URL?.trim()) return { status: "error", reason: "database-not-configured" };
  if (!demoDatabaseWritesEnabled()) return { status: "error", reason: "writes-not-approved" };

  const merchantId = getDemoMerchantId();
  let opportunity;
  try {
    opportunity = await db.orm.public.SalesRecoveryOpportunity.include("conversation", (query) =>
      query.include("customer").include("whatsappConnection").include("messages", (items) =>
        items.orderBy((item) => item.createdAt.desc()).limit(1),
      ).include("orders"),
    ).where({ id: opportunityId, merchantId, status: "pending" }).first();
  } catch (error) {
    console.error("[sales-recovery] Opportunity lookup failed.", error instanceof Error ? error.name : "UnknownError");
    return { status: "error", reason: "storage-unavailable" };
  }
  if (!opportunity) return { status: "error", reason: "not-found-or-already-reviewed" };

  const conversation = opportunity.conversation;
  if (!conversation) return { status: "error", reason: "not-found" };
  const latestMessage = conversation.messages[0];
  const latestInbound = await db.orm.public.Message.where({
    conversationId: conversation.id,
    direction: "inbound",
  }).orderBy((item) => item.createdAt.desc()).first();
  if (
    conversation.status !== "open" || conversation.customer.optedOutAt ||
    latestMessage?.id !== opportunity.lastOutboundMessageId ||
    conversation.orders.some((order) => order.status === "pending") ||
    !latestInbound || Date.now() - Date.parse(latestInbound.createdAt) >= 24 * 60 * 60 * 1000
  ) return { status: "error", reason: "no-longer-eligible" };

  const claimed = await db.orm.public.SalesRecoveryOpportunity.where({
    id: opportunity.id,
    merchantId,
    status: "pending",
  }).update({ status: "approved", reviewedAt: new Date().toISOString() });
  if (!claimed) return { status: "error", reason: "already-reviewed" };

  const connection = conversation.whatsappConnection;
  const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() ?? "";
  if (
    connection.status !== "connected" ||
    (connection.tokenExpiresAt && Date.parse(connection.tokenExpiresAt) <= Date.now()) ||
    !/^v\d+\.\d+$/.test(graphVersion) ||
    !process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY?.trim()
  ) {
    await db.orm.public.SalesRecoveryOpportunity.where({ id: opportunity.id, merchantId }).update({ status: "failed", failureCode: "WHATSAPP_NOT_CONFIGURED" });
    return { status: "error", reason: "not-configured" };
  }

  let accessToken: string;
  try {
    accessToken = decryptWhatsAppToken(connection.accessTokenCiphertext);
  } catch {
    await db.orm.public.SalesRecoveryOpportunity.where({ id: opportunity.id, merchantId }).update({ status: "failed", failureCode: "TOKEN_DECRYPT_FAILED" });
    return { status: "error", reason: "not-configured" };
  }

  let providerMessageId: string;
  try {
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/${connection.phoneNumberId}/messages`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: conversation.customer.waId,
        type: "text",
        text: { body: body.trim() },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`WHATSAPP_HTTP_${response.status}`);
    const payload: unknown = await response.json();
    const messages = typeof payload === "object" && payload !== null && "messages" in payload
      ? payload.messages : null;
    const first = Array.isArray(messages) ? messages[0] : null;
    const id = typeof first === "object" && first !== null && "id" in first ? first.id : null;
    if (typeof id !== "string" || !id) throw new Error("WHATSAPP_INVALID_RESPONSE");
    providerMessageId = id;
  } catch (error) {
    const failureCode = error instanceof Error ? error.message.slice(0, 100) : "WHATSAPP_SEND_FAILED";
    await db.orm.public.SalesRecoveryOpportunity.where({ id: opportunity.id, merchantId }).update({ status: "failed", failureCode });
    return { status: "error", reason: "send-failed" };
  }

  const sentAt = new Date().toISOString();
  try {
    await db.transaction(async (tx) => {
      await tx.orm.public.Message.create({
        conversationId: conversation.id,
        whatsappConnectionId: connection.id,
        direction: "outbound",
        contentType: "text",
        status: "sent",
        body: body.trim(),
        providerMessageId,
        sentAt,
      });
      await tx.orm.public.Conversation.where({ id: conversation.id, merchantId }).update({ lastMessageAt: sentAt });
      await tx.orm.public.SalesRecoveryOpportunity.where({ id: opportunity.id, merchantId }).update({
        status: "sent",
        sentAt,
        providerMessageId,
      });
    });
  } catch (error) {
    console.error("[sales-recovery] Message sent but persistence failed.", error instanceof Error ? error.name : "UnknownError");
    return { status: "error", reason: "persist-failed" };
  }
  revalidatePath(`/${locale}/dashboard/recovery`);
  revalidatePath(`/${locale}/dashboard/conversations`);
  return { status: "success", operation: "sent" };
}
