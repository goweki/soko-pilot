"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { hasDemoAccess } from "@/lib/demo-gate";
import { getDemoMerchantId, demoDatabaseWritesEnabled } from "@/lib/demo-tenant";
import { encryptWhatsAppToken } from "@/lib/whatsapp-token";
import { isLocale, type Locale } from "@/lib/i18n";
import { db } from "@/prisma/db";

type SignupError =
  | "invalid-input"
  | "not-authorized"
  | "not-configured"
  | "database-not-configured"
  | "number-already-linked"
  | "waba-already-linked"
  | "meta-setup-failed"
  | "storage-unavailable";

export type WhatsAppSignupState =
  | { status: "success"; displayPhoneNumber: string | null }
  | { status: "error"; reason: SignupError };

type MetaError = { code?: number; type?: string; message?: string };
type MetaPayload = {
  access_token?: string;
  expires_in?: number;
  error?: MetaError;
  data?: Array<{
    id?: string;
    display_phone_number?: string;
    verified_name?: string;
  }>;
  success?: boolean | string;
};

function graphConfig() {
  const appId = process.env.META_APP_ID?.trim() ?? "";
  const appSecret = process.env.META_APP_SECRET?.trim() ?? "";
  const signupConfigId =
    process.env.META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() ?? "";
  const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() ?? "";
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN?.trim() ?? "";
  if (
    !appId ||
    !appSecret ||
    !signupConfigId ||
    !/^v\d+\.\d+$/.test(graphVersion) ||
    !verifyToken
  ) {
    return null;
  }
  return { appId, appSecret, graphVersion, verifyToken };
}

function validId(value: string): boolean {
  return /^\d{5,32}$/.test(value);
}

function metaSucceeded(payload: MetaPayload): boolean {
  return payload.success === true || payload.success === "true";
}

async function readMetaPayload(response: Response): Promise<MetaPayload> {
  try {
    const payload: unknown = await response.json();
    return typeof payload === "object" && payload !== null
      ? (payload as MetaPayload)
      : {};
  } catch {
    return {};
  }
}

