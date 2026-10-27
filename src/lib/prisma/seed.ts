import "dotenv/config";
import { db } from "../../prisma/db";
import {
  DEMO_MERCHANT_ID,
  demoDatabaseWritesEnabled,
} from "../demo-tenant";

const demoOwnerId = "sokopilot-demo-owner";

const products = [
  {
    name: "Kito linen shirt",
    description: "Breathable linen shirt in a relaxed cut.",
    category: "Clothing",
    sku: "KITO-LINEN-S",
    label: "Small",
    size: "S",
    color: "Sand",
    priceMinor: 420000,
    stockQuantity: 8,
  },
  {
    name: "Maua cotton wrap",
    description: "Lightweight cotton wrap in a versatile print.",
    category: "Accessories",
    sku: "MAUA-WRAP-ONE",
    label: "One size",
    size: null,
    color: "Indigo",
    priceMinor: 180000,
    stockQuantity: 12,
  },
  {
    name: "Nia silk scarf",
    description: "A soft silk scarf in a limited seasonal color.",
    category: "Accessories",
    sku: "NIA-SILK-ONE",
    label: "One size",
    size: null,
    color: "Rose",
    priceMinor: 650000,
    stockQuantity: 0,
  },
];

async function seedDemoData() {
  await db.transaction(async (tx) => {
    const owner = await tx.orm.public.User.first({ id: demoOwnerId });
    if (owner && owner.email !== "demo-owner@sokopilot.invalid") {
      throw new Error("Demo owner ID already belongs to a different account.");
    }
    if (owner) {
      await tx.orm.public.User.where({ id: demoOwnerId }).update({
        name: "Demo workspace owner",
        isActive: true,
      });
    } else {
      await tx.orm.public.User.create({
        id: demoOwnerId,
        email: "demo-owner@sokopilot.invalid",
        name: "Demo workspace owner",
      });
    }

    const existingMerchant = await tx.orm.public.Merchant.first({
      id: DEMO_MERCHANT_ID,
    });
    if (existingMerchant && existingMerchant.ownerId !== demoOwnerId) {
      throw new Error(
        "Configured demo merchant ID is already owned by a different account.",
      );
    }
    if (existingMerchant) {
      await tx.orm.public.Merchant.where({
        id: DEMO_MERCHANT_ID,
        ownerId: demoOwnerId,
      }).update({
        businessName: "Atelier Nia",
        defaultCurrency: "KES",
        defaultLanguage: "en",
        status: "active",
      });
    } else {
      await tx.orm.public.Merchant.create({
        id: DEMO_MERCHANT_ID,
        ownerId: demoOwnerId,
        businessName: "Atelier Nia",
        defaultCurrency: "KES",
        defaultLanguage: "en",
      });
    }

    const assistant = await tx.orm.public.AssistantConfig
      .where({ merchantId: DEMO_MERCHANT_ID })
      .first();
    let assistantId: string;
    if (assistant) {
      assistantId = assistant.id;
      const updatedAssistant = await tx.orm.public.AssistantConfig
        .where({ id: assistant.id })
        .update({
          isActive: false,
          modelProvider: "meta",
          modelName: "NOT_CONFIGURED",
          language: "en",
        });
      if (!updatedAssistant) {
        throw new Error("Unable to update the demo assistant configuration.");
      }
    } else {
      const createdAssistant = await tx.orm.public.AssistantConfig.create({
          merchantId: DEMO_MERCHANT_ID,
          isActive: false,
          modelProvider: "meta",
          modelName: "NOT_CONFIGURED",
          language: "en",
        });
      assistantId = createdAssistant.id;
    }

    for (const [tool, isEnabled] of [
      ["search_catalogue", true],
      ["create_pending_order", false],
      ["get_customer_order", false],
    ] as const) {
      await tx.orm.public.AssistantTool
        .where({ assistantId, tool })
        .upsert({
        create: { assistantId, tool, isEnabled },
        update: { isEnabled },
      });
    }

    for (const item of products) {
      const existingProduct = await tx.orm.public.Product
        .where({ merchantId: DEMO_MERCHANT_ID, name: item.name })
        .first();
      const product = existingProduct
        ? existingProduct
        : await tx.orm.public.Product.create({
            merchantId: DEMO_MERCHANT_ID,
            name: item.name,
            description: item.description,
            category: item.category,
            status: "active",
          });
      const existingVariant = await tx.orm.public.ProductVariant
        .where({ productId: product.id, sku: item.sku })
        .first();

      if (existingVariant) {
        await tx.orm.public.ProductVariant
          .where({ id: existingVariant.id })
          .update({
            label: item.label,
            size: item.size,
            color: item.color,
            priceMinor: item.priceMinor,
            currency: "KES",
            stockQuantity: item.stockQuantity,
            isActive: true,
          });
      } else {
        await tx.orm.public.ProductVariant.create({
          productId: product.id,
          sku: item.sku,
          label: item.label,
          size: item.size,
          color: item.color,
          priceMinor: item.priceMinor,
          currency: "KES",
          stockQuantity: item.stockQuantity,
          isActive: true,
        });
      }
    }
  });
}

try {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("Set DATABASE_URL to a dedicated demo/development database first.");
  }
  if (!demoDatabaseWritesEnabled()) {
    throw new Error("Set SOKOPILOT_DEMO_DB_WRITE_APPROVED=YES only after verifying the dedicated demo database.");
  }
  await seedDemoData();
  console.info("Synthetic SokoPilot demo catalogue seeded.");
} catch (error) {
  console.error(
    "Demo seed failed.",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
} finally {
  await db.close();
}
