import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sweepSalesRecovery } from "@/lib/sales-recovery-store";

async function handleSweep(request: Request) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; manual callers
  // may use the dedicated SALES_RECOVERY_CRON_SECRET instead.
  const secrets = [
    process.env.SALES_RECOVERY_CRON_SECRET,
    process.env.CRON_SECRET,
  ];
  if (!secrets.some((value) => value?.trim()))
    return Response.json({ error: "not-configured" }, { status: 503 });
  if (
    !isAuthorizedCronRequest(request.headers.get("authorization"), secrets)
  ) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sweepSalesRecovery();
  return Response.json(result, { status: result.ok ? 200 : 503 });
}

export async function GET(request: Request) {
  return handleSweep(request);
}

export async function POST(request: Request) {
  return handleSweep(request);
}
