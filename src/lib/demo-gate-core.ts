import { createHmac, timingSafeEqual } from "node:crypto";
import type { Locale } from "@/lib/i18n";

const allowedRoutes = new Set([
  "dashboard",
  "dashboard/conversations",
  "dashboard/products",
  "dashboard/recovery",
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

function gateSignature(expiresAt: string, signingSecret: string): string {
  return createHmac("sha256", signingSecret)
    .update(`sokopilot-demo-gate:v1:${expiresAt}`)
    .digest("hex");
}

function equalSecret(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

export function createDemoGateCookieValue(
  expiresAt: string,
  signingSecret: string,
): string {
  return `${expiresAt}.${gateSignature(expiresAt, signingSecret)}`;
}

export function verifyDemoGateCookieValue(
  value: string | undefined,
  signingSecret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const [expiresAt, suppliedSignature] = value?.split(".", 2) ?? [];
  if (
    !expiresAt ||
    !/^\d+$/.test(expiresAt) ||
    !suppliedSignature ||
    !/^[a-f0-9]{64}$/.test(suppliedSignature)
  ) {
    return false;
  }
  if (Number(expiresAt) <= nowSeconds) return false;
  return equalSecret(
    suppliedSignature,
    gateSignature(expiresAt, signingSecret),
  );
}
