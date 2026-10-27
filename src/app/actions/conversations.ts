"use server";

import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import { isLocale, type Locale } from "@/lib/i18n";
import { setDemoConversationHandoff } from "@/lib/conversations";

export type ConversationActionState =
  | { status: "success" }
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

  if (
    typeof localeValue !== "string" ||
    !isLocale(localeValue) ||
    typeof conversationId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(conversationId) ||
    operationValue !== "handoff"
  ) {
    return { status: "error", reason: "invalid-input" };
  }
  const locale: Locale = localeValue;
  if (!(await hasDemoAccess())) {
    return { status: "error", reason: "not-authorized" };
  }

  const result = await setDemoConversationHandoff(conversationId);
  if (!result.ok) return { status: "error", reason: result.error };
  revalidatePath(`/${locale}/dashboard/conversations`);
  revalidatePath(`/${locale}/dashboard`);
  return { status: "success" };
}
