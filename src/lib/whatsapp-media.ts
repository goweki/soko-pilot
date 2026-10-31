import "server-only";

export const MAX_WHATSAPP_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function downloadWhatsAppImage(
  mediaId: string,
  accessToken: string,
): Promise<{ mimeType: string; bytes: Buffer }> {
  const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() ?? "";
  if (!/^v\d+\.\d+$/.test(graphVersion)) {
    throw new Error("WHATSAPP_NOT_CONFIGURED");
  }
  const metadataResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(mediaId)}`,
    {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    },
  );
  if (!metadataResponse.ok) throw new Error(`WHATSAPP_MEDIA_META_${metadataResponse.status}`);
  const metadata: unknown = await metadataResponse.json();
  if (
    typeof metadata !== "object" || metadata === null ||
    typeof (metadata as { url?: unknown }).url !== "string" ||
    typeof (metadata as { mime_type?: unknown }).mime_type !== "string"
  ) throw new Error("WHATSAPP_MEDIA_INVALID_METADATA");

  const url = new URL((metadata as { url: string }).url);
  if (
    url.protocol !== "https:" ||
    !(url.hostname === "lookaside.fbsbx.com" || url.hostname.endsWith(".fbcdn.net"))
  ) throw new Error("WHATSAPP_MEDIA_UNTRUSTED_URL");
  const mimeType = (metadata as { mime_type: string }).mime_type.toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) throw new Error("WHATSAPP_MEDIA_UNSUPPORTED_TYPE");

  const response = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
    redirect: "error",
  });
  if (!response.ok) throw new Error(`WHATSAPP_MEDIA_DOWNLOAD_${response.status}`);
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_WHATSAPP_IMAGE_BYTES) throw new Error("WHATSAPP_MEDIA_TOO_LARGE");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_WHATSAPP_IMAGE_BYTES) {
    throw new Error("WHATSAPP_MEDIA_TOO_LARGE");
  }
  return { mimeType, bytes };
}
