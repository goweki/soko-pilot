import assert from "node:assert/strict";
import test from "node:test";
import {
  createDemoGateCookieValue,
  sanitizeGateDestination,
  verifyDemoGateCookieValue,
} from "./demo-gate-core";

const secret = "a-signing-secret-with-at-least-32-chars";

test("gate destination only allows known workspace routes and blocks open redirects", () => {
  assert.equal(sanitizeGateDestination(null, "en"), "/en/dashboard");
  assert.equal(sanitizeGateDestination("//evil.example/path", "en"), "/en/dashboard");
  assert.equal(sanitizeGateDestination("https://evil.example", "en"), "/en/dashboard");
  assert.equal(sanitizeGateDestination("/sw/dashboard/conversations", "sw"), "/sw/dashboard/conversations");
  assert.equal(sanitizeGateDestination("/en/dashboard/recovery", "en"), "/en/dashboard/recovery");
  assert.equal(sanitizeGateDestination("/en/settings?tab=assistant", "en"), "/en/settings?tab=assistant");
  assert.equal(sanitizeGateDestination("/en/settings?tab=other", "en"), "/en/dashboard");
  assert.equal(sanitizeGateDestination("/en/dashboard?x=1", "en"), "/en/dashboard");
  assert.equal(sanitizeGateDestination("/en/admin", "en"), "/en/dashboard");
  assert.equal(sanitizeGateDestination("/sw/dashboard", "en"), "/en/dashboard");
});

test("gate cookie verifies only untampered, unexpired values", () => {
  const now = 1_800_000_000;
  const value = createDemoGateCookieValue(String(now + 3600), secret);
  assert.equal(verifyDemoGateCookieValue(value, secret, now), true);
  assert.equal(verifyDemoGateCookieValue(value, "wrong-secret-wrong-secret-wrong-12", now), false);
  assert.equal(verifyDemoGateCookieValue(value.replace("8", "9"), secret, now), false);
  assert.equal(
    verifyDemoGateCookieValue(createDemoGateCookieValue(String(now - 1), secret), secret, now),
    false,
  );
  assert.equal(verifyDemoGateCookieValue(undefined, secret, now), false);
  assert.equal(verifyDemoGateCookieValue("not-a-cookie", secret, now), false);
  assert.equal(verifyDemoGateCookieValue(`${now + 3600}.xyz`, secret, now), false);
});
