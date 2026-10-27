import { createHmac, timingSafeEqual } from "node:crypto";
import { processWhatsAppWebhook } from "@/lib/whatsapp-webhook";

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function GET(request: Request) {
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!verifyToken) {
    return Response.json(
      { error: "WhatsApp webhook verification is not configured." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const suppliedToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode !== "subscribe" ||
    !suppliedToken ||
    !challenge ||
    !constantTimeEqual(suppliedToken, verifyToken)
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return Response.json(
      { error: "WhatsApp webhook signature verification is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!signature?.startsWith("sha256=")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (body.byteLength > 1_000_000) {
    return Response.json({ error: "Webhook payload is too large." }, { status: 413 });
  }
  const expectedSignature = `sha256=${createHmac("sha256", appSecret)
    .update(body)
    .digest("hex")}`;

  if (!constantTimeEqual(signature, expectedSignature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await processWhatsAppWebhook(body);
  if (!result.ok) {
    const status = result.error === "invalid-payload" ? 400 : 503;
    return Response.json({ error: result.error }, { status });
  }
  return Response.json(result, { status: 200 });
}
