export type JsonRecord = Record<string, unknown>;

export type InboundMessage = {
  id: string;
  from: string;
  type: string;
  body: string | null;
  mediaId: string | null;
  displayName: string | null;
};

export type IncomingChange = {
  phoneNumberId: string;
  messages: InboundMessage[];
  statuses: {
    id: string;
    status: string;
    recipientId: string | null;
    timestamp: string | null;
    errors: {
      code: string | null;
      title: string | null;
      detail: string | null;
    }[];
  }[];
};

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getWebhookContentType(
  type: string,
): "text" | "image" | "audio" | "video" | "document" | "sticker" | "unknown" {
  switch (type) {
    case "text":
    case "image":
    case "audio":
    case "video":
    case "document":
    case "sticker":
      return type;
    default:
      return "unknown";
  }
}

export function isOptOutMessage(body: string | null | undefined): boolean {
  return Boolean(body && /^(?:stop|stop all|unsubscribe)$/i.test(body.trim()));
}

function readMediaId(message: JsonRecord, type: string): string | null {
  const media = message[type];
  return isRecord(media) ? getString(media.id) : null;
}

export function parseWhatsAppChanges(payload: unknown): IncomingChange[] | null {
  if (!isRecord(payload) || !Array.isArray(payload.entry)) return null;
  const changes: IncomingChange[] = [];

  for (const entry of payload.entry) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) return null;
    for (const change of entry.changes) {
      if (!isRecord(change) || !isRecord(change.value)) return null;
      const value = change.value;
      const metadata = value.metadata;
      if (!isRecord(metadata)) return null;
      const phoneNumberId = getString(metadata.phone_number_id);
      if (!phoneNumberId) return null;

      const names = new Map<string, string>();
      if (Array.isArray(value.contacts)) {
        for (const contact of value.contacts) {
          if (!isRecord(contact)) continue;
          const waId = getString(contact.wa_id);
          const profile = contact.profile;
          const name = isRecord(profile) ? getString(profile.name) : null;
          if (waId && name) names.set(waId, name.slice(0, 120));
        }
      }

      const messages: InboundMessage[] = [];
      if (value.messages !== undefined && !Array.isArray(value.messages))
        return null;
      for (const message of Array.isArray(value.messages)
        ? value.messages
        : []) {
        if (!isRecord(message)) return null;
        const id = getString(message.id);
        const from = getString(message.from);
        const type = getString(message.type);
        if (!id || !from || !type) return null;
        const text = message.text;
        const image = message.image;
        const interactive = message.interactive;
        const interactiveReply = isRecord(interactive)
          ? isRecord(interactive.button_reply)
            ? interactive.button_reply
            : isRecord(interactive.list_reply)
              ? interactive.list_reply
              : null
          : null;
        const body =
          type === "text" && isRecord(text)
            ? getString(text.body)
            : type === "image" && isRecord(image)
              ? getString(image.caption)
              : type === "interactive" && interactiveReply
                ? getString(interactiveReply.id) === "request_human"
                  ? "I would like to speak to a person."
                  : getString(interactiveReply.id) === "product_details"
                    ? "Please tell me more about this product."
                    : getString(interactiveReply.id) === "resolved"
                      ? "That helps, thank you."
                      : getString(interactiveReply.title)
                : null;
        messages.push({
          id,
          from,
          type,
          body: body?.slice(0, 4000) ?? null,
          mediaId: readMediaId(message, type),
          displayName: names.get(from) ?? null,
        });
      }

      const statuses: IncomingChange["statuses"] = [];
      if (value.statuses !== undefined && !Array.isArray(value.statuses)) {
        return null;
      }
      for (const status of Array.isArray(value.statuses)
        ? value.statuses
        : []) {
        if (!isRecord(status)) return null;
        const id = getString(status.id);
        const currentStatus = getString(status.status);
        if (!id || !currentStatus) return null;
        const errors: IncomingChange["statuses"][number]["errors"] = [];
        for (const error of Array.isArray(status.errors) ? status.errors : []) {
          if (!isRecord(error)) continue;
          errors.push({
            code:
              typeof error.code === "string" || typeof error.code === "number"
                ? String(error.code).slice(0, 40)
                : null,
            title:
              typeof error.title === "string"
                ? error.title.slice(0, 160)
                : null,
            detail:
              typeof error.message === "string"
                ? error.message.slice(0, 240)
                : isRecord(error.error_data) &&
                    typeof error.error_data.details === "string"
                  ? error.error_data.details.slice(0, 240)
                  : null,
          });
        }
        statuses.push({
          id,
          status: currentStatus,
          recipientId: getString(status.recipient_id),
          timestamp: getString(status.timestamp),
          errors,
        });
      }
      changes.push({ phoneNumberId, messages, statuses });
    }
  }

  return changes;
}
