import "server-only";

import { db } from "@/prisma/db";
import { demoDatabaseWritesEnabled, getDemoMerchantId } from "@/lib/demo-tenant";
import {
  buildRecoveryIdempotencyKey,
  createRecoveryCandidate,
  isRecoveryEligible,
  isWithinFrequencyCap,
  type RecoveryMessage,
} from "@/lib/sales-recovery";

const DEFAULT_INACTIVITY_MINUTES = 240;
const DEFAULT_FREQUENCY_CAP_DAYS = 7;

export async function getSalesRecoverySettings() {
  if (!process.env.DATABASE_URL?.trim()) return { ok: false as const, error: "database-not-configured" as const };
  try {
    const merchantId = getDemoMerchantId();
    const [config, merchant] = await Promise.all([
      db.orm.public.SalesRecoveryConfig.first({ merchantId }),
      db.orm.public.Merchant.first({ id: merchantId }),
    ]);
    return {
      ok: true as const,
      merchantName: merchant?.businessName ?? null,
      enabled: config?.isEnabled ?? false,
      inactivityMinutes: config?.inactivityMinutes ?? DEFAULT_INACTIVITY_MINUTES,
      frequencyCapDays: config?.frequencyCapDays ?? DEFAULT_FREQUENCY_CAP_DAYS,
    };
  } catch (error) {
    console.error("[sales-recovery] Settings lookup failed.", error instanceof Error ? error.name : "UnknownError");
    return { ok: false as const, error: "storage-unavailable" as const };
  }
}

export async function listSalesRecoveryOpportunities() {
  if (!process.env.DATABASE_URL?.trim()) return { ok: false as const, error: "database-not-configured" as const };
  try {
    const merchantId = getDemoMerchantId();
    const opportunities = await db.orm.public.SalesRecoveryOpportunity.include("customer")
      .where({ merchantId })
      .orderBy((item) => item.createdAt.desc())
      .limit(100)
      .all();
    return {
      ok: true as const,
      opportunities: opportunities.map((item) => ({
        id: item.id,
        customerName: item.customer.displayName,
        reason: item.reason,
        evidence: item.evidence,
        suggestedMessage: item.suggestedMessage,
        status: item.status,
        failureCode: item.failureCode,
        createdAt: item.createdAt,
      })),
    };
  } catch (error) {
    console.error("[sales-recovery] Opportunity list failed.", error instanceof Error ? error.name : "UnknownError");
    return { ok: false as const, error: "storage-unavailable" as const };
  }
}

export async function setSalesRecoveryEnabled(enabled: boolean) {
  if (!process.env.DATABASE_URL?.trim()) return { ok: false as const, error: "database-not-configured" as const };
  if (!demoDatabaseWritesEnabled()) return { ok: false as const, error: "writes-not-approved" as const };
  try {
    const merchantId = getDemoMerchantId();
    const existing = await db.orm.public.SalesRecoveryConfig.first({ merchantId });
    if (existing) {
      await db.orm.public.SalesRecoveryConfig.where({ id: existing.id, merchantId }).update({ isEnabled: enabled });
    } else {
      await db.orm.public.SalesRecoveryConfig.create({
        merchantId,
        isEnabled: enabled,
        inactivityMinutes: DEFAULT_INACTIVITY_MINUTES,
        frequencyCapDays: DEFAULT_FREQUENCY_CAP_DAYS,
      });
    }
    return { ok: true as const };
  } catch (error) {
    console.error("[sales-recovery] Settings update failed.", error instanceof Error ? error.name : "UnknownError");
    return { ok: false as const, error: "storage-unavailable" as const };
  }
}

export async function sweepSalesRecovery(now = Date.now()) {
  if (!process.env.DATABASE_URL?.trim()) return { ok: false as const, error: "database-not-configured" as const, created: 0 };
  if (!demoDatabaseWritesEnabled()) return { ok: false as const, error: "writes-not-approved" as const, created: 0 };
  const merchantId = getDemoMerchantId();

  try {
    const config = await db.orm.public.SalesRecoveryConfig.first({ merchantId });
    if (!config?.isEnabled) return { ok: true as const, enabled: false, created: 0 };

    const [conversations, recentSent] = await Promise.all([
      db.orm.public.Conversation.include("customer")
        .include("messages", (items) => items.orderBy((item) => item.createdAt.desc()).limit(30))
        .include("orders")
        .where({ merchantId, status: "open" })
        .orderBy((item) => item.updatedAt.desc())
        .limit(500)
        .all(),
      db.orm.public.SalesRecoveryOpportunity.where({ merchantId, status: "sent" }).all(),
    ]);

    const recentlyContactedCustomers = new Set(
      recentSent
        .filter((item) =>
          isWithinFrequencyCap(item.sentAt, now, config.frequencyCapDays),
        )
        .map((item) => item.customerId),
    );
    let created = 0;

    for (const conversation of conversations) {
      if (conversation.customer.optedOutAt || recentlyContactedCustomers.has(conversation.customerId)) continue;
      const messages: RecoveryMessage[] = [...conversation.messages].reverse().map((message) => ({
        id: message.id,
        direction: message.direction,
        body: message.body,
        createdAt: message.createdAt,
      }));
      const hasPendingOrder = conversation.orders.some((order) => order.status === "pending");
      if (!isRecoveryEligible({
        messages,
        lastMessageAt: conversation.lastMessageAt,
        conversationStatus: conversation.status,
        optedOut: Boolean(conversation.customer.optedOutAt),
        hasOrder: hasPendingOrder,
        now,
        inactivityMs: config.inactivityMinutes * 60 * 1000,
      })) continue;

      const candidate = createRecoveryCandidate(messages);
      if (!candidate) continue;
      const idempotencyKey = buildRecoveryIdempotencyKey(
        conversation.id,
        candidate.triggerMessageId,
      );
      const existing = await db.orm.public.SalesRecoveryOpportunity.first({
        conversationId: conversation.id,
        triggerMessageId: candidate.triggerMessageId,
      });
      if (existing) continue;
      try {
        await db.orm.public.SalesRecoveryOpportunity.create({
          merchantId,
          conversationId: conversation.id,
          customerId: conversation.customerId,
          triggerMessageId: candidate.triggerMessageId,
          lastOutboundMessageId: candidate.lastOutboundMessageId,
          reason: candidate.reason,
          evidence: candidate.evidence,
          suggestedMessage: candidate.suggestedMessage,
          idempotencyKey,
        });
        created += 1;
      } catch (error) {
        console.warn("[sales-recovery] Opportunity insert was rejected, likely by idempotency constraint.", {
          conversationId: conversation.id,
          triggerMessageId: candidate.triggerMessageId,
          error: error instanceof Error ? error.name : "UnknownError",
        });
      }
    }
    return { ok: true as const, enabled: true, created };
  } catch (error) {
    console.error("[sales-recovery] Sweep failed.", error instanceof Error ? error.name : "UnknownError");
    return { ok: false as const, error: "storage-unavailable" as const, created: 0 };
  }
}
