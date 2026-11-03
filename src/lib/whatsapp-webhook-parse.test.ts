import assert from "node:assert/strict";
import test from "node:test";
import {
  getWebhookContentType,
  isOptOutMessage,
  parseWhatsAppChanges,
} from "./whatsapp-webhook-parse";

function payloadWith(messages: unknown[], extra: Record<string, unknown> = {}) {
  return {
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: "phone-1" },
              contacts: [
                { wa_id: "254700000001", profile: { name: "Amina" } },
              ],
              messages,
              ...extra,
            },
          },
        ],
      },
    ],
  };
}

test("webhook parser extracts text, image, and interactive messages with contact names", () => {
  const changes = parseWhatsAppChanges(
    payloadWith([
      {
        id: "m1",
        from: "254700000001",
        type: "text",
        text: { body: "How much is the shirt?" },
      },
      {
        id: "m2",
        from: "254700000001",
        type: "image",
        image: { id: "media-1", caption: "This one?" },
      },
      {
        id: "m3",
        from: "254700000001",
        type: "interactive",
        interactive: { button_reply: { id: "request_human", title: "Talk" } },
      },
    ]),
  );
  assert.equal(changes?.length, 1);
  assert.equal(changes?.[0].phoneNumberId, "phone-1");
  assert.deepEqual(
    changes?.[0].messages.map((m) => [m.id, m.body, m.mediaId]),
    [
      ["m1", "How much is the shirt?", null],
      ["m2", "This one?", "media-1"],
      ["m3", "I would like to speak to a person.", null],
    ],
  );
  assert.equal(changes?.[0].messages[0].displayName, "Amina");
});

test("webhook parser maps known interactive replies and falls back to the title", () => {
  const changes = parseWhatsAppChanges(
    payloadWith([
      {
        id: "m4",
        from: "254700000001",
        type: "interactive",
        interactive: { list_reply: { id: "custom", title: "Custom choice" } },
      },
      {
        id: "m5",
        from: "254700000001",
        type: "interactive",
        interactive: { button_reply: { id: "resolved", title: "Done" } },
      },
    ]),
  );
  assert.equal(changes?.[0].messages[0].body, "Custom choice");
  assert.equal(changes?.[0].messages[1].body, "That helps, thank you.");
});

test("webhook parser extracts delivery statuses and bounded error details", () => {
  const changes = parseWhatsAppChanges(
    payloadWith([], {
      statuses: [
        {
          id: "wamid.1",
          status: "failed",
          recipient_id: "254700000001",
          timestamp: "1700000000",
          errors: [{ code: 131047, title: "Re-engagement", message: "Window closed" }],
        },
      ],
    }),
  );
  assert.deepEqual(changes?.[0].statuses, [
    {
      id: "wamid.1",
      status: "failed",
      recipientId: "254700000001",
      timestamp: "1700000000",
      errors: [{ code: "131047", title: "Re-engagement", detail: "Window closed" }],
    },
  ]);
});

test("webhook parser rejects malformed payloads instead of guessing", () => {
  assert.equal(parseWhatsAppChanges(null), null);
  assert.equal(parseWhatsAppChanges("payload"), null);
  assert.equal(parseWhatsAppChanges({}), null);
  assert.equal(parseWhatsAppChanges({ entry: [{ changes: "x" }] }), null);
  assert.equal(
    parseWhatsAppChanges({ entry: [{ changes: [{ value: {} }] }] }),
    null,
  );
  assert.equal(
    parseWhatsAppChanges(
      payloadWith([{ from: "254700000001", type: "text" }]),
    ),
    null,
  );
  assert.equal(
    parseWhatsAppChanges(payloadWith([], { messages: "not-an-array" })),
    null,
  );
});

test("opt-out detection accepts only exact stop commands", () => {
  assert.equal(isOptOutMessage("STOP"), true);
  assert.equal(isOptOutMessage(" stop all "), true);
  assert.equal(isOptOutMessage("Unsubscribe"), true);
  assert.equal(isOptOutMessage("please stop messaging me"), false);
  assert.equal(isOptOutMessage("stop, how much is it?"), false);
  assert.equal(isOptOutMessage(null), false);
  assert.equal(isOptOutMessage(""), false);
});

test("webhook content type mapping keeps unknown types explicit", () => {
  assert.equal(getWebhookContentType("text"), "text");
  assert.equal(getWebhookContentType("image"), "image");
  assert.equal(getWebhookContentType("sticker"), "sticker");
  assert.equal(getWebhookContentType("reaction"), "unknown");
  assert.equal(getWebhookContentType(""), "unknown");
});
