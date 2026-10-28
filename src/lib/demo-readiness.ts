import "server-only";

import { db } from "@/prisma/db";
import { getDemoMerchantId } from "@/lib/demo-tenant";
import { isDemoGateConfigured } from "@/lib/demo-gate";
import { isMetaModelConfigured } from "@/lib/meta-model-protocol";

export type DemoReadiness = {
  database: boolean;
  whatsapp: boolean;
  metaModel: boolean;
  demoGate: boolean;
};

export async function getDemoReadiness(): Promise<DemoReadiness> {
  let database = false;
  let whatsapp = false;
  const demoMerchantId = getDemoMerchantId();
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const merchant = await db.orm.public.Merchant.first({
        id: demoMerchantId,
      });
      database = Boolean(merchant);
      if (merchant) {
        const connection = await db.orm.public.WhatsAppConnection.first({
          merchantId: merchant.id,
          status: "connected",
        });
        whatsapp = Boolean(
          connection &&
          process.env.META_APP_SECRET?.trim() &&
          process.env.META_WEBHOOK_VERIFY_TOKEN?.trim() &&
          process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY?.trim() &&
          process.env.META_GRAPH_API_VERSION?.trim(),
        );
      }
    } catch (error) {
      console.error(
        "[demo-readiness] Database check failed.",
        error instanceof Error ? error.name : "UnknownError",
      );
    }
  }

  return {
    database,
    whatsapp,
    metaModel: isMetaModelConfigured({
      url: process.env.META_MODEL_API_URL,
      model: process.env.META_MODEL_NAME,
      apiKey: process.env.META_MODEL_API_KEY,
    }),
    demoGate: isDemoGateConfigured(),
  };
}
