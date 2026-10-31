import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export function getDemoMerchantId(): string {
  const demoMerchantId =
    process.env.SOKOPILOT_MERCHANT_ID?.trim() ||
    process.env.DEMO_MERCHANT_ID?.trim();

  if (!demoMerchantId) {
    throw new Error(
      "SOKOPILOT_MERCHANT_ID is required but not set. Configure the workspace merchant identifier and initialize the workspace.",
    );
  }
  return demoMerchantId;
}

export function demoDatabaseWritesEnabled(): boolean {
  return (
    process.env.SOKOPILOT_DATABASE_WRITES_ENABLED === "YES" ||
    process.env.SOKOPILOT_DEMO_DB_WRITE_APPROVED === "YES"
  );
}
