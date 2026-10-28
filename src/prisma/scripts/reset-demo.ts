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

async function resetDemoData() {
  const demoMerchantId = getDemoMerchantId();

  await db.transaction(async (tx) => {
    // 1. Find or create the demo owner.
    const userById = await tx.orm.public.User.first({
      id: demoMerchantId,
    });

    const userByEmail = await tx.orm.public.User.first({
      email: demoUserEmail,
    });

    if (userById && userByEmail && userById.id !== userByEmail.id) {
      throw new Error(
        `The demo ID and email belong to different users. Resolve the conflict for ${demoUserEmail} before seeding.`,
      );
    }

    const existingUser = userById ?? userByEmail;
    const ownerId = existingUser?.id ?? demoMerchantId;

    const userPayload = {
      email: demoUserEmail,
      name: "Demo workspace owner",
      isActive: true,
    };

    if (existingUser) {
      await tx.orm.public.User.where({
        id: ownerId,
      }).update(userPayload);
    } else {
      await tx.orm.public.User.create({
        id: ownerId,
        ...userPayload,
      });
    }

    // 2. Find the merchant already owned by this user.
    // Reuse it to respect the unique Merchant.ownerId constraint.
    const merchantByOwner = await tx.orm.public.Merchant.first({
      ownerId,
    });

    const merchantById = await tx.orm.public.Merchant.first({
      id: demoMerchantId,
    });

    const existingMerchant = merchantByOwner ?? merchantById;
    const merchantId = existingMerchant?.id ?? demoMerchantId;

    const merchantPayload = {
      ownerId,
      businessName: "Atelier Nia",
      defaultCurrency: "KES",
      defaultLanguage: "en",
      status: "active" as const,
    };

    if (existingMerchant) {
      await tx.orm.public.Merchant.where({
        id: merchantId,
      }).update(merchantPayload);
    } else {
      await tx.orm.public.Merchant.create({
        id: merchantId,
        ...merchantPayload,
      });
    }

    // 3. Find or create the assistant configuration.
    const existingAssistant = await tx.orm.public.AssistantConfig.where({
      merchantId,
    }).first();

    let assistantId: string;

    const assistantPayload = {
      merchantId,
      isActive: false,
      modelProvider: "meta",
      modelName: "NOT_CONFIGURED",
      language: "en",
    };

    if (existingAssistant) {
      assistantId = existingAssistant.id;

      await tx.orm.public.AssistantConfig.where({
        id: assistantId,
      }).update({
        isActive: assistantPayload.isActive,
        modelProvider: assistantPayload.modelProvider,
        modelName: assistantPayload.modelName,
        language: assistantPayload.language,
      });
    } else {
      assistantId = `demo-assistant-${merchantId}`;

      const assistantById = await tx.orm.public.AssistantConfig.first({
        id: assistantId,
      });

      if (assistantById) {
        throw new Error(
          `Assistant ID ${assistantId} already exists for another configuration.`,
        );
      }

      await tx.orm.public.AssistantConfig.create({
        id: assistantId,
        ...assistantPayload,
      });
    }

    // 4. Find or create assistant tools sequentially.
    const assistantTools = [
      ["search_catalogue", true],
      ["create_pending_order", false],
      ["get_customer_order", false],
    ] as const;

    for (const [tool, isEnabled] of assistantTools) {
      const existingTool = await tx.orm.public.AssistantTool.where({
        assistantId,
        tool,
      }).first();

      if (existingTool) {
        await tx.orm.public.AssistantTool.where({
          assistantId,
          tool,
        }).update({ isEnabled });
      } else {
        await tx.orm.public.AssistantTool.create({
          assistantId,
          tool,
          isEnabled,
        });
      }
    }

    // 5. Find or create products and variants.
    for (const item of products) {
      const productByName = await tx.orm.public.Product.where({
        merchantId,
        name: item.name,
      }).first();

      const productById = productByName
        ? null
        : await tx.orm.public.Product.first({
            id: item.id,
          });

      if (productById && productById.merchantId !== merchantId) {
        throw new Error(
          `Product ID ${item.id} already belongs to another merchant.`,
        );
      }

      const existingProduct = productByName ?? productById;
      const productId = existingProduct?.id ?? item.id;

      const productPayload = {
        merchantId,
        name: item.name,
        description: item.description,
        category: item.category,
        status: "active" as const,
      };

      if (existingProduct) {
        await tx.orm.public.Product.where({
          id: productId,
        }).update(productPayload);
      } else {
        await tx.orm.public.Product.create({
          id: productId,
          ...productPayload,
        });
      }

      const existingVariant = await tx.orm.public.ProductVariant.where({
        productId,
        sku: item.sku,
      }).first();

      const variantId =
        existingVariant?.id ?? `demo-variant-${item.sku.toLowerCase()}`;

      const variantPayload = {
        productId,
        sku: item.sku,
        label: item.label,
        size: item.size,
        color: item.color,
        priceMinor: item.priceMinor,
        currency: "KES",
        stockQuantity: item.stockQuantity,
        isActive: true,
      };

      if (existingVariant) {
        await tx.orm.public.ProductVariant.where({
          id: existingVariant.id,
        }).update(variantPayload);
      } else {
        const variantById = await tx.orm.public.ProductVariant.first({
          id: variantId,
        });

        if (variantById) {
          throw new Error(
            `Variant ID ${variantId} already exists for another variant.`,
          );
        }

        await tx.orm.public.ProductVariant.create({
          id: variantId,
          ...variantPayload,
        });
      }
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

    await resetDemoData();

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
