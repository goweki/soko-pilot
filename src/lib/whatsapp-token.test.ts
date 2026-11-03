import assert from "node:assert/strict";
import test from "node:test";
import { decryptWhatsAppToken, encryptWhatsAppToken } from "./whatsapp-token";

const KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function withKey(run: () => void) {
  const previous = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
  process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = KEY;
  try {
    run();
  } finally {
    if (previous === undefined) delete process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
    else process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = previous;
  }
}

test("whatsapp token encryption round-trips and uses a fresh IV", () => {
  withKey(() => {
    const first = encryptWhatsAppToken("token-value-123");
    const second = encryptWhatsAppToken("token-value-123");
    assert.match(first, /^v1:/);
    assert.notEqual(first, second);
    assert.equal(decryptWhatsAppToken(first), "token-value-123");
    assert.equal(decryptWhatsAppToken(second), "token-value-123");
  });
});

test("whatsapp token decryption rejects tampered or malformed values", () => {
  withKey(() => {
    const encrypted = encryptWhatsAppToken("token-value-123");
    const parts = encrypted.split(":");
    const flipped = parts[3].startsWith("A")
      ? `B${parts[3].slice(1)}`
      : `A${parts[3].slice(1)}`;
    const tampered = [...parts.slice(0, 3), flipped].join(":");
    assert.throws(() => decryptWhatsAppToken(tampered));
    assert.throws(() => decryptWhatsAppToken("not-a-token"));
    assert.throws(() => decryptWhatsAppToken("v2:aa:bb:cc"));
    assert.throws(() => decryptWhatsAppToken("v1::bb:cc"));
  });
});

test("whatsapp token encryption rejects a missing or malformed key", () => {
  const previous = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
  delete process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
  try {
    assert.throws(() => encryptWhatsAppToken("x"), /64 hexadecimal/);
    process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = "not-hex";
    assert.throws(() => encryptWhatsAppToken("x"), /64 hexadecimal/);
  } finally {
    if (previous === undefined) delete process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
    else process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = previous;
  }
});
