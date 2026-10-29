"use server";

import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import {
  getDemoMerchantId,
  demoDatabaseWritesEnabled,
} from "@/lib/demo-tenant";
import { isLocale } from "@/lib/i18n";
import { db } from "@/prisma/db";
import { isMetaModelConfigured } from "@/lib/meta-model-protocol";
import { previewMetaAssistantReply } from "@/lib/meta-assistant";

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

export type AssistantPreviewState =
  | { status: "success"; reply: string; handedOff: boolean }
  | {
      status: "error";
      reason:
        | "invalid-input"
        | "not-authorized"
        | "database-not-configured"
        | "assistant-not-seeded"
        | "model-not-configured"
        | "catalogue-unavailable"
        | "response-too-long"
        | "model-unavailable"
        | "model-credentials-rejected"
        | "model-rate-limited"
        | "model-invalid-response"
        | "assistant-tool-issue"
        | "preview-failed";
    }
  | null;

export async function runAssistantPreview(
  _previousState: AssistantPreviewState,
  formData: FormData,
): Promise<AssistantPreviewState> {
  const locale = formData.get("locale");
  const customerMessage = formData.get("customerMessage");
  const systemInstructions = formData.get("systemInstructions");
  if (
    typeof locale !== "string" ||
    !isLocale(locale) ||
    typeof customerMessage !== "string" ||
    customerMessage.trim().length < 2 ||
    customerMessage.trim().length > 1000 ||
    typeof systemInstructions !== "string" ||
    systemInstructions.trim().length > 2000
  ) {
    return { status: "error", reason: "invalid-input" };
  }
  if (!(await hasDemoAccess())) {
    return { status: "error", reason: "not-authorized" };
  }

  const result = await previewMetaAssistantReply(
    customerMessage.trim(),
    systemInstructions.trim(),
  );
  if (!result.ok) return { status: "error", reason: result.error };
  return {
    status: "success",
    reply: result.reply,
    handedOff: result.handedOff,
  };
}

export async function setAssistantAutomation(
  _previousState: AssistantActionState,
  formData: FormData,
): Promise<AssistantActionState> {
  const demoMerchantId = getDemoMerchantId();
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
    ).first({ merchantId: demoMerchantId });
    if (!assistant) {
      return { status: "error", reason: "assistant-not-seeded" };
    }
    if (operation === "enable") {
      const connections = await db.orm.public.WhatsAppConnection.where({
        merchantId: demoMerchantId,
        status: "connected",
      }).all();
      const hasActiveConnection = connections.some(
        (connection) =>
          !connection.tokenExpiresAt ||
          Date.parse(connection.tokenExpiresAt) > Date.now(),
      );
      const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() ?? "";
      if (
        !hasActiveConnection ||
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
      merchantId: demoMerchantId,
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

export async function saveAssistantInstructions(
  _previousState: AssistantActionState,
  formData: FormData,
): Promise<AssistantActionState> {
  const locale = formData.get("locale");
  const instructions = formData.get("systemInstructions");
  if (
    typeof locale !== "string" ||
    !isLocale(locale) ||
    typeof instructions !== "string" ||
    instructions.trim().length > 2000
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

  try {
    const assistant = await db.orm.public.AssistantConfig.first({
      merchantId: getDemoMerchantId(),
    });
    if (!assistant) return { status: "error", reason: "assistant-not-seeded" };
    await db.orm.public.AssistantConfig.where({
      id: assistant.id,
      merchantId: getDemoMerchantId(),
    }).update({
      systemInstructions: instructions.trim() || null,
    });
  } catch (error) {
    console.error(
      "[assistant-action] Could not save shop instructions.",
      error instanceof Error ? error.name : "UnknownError",
    );
    return { status: "error", reason: "storage-unavailable" };
  }

  revalidatePath(`/${locale}/settings`);
  return { status: "success" };
}
