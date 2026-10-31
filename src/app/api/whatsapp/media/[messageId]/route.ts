import { db } from "@/prisma/db";
import { getDemoMerchantId } from "@/lib/demo-tenant";
import { hasDemoAccess } from "@/lib/demo-gate";
import { decryptWhatsAppToken } from "@/lib/whatsapp-token";
import { downloadWhatsAppImage } from "@/lib/whatsapp-media";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  if (!(await hasDemoAccess())) return new Response("Unauthorized", { status: 401 });
  const { messageId } = await params;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(messageId)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const merchantId = getDemoMerchantId();
    const message = await db.orm.public.Message.include("whatsappConnection")
      .where({ id: messageId, contentType: "image" })
      .first();
    if (!message?.mediaId || message.whatsappConnection.merchantId !== merchantId) {
      return new Response("Not found", { status: 404 });
    }
    const conversation = await db.orm.public.Conversation.first({
      id: message.conversationId,
      merchantId,
    });
    if (!conversation) return new Response("Not found", { status: 404 });
    const accessToken = decryptWhatsAppToken(
      message.whatsappConnection.accessTokenCiphertext,
    );
    const image = await downloadWhatsAppImage(message.mediaId, accessToken);
    return new Response(new Uint8Array(image.bytes), {
      status: 200,
      headers: {
        "content-type": image.mimeType,
        "content-length": String(image.bytes.byteLength),
        "cache-control": "private, no-store",
        "content-security-policy": "default-src 'none'; sandbox",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
      },
    });
  } catch (error) {
    console.error("[whatsapp-media] Protected image retrieval failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return new Response("Image unavailable", { status: 502 });
  }
}
