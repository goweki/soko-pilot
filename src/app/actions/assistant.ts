"use server";

import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import { DEMO_MERCHANT_ID, demoDatabaseWritesEnabled } from "@/lib/demo-tenant";
import { isLocale } from "@/lib/i18n";
import { db } from "@/prisma/db";
import { isMetaModelConfigured } from "@/lib/meta-model-protocol";

export type AssistantActionState =
  | { status: "success" }
  | {
      status: "error";
      reason:
        | "invalid-input"
        | "not-authorized"
        | "writes-not-approved"
        | "database-not-configured"
        | "model-not-configured"
        | "whatsapp-not-configured"
        | "assistant-not-seeded"
        | "catalogue-search-required"
        | "write-tools-must-stay-disabled"
        | "storage-unavailable";
    }
  | null;

export async function setAssistantAutomation(
  _previousState: AssistantActionState,
  formData: FormData,
): Promise<AssistantActionState> {
  const locale = formData.get("locale");
  const operation = formData.get("operation");
  if (
    typeof locale !== "string" ||
    !isLocale(locale) ||
    (operation !== "enable" && operation !== "pause")
  ) {
    return { status: "error", reason: "invalid-input" };
  }
  if (!(await hasDemoAccess())) {
    return { status: "error", reason: "not-authorized" };
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "error", reason: "database-not-configured" };
  }
  if (!demoDatabaseWritesEnabled()) {
    return { status: "error", reason: "writes-not-approved" };
  }

  const config = {
    url: process.env.META_MODEL_API_URL,
    model: process.env.META_MODEL_NAME,
    apiKey: process.env.META_MODEL_API_KEY,
  };
  if (operation === "enable" && !isMetaModelConfigured(config)) {
    return { status: "error", reason: "model-not-configured" };
  }

  try {
    const assistant = await db.orm.public.AssistantConfig.include(
      "tools",
    ).first({ merchantId: DEMO_MERCHANT_ID });
    if (!assistant) {
      return { status: "error", reason: "assistant-not-seeded" };
    }
    if (operation === "enable") {
      const connection = await db.orm.public.WhatsAppConnection.first({
        merchantId: DEMO_MERCHANT_ID,
        status: "connected",
      });
      const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() ?? "";
      if (
        !connection ||
        !/^v\d+\.\d+$/.test(graphVersion) ||
        !process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY?.trim() ||
        !process.env.META_APP_SECRET?.trim() ||
        !process.env.META_WEBHOOK_VERIFY_TOKEN?.trim()
      ) {
        return { status: "error", reason: "whatsapp-not-configured" };
      }
    }
    if (
      operation === "enable" &&
      !assistant.tools.some(
        (tool) => tool.tool === "search_catalogue" && tool.isEnabled,
      )
    ) {
      return { status: "error", reason: "catalogue-search-required" };
    }
    if (
      operation === "enable" &&
      assistant.tools.some(
        (tool) =>
          (tool.tool === "create_pending_order" ||
            tool.tool === "get_customer_order") &&
          tool.isEnabled,
      )
    ) {
      return { status: "error", reason: "write-tools-must-stay-disabled" };
    }

    await db.orm.public.AssistantConfig.where({
      id: assistant.id,
      merchantId: DEMO_MERCHANT_ID,
    }).update({
      isActive: operation === "enable",
      ...(operation === "enable"
        ? {
            modelProvider: "meta",
            modelName: config.model!.trim(),
          }
        : {}),
    });
  } catch (error) {
    console.error(
      "[assistant-action] Could not update assistant state.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { status: "error", reason: "storage-unavailable" };
  }

  revalidatePath(`/${locale}/settings`);
  revalidatePath(`/${locale}/dashboard/conversations`);
  return { status: "success" };
}
