import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Locale } from "@/lib/i18n";

export const DEMO_GATE_COOKIE = "sokopilot-demo-gate";
export const DEMO_GATE_TTL_SECONDS = 8 * 60 * 60;

export { sanitizeGateDestination } from "@/lib/demo-gate-core";
import { timingSafeEqual } from "node:crypto";
import {
  createDemoGateCookieValue,
  sanitizeGateDestination,
  verifyDemoGateCookieValue,
} from "@/lib/demo-gate-core";

function configuredSecrets() {
  const accessCode =
    process.env.WORKSPACE_ACCESS_CODE || process.env.DEMO_ACCESS_CODE;
  const signingSecret =
    process.env.WORKSPACE_ACCESS_SECRET || process.env.DEMO_GATE_SECRET;

  if (
    !accessCode ||
    accessCode.length < 8 ||
    !signingSecret ||
    signingSecret.length < 32
  ) {
    return null;
  }

  return { accessCode, signingSecret };
}

function equalSecret(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

export function isDemoGateConfigured(): boolean {
  const secrets = configuredSecrets();
  const isConfig = secrets !== null;
  return isConfig;
}

export function verifyDemoAccessCode(candidate: string): boolean {
  const secrets = configuredSecrets();
  return secrets !== null && equalSecret(candidate, secrets.accessCode);
}

export async function grantDemoAccess(): Promise<void> {
  const secrets = configuredSecrets();
  if (!secrets) {
    throw new Error(
      "Workspace access requires WORKSPACE_ACCESS_CODE (12+ characters) and WORKSPACE_ACCESS_SECRET (32+ characters).",
    );
  }

  const expiresAt = String(
    Math.floor(Date.now() / 1000) + DEMO_GATE_TTL_SECONDS,
  );
  const cookieStore = await cookies();
  cookieStore.set(
    DEMO_GATE_COOKIE,
    createDemoGateCookieValue(expiresAt, secrets.signingSecret),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: DEMO_GATE_TTL_SECONDS,
    },
  );
}

export async function hasDemoAccess(): Promise<boolean> {
  const secrets = configuredSecrets();
  if (!secrets) {
    return false;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(DEMO_GATE_COOKIE)?.value;

  await connection();
  return verifyDemoGateCookieValue(value, secrets.signingSecret);
}

export async function requireDemoAccess(locale: Locale, destination: string) {
  if (!(await hasDemoAccess())) {
    redirect(
      `/${locale}/sign-in?next=${encodeURIComponent(
        sanitizeGateDestination(destination, locale),
      )}`,
    );
  }
}
