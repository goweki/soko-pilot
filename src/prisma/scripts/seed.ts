import { db } from "../db";
import {
  getDemoMerchantId,
  demoDatabaseWritesEnabled,
} from "@/lib/demo-tenant";

const demoUserEmail = "demo@goweki.com";

const products = [
  {
    id: "demo-product-kito-linen",
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
    id: "demo-product-maua-wrap",
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
    id: "demo-product-nia-scarf",
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
] as const;

async function seedDemoData() {
  const demoMerchantId = getDemoMerchantId();

  await db.transaction(async (tx) => {
    // 1. User: adopt an existing user by ID or email.
    const userById = await tx.orm.public.User.first({
      id: demoMerchantId,
    });

    const userByEmail = userById
      ? null
      : await tx.orm.public.User.first({
          email: demoUserEmail,
        });

    const ownerId = userById?.id ?? userByEmail?.id ?? demoMerchantId;

    await tx.orm.public.User.where({ id: ownerId }).upsert({
      create: {
        id: ownerId,
        email: demoUserEmail,
        name: "Demo workspace owner",
        isActive: true,
      },
      update: {
        email: demoUserEmail,
        name: "Demo workspace owner",
        isActive: true,
      },
    });

    // 2. Merchant: stable primary key.
    await tx.orm.public.Merchant.where({
      id: demoMerchantId,
    }).upsert({
      create: {
        id: demoMerchantId,
        ownerId,
        businessName: "Atelier Nia",
        defaultCurrency: "KES",
        defaultLanguage: "en",
      },
      update: {
        ownerId,
        businessName: "Atelier Nia",
        defaultCurrency: "KES",
        defaultLanguage: "en",
        status: "active",
      },
    });

    // 3. Assistant configuration: one configuration per merchant.
    const existingAssistant = await tx.orm.public.AssistantConfig.where({
      merchantId: demoMerchantId,
    }).first();

    const assistantId =
      existingAssistant?.id ?? `demo-assistant-${demoMerchantId}`;

    await tx.orm.public.AssistantConfig.where({
      merchantId: demoMerchantId,
    }).upsert({
      create: {
        id: assistantId,
        merchantId: demoMerchantId,
        isActive: false,
        modelProvider: "meta",
        modelName: "NOT_CONFIGURED",
        language: "en",
      },
      update: {
        isActive: false,
        modelProvider: "meta",
        modelName: "NOT_CONFIGURED",
        language: "en",
      },
    });

    // 4. Assistant tools: synchronize enabled state.
    const assistantTools = [
      ["search_catalogue", true],
      ["create_pending_order", false],
      ["get_customer_order", false],
    ] as const;

    await Promise.all(
      assistantTools.map(([tool, isEnabled]) =>
        tx.orm.public.AssistantTool.where({
          assistantId,
          tool,
        }).upsert({
          create: {
            assistantId,
            tool,
            isEnabled,
          },
          update: {
            isEnabled,
          },
        }),
      ),
    );

    // 5. Products and variants: reuse existing records where possible.
    for (const item of products) {
      const existingProduct = await tx.orm.public.Product.where({
        merchantId: demoMerchantId,
        name: item.name,
      }).first();

      const productId = existingProduct?.id ?? item.id;

      await tx.orm.public.Product.where({
        id: productId,
      }).upsert({
        create: {
          id: productId,
          merchantId: demoMerchantId,
          name: item.name,
          description: item.description,
          category: item.category,
          status: "active",
        },
        update: {
          merchantId: demoMerchantId,
          name: item.name,
          description: item.description,
          category: item.category,
          status: "active",
        },
      });

      const existingVariant = await tx.orm.public.ProductVariant.where({
        productId,
        sku: item.sku,
      }).first();

      const variantId =
        existingVariant?.id ?? `demo-variant-${item.sku.toLowerCase()}`;

      const variantPayload = {
        label: item.label,
        size: item.size,
        color: item.color,
        priceMinor: item.priceMinor,
        currency: "KES",
        stockQuantity: item.stockQuantity,
        isActive: true,
      };

      await tx.orm.public.ProductVariant.where({
        id: variantId,
      }).upsert({
        create: {
          id: variantId,
          productId,
          sku: item.sku,
          ...variantPayload,
        },
        update: {
          productId,
          sku: item.sku,
          ...variantPayload,
        },
      });
    }
  });
}

async function main() {
  try {
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

    await seedDemoData();

    console.info("Synthetic SokoPilot demo catalogue seeded successfully.");
  } catch (error) {
    console.error(
      "Demo seed failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

void main();
