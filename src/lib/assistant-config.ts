import "server-only";

import { db } from "@/prisma/db";
import { getDemoMerchantId } from "@/lib/demo-tenant";

export type DemoAssistantConfig =
  | {
      ok: true;
      merchantName: string;
      modelName: string;
      isActive: boolean;
      tools: { name: string; enabled: boolean }[];
    }
  | {
      ok: false;
      error:
        | "database-not-configured"
        | "merchant-not-seeded"
        | "storage-unavailable";
    };

export async function getDemoAssistantConfig(): Promise<DemoAssistantConfig> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false, error: "database-not-configured" };
  }
  const demoMerchantId = getDemoMerchantId();
  try {
    const merchant = await db.orm.public.Merchant.first({
      id: demoMerchantId,
    });
    if (!merchant) return { ok: false, error: "merchant-not-seeded" };
    const assistant = await db.orm.public.AssistantConfig.include("tools")
      .where({ merchantId: merchant.id })
      .first();
    if (!assistant) return { ok: false, error: "merchant-not-seeded" };
    return {
      ok: true,
      merchantName: merchant.businessName,
      modelName: assistant.modelName,
      isActive: assistant.isActive,
      tools: assistant.tools.map((tool) => ({
        name: tool.tool,
        enabled: tool.isEnabled,
      })),
    };
  } catch (error) {
    console.error(
      "[assistant-config] Database read failed.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { ok: false, error: "storage-unavailable" };
  }
}
