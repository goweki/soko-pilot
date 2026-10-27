export const DEMO_MERCHANT_ID =
  process.env.DEMO_MERCHANT_ID?.trim() || "sokopilot-demo-merchant";

export function demoDatabaseWritesEnabled(): boolean {
  return process.env.SOKOPILOT_DEMO_DB_WRITE_APPROVED === "YES";
}
