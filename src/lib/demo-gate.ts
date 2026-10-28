import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Locale } from "@/lib/i18n";

export const DEMO_GATE_COOKIE = "sokopilot-demo-gate";
export const DEMO_GATE_TTL_SECONDS = 8 * 60 * 60;

const allowedRoutes = new Set([
  "dashboard",
  "dashboard/conversations",
  "dashboard/products",
  "settings",
]);

export function sanitizeGateDestination(
  candidate: string | null | undefined,
  locale: Locale,
): string {
  const defaultDestination = `/${locale}/dashboard`;
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return defaultDestination;
  }

  const [path, query] = candidate.split("?", 2);
  const route = path?.slice(`/${locale}/`.length);
  if (!route || !allowedRoutes.has(route)) {
    return defaultDestination;
  }

  if (query && !(route === "settings" && query === "tab=assistant")) {
    return defaultDestination;
  }

  return `/${locale}/${route}${query ? `?${query}` : ""}`;
}

function configuredSecrets() {
  const accessCode = process.env.DEMO_ACCESS_CODE;
  const signingSecret = process.env.DEMO_GATE_SECRET;

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

function signature(expiresAt: string, signingSecret: string): string {
  return createHmac("sha256", signingSecret)
    .update(`sokopilot-demo-gate:v1:${expiresAt}`)
    .digest("hex");
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
      "Demo access requires DEMO_ACCESS_CODE (12+ characters) and DEMO_GATE_SECRET (32+ characters).",
    );
  }

  const expiresAt = String(
    Math.floor(Date.now() / 1000) + DEMO_GATE_TTL_SECONDS,
  );
  const cookieStore = await cookies();
  cookieStore.set(
    DEMO_GATE_COOKIE,
    `${expiresAt}.${signature(expiresAt, secrets.signingSecret)}`,
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
  const [expiresAt, suppliedSignature] = value?.split(".", 2) ?? [];
  if (
    !expiresAt ||
    !/^\d+$/.test(expiresAt) ||
    !suppliedSignature ||
    !/^[a-f0-9]{64}$/.test(suppliedSignature)
  ) {
    return false;
  }

  await connection();
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  return equalSecret(
    suppliedSignature,
    signature(expiresAt, secrets.signingSecret),
  );
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
