import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export function getDemoMerchantId(): string {
  const demoMerchantId = process.env.DEMO_MERCHANT_ID?.trim();

  if (!demoMerchantId) {
    throw new Error(
      "DEMO_MERCHANT_ID is required but not set. " +
        "Add it to your .env (e.g. DEMO_MERCHANT_ID=sokopilot-demo-owner) and re-run the seed.",
    );
  }
  return demoMerchantId;
}

export function demoDatabaseWritesEnabled(): boolean {
  return process.env.SOKOPILOT_DEMO_DB_WRITE_APPROVED === "YES";
}
