"use server";

import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import { isLocale, type Locale } from "@/lib/i18n";
import {
  resumeDemoConversationAutomation,
  setDemoConversationHandoff,
} from "@/lib/conversations";

export type ConversationActionState =
  | { status: "success"; operation: "handoff" | "resume" }
  | {
      status: "error";
      reason:
        | "invalid-input"
        | "not-authorized"
        | "database-not-configured"
        | "writes-not-approved"
        | "not-found"
        | "storage-unavailable";
    }
  | null;

export async function updateConversationHandoff(
  _previousState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  const localeValue = formData.get("locale");
  const conversationId = formData.get("conversationId");
  const operationValue = formData.get("operation");

  console.info("[conversation-action] Request received.", {
    operation: operationValue,
    conversationId:
      typeof conversationId === "string" ? conversationId : "invalid",
  });

  if (
    typeof localeValue !== "string" ||
    !isLocale(localeValue) ||
    typeof conversationId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(conversationId) ||
    (operationValue !== "handoff" && operationValue !== "resume")
  ) {
    console.warn("[conversation-action] Rejected invalid request.");
    return { status: "error", reason: "invalid-input" };
  }
  const locale: Locale = localeValue;
  if (!(await hasDemoAccess())) {
    console.warn(
      "[conversation-action] Rejected request without demo access.",
      {
        operation: operationValue,
        conversationId,
      },
    );
    return { status: "error", reason: "not-authorized" };
  }

  const result =
    operationValue === "handoff"
      ? await setDemoConversationHandoff(conversationId)
      : await resumeDemoConversationAutomation(conversationId);
  if (!result.ok) {
    console.error("[conversation-action] Operation failed.", {
      operation: operationValue,
      conversationId,
      reason: result.error,
    });
    return { status: "error", reason: result.error };
  }
  console.info("[conversation-action] Operation completed.", {
    operation: operationValue,
    conversationId,
  });
  revalidatePath(`/${locale}/dashboard/conversations`);
  revalidatePath(`/${locale}/dashboard`);
  return { status: "success", operation: operationValue };
}