async function metaRequest(
  graphVersion: string,
  path: string,
  accessToken: string,
  options: { method?: "GET" | "POST"; body?: Record<string, string> } = {},
) {
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${path}`,
    {
      method: options.method ?? "GET",
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(options.body ? { "content-type": "application/json" } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    },
  );
  const payload = await readMetaPayload(response);
  return { ok: response.ok, status: response.status, payload };
}

function logMetaFailure(stage: string, status: number, error?: MetaError) {
  console.error("[whatsapp-embedded-signup] Meta request failed.", {
    stage,
    status,
    metaCode: error?.code ?? null,
    metaType: error?.type ?? null,
  });
}

export async function finishWhatsAppEmbeddedSignup(
  input: {
    locale: string;
    code: string;
    wabaId: string;
    phoneNumberId: string;
    registrationPin: string;
  },
): Promise<WhatsAppSignupState> {
  if (
    !input ||
    typeof input.locale !== "string" ||
    !isLocale(input.locale) ||
    typeof input.code !== "string" ||
    input.code.length < 8 ||
    input.code.length > 4096 ||
    typeof input.wabaId !== "string" ||
    !validId(input.wabaId) ||
    typeof input.phoneNumberId !== "string" ||
    !validId(input.phoneNumberId) ||
    typeof input.registrationPin !== "string" ||
    !/^\d{6}$/.test(input.registrationPin)
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
    return { status: "error", reason: "storage-unavailable" };
  }
  const config = graphConfig();
  if (!config) return { status: "error", reason: "not-configured" };

  try {
    const merchantId = getDemoMerchantId();
    const merchant = await db.orm.public.Merchant.first({ id: merchantId });
    if (!merchant) return { status: "error", reason: "storage-unavailable" };

    const existingPhone = await db.orm.public.WhatsAppConnection.first({
      phoneNumberId: input.phoneNumberId,
    });
    if (existingPhone && existingPhone.merchantId !== merchantId) {
      return { status: "error", reason: "number-already-linked" };
    }
    const existingWaba = await db.orm.public.WhatsAppConnection.where({
      merchantId,
      wabaId: input.wabaId,
    }).first();
    if (
      existingWaba &&
      existingWaba.phoneNumberId !== input.phoneNumberId
    ) {
      return { status: "error", reason: "waba-already-linked" };
    }

    const exchangeUrl = new URL(
      `https://graph.facebook.com/${config.graphVersion}/oauth/access_token`,
    );
    exchangeUrl.searchParams.set("client_id", config.appId);
    exchangeUrl.searchParams.set("client_secret", config.appSecret);
    exchangeUrl.searchParams.set("code", input.code);
    const exchangeResponse = await fetch(exchangeUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const exchange = await readMetaPayload(exchangeResponse);
    if (!exchangeResponse.ok || !exchange.access_token) {
      logMetaFailure("exchange-code", exchangeResponse.status, exchange.error);
      return { status: "error", reason: "meta-setup-failed" };
    }
    const accessToken = exchange.access_token;

    const phoneList = await metaRequest(
      config.graphVersion,
      `${input.wabaId}/phone_numbers?fields=id,display_phone_number,verified_name&limit=100`,
      accessToken,
    );
    if (!phoneList.ok) {
      logMetaFailure("verify-phone-number", phoneList.status, phoneList.payload.error);
      return { status: "error", reason: "meta-setup-failed" };
    }
    const selectedPhone = phoneList.payload.data?.find(
      (phone) => phone.id === input.phoneNumberId,
    );
    if (!selectedPhone) {
      console.error("[whatsapp-embedded-signup] Selected phone is not in the shared WABA.", {
        wabaId: input.wabaId,
        phoneNumberId: input.phoneNumberId,
      });
      return { status: "error", reason: "meta-setup-failed" };
    }

    const registration = await metaRequest(
      config.graphVersion,
      `${input.phoneNumberId}/register`,
      accessToken,
      {
        method: "POST",
        body: {
          messaging_product: "whatsapp",
          pin: input.registrationPin,
        },
      },
    );
    if (!registration.ok || !metaSucceeded(registration.payload)) {
      logMetaFailure("register-phone-number", registration.status, registration.payload.error);
      return { status: "error", reason: "meta-setup-failed" };
    }

    const subscription = await metaRequest(
      config.graphVersion,
      `${input.wabaId}/subscribed_apps`,
      accessToken,
      { method: "POST" },
    );
    if (!subscription.ok || !metaSucceeded(subscription.payload)) {
      logMetaFailure("subscribe-waba-webhooks", subscription.status, subscription.payload.error);
      return { status: "error", reason: "meta-setup-failed" };
    }

    const tokenExpiresAt =
      typeof exchange.expires_in === "number" && exchange.expires_in > 0
        ? new Date(Date.now() + exchange.expires_in * 1000).toISOString()
        : null;
    const connectionPayload = {
      merchantId,
      wabaId: input.wabaId,
      displayPhoneNumber: selectedPhone.display_phone_number ?? null,
      businessProfileName: selectedPhone.verified_name ?? null,
      status: "connected" as const,
      accessTokenCiphertext: encryptWhatsAppToken(accessToken),
      verifyTokenHash: createHash("sha256")
        .update(config.verifyToken)
        .digest("hex"),
      tokenExpiresAt,
      connectedAt: new Date().toISOString(),
    };

    await db.orm.public.WhatsAppConnection.where({
      phoneNumberId: input.phoneNumberId,
    }).upsert({
      create: {
        phoneNumberId: input.phoneNumberId,
        ...connectionPayload,
      },
      update: connectionPayload,
    });

    const locale = input.locale as Locale;
    revalidatePath(`/${locale}/settings`);
    revalidatePath(`/${locale}/dashboard`);
    return {
      status: "success",
      displayPhoneNumber: selectedPhone.display_phone_number ?? null,
    };
  } catch (error) {
    console.error("[whatsapp-embedded-signup] Setup failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { status: "error", reason: "storage-unavailable" };
  }
}
