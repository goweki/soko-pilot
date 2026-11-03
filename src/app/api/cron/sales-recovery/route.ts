import { timingSafeEqual } from "node:crypto";
import { sweepSalesRecovery } from "@/lib/sales-recovery-store";

function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handleSweep(request: Request) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; manual callers
  // may use the dedicated SALES_RECOVERY_CRON_SECRET instead.
  const secrets = [
    process.env.SALES_RECOVERY_CRON_SECRET?.trim(),
    process.env.CRON_SECRET?.trim(),
  ].filter((value): value is string => Boolean(value));
  if (!secrets.length)
    return Response.json({ error: "not-configured" }, { status: 503 });
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  if (
    !supplied ||
    !secrets.some((secret) => constantTimeEqual(supplied, secret))
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
