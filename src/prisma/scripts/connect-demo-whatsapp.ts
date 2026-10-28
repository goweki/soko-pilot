import { createHash } from "node:crypto";
import { db } from "../db";
import {
  getDemoMerchantId,
  demoDatabaseWritesEnabled,
} from "../../lib/demo-tenant";
import { encryptWhatsAppToken } from "../../lib/whatsapp-token";

async function connectDemoWhatsApp() {
  const demoMerchantId = getDemoMerchantId();
  const wabaId = process.env.META_WABA_ID?.trim();
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.META_ACCESS_TOKEN?.trim();
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN?.trim();

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error(
      "Set DATABASE_URL to a dedicated demo/development database first.",
    );
  }
  if (!demoDatabaseWritesEnabled()) {
    throw new Error(
      "Set SOKOPILOT_DEMO_DB_WRITE_APPROVED=YES only after verifying the dedicated demo database.",
    );
  }
  if (!wabaId || !phoneNumberId || !accessToken || !verifyToken) {
    throw new Error(
      "Set META_WABA_ID, META_PHONE_NUMBER_ID, META_ACCESS_TOKEN, and META_WEBHOOK_VERIFY_TOKEN.",
    );
  }

  const merchant = await db.orm.public.Merchant.first({ id: demoMerchantId });
  if (!merchant) {
    throw new Error(
      "Seed the synthetic demo merchant before connecting WhatsApp.",
    );
  }
  const existingConnection = await db.orm.public.WhatsAppConnection.first({
    phoneNumberId,
  });
  if (existingConnection && existingConnection.merchantId !== merchant.id) {
    throw new Error(
      "Configured WhatsApp phone number is already connected to a different merchant.",
    );
  }

  const accessTokenCiphertext = encryptWhatsAppToken(accessToken);
  const verifyTokenHash = createHash("sha256")
    .update(verifyToken)
    .digest("hex");
  const now = new Date().toISOString();
  await db.orm.public.WhatsAppConnection.where({ phoneNumberId }).upsert({
    create: {
      merchantId: merchant.id,
      wabaId,
      phoneNumberId,
      displayPhoneNumber: process.env.META_DISPLAY_PHONE_NUMBER?.trim() || null,
      status: "connected",
      accessTokenCiphertext,
      verifyTokenHash,
      connectedAt: now,
    },
    update: {
      merchantId: merchant.id,
      wabaId,
      displayPhoneNumber: process.env.META_DISPLAY_PHONE_NUMBER?.trim() || null,
      status: "connected",
      accessTokenCiphertext,
      verifyTokenHash,
      connectedAt: now,
    },
  });
}

(async () => {
  try {
    await connectDemoWhatsApp();
    console.info(
      "Demo WhatsApp connection stored with an encrypted access token.",
    );
  } catch (error) {
    console.error(
      "Demo WhatsApp connection setup failed.",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exitCode = 1;
  } finally {
    await db.close();
  }
})();
