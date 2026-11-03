import assert from "node:assert/strict";
import test from "node:test";
import { isAuthorizedCronRequest } from "./cron-auth";

test("cron authorization accepts either configured bearer secret and nothing else", () => {
  const secrets = ["recovery-secret", "vercel-secret"];
  assert.equal(isAuthorizedCronRequest("Bearer recovery-secret", secrets), true);
  assert.equal(isAuthorizedCronRequest("Bearer vercel-secret", secrets), true);
  assert.equal(isAuthorizedCronRequest("Bearer wrong", secrets), false);
  assert.equal(isAuthorizedCronRequest("Bearer recovery-secre", secrets), false);
  assert.equal(isAuthorizedCronRequest("recovery-secret", secrets), false);
  assert.equal(isAuthorizedCronRequest("Bearer ", secrets), false);
  assert.equal(isAuthorizedCronRequest(null, secrets), false);
  assert.equal(isAuthorizedCronRequest(undefined, secrets), false);
});

test("cron authorization fails closed when no secret is configured", () => {
  assert.equal(isAuthorizedCronRequest("Bearer anything", []), false);
  assert.equal(isAuthorizedCronRequest("Bearer anything", [undefined, "  "]), false);
});
