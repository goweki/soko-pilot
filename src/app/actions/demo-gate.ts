"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  grantDemoAccess,
  isDemoGateConfigured,
  sanitizeGateDestination,
  verifyDemoAccessCode,
} from "@/lib/demo-gate";
import { isLocale, type Locale } from "@/lib/i18n";

export type GateActionState =
  | { error: "invalid-code" }
  | { error: "not-configured" }
  | null;

export async function unlockDemoAccess(
  _previousState: GateActionState,
  formData: FormData,
): Promise<GateActionState> {
  const localeValue = formData.get("locale");
  const locale: Locale = isLocale(String(localeValue)) ? String(localeValue) as Locale : "en";
  const codeValue = formData.get("accessCode");
  const nextValue = formData.get("next");
  const destination = sanitizeGateDestination(
    typeof nextValue === "string" ? nextValue : null,
    locale,
  );

  if (!verifyDemoAccessCode(typeof codeValue === "string" ? codeValue : "")) {
    if (!isDemoGateConfigured()) {
      return { error: "not-configured" };
    }
    return { error: "invalid-code" };
  }

  await grantDemoAccess();
  redirect(destination);
}

export async function lockDemoAccess(formData: FormData): Promise<void> {
  const localeValue = formData.get("locale");
  const locale: Locale = isLocale(String(localeValue)) ? String(localeValue) as Locale : "en";
  const cookieStore = await cookies();
  cookieStore.delete("sokopilot-demo-gate");
  redirect(`/${locale}`);
}
