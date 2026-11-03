import assert from "node:assert/strict";
import test from "node:test";
import {
  createRecoveryCandidate,
  isRecoveryEligible,
  type RecoveryMessage,
} from "./sales-recovery";

const now = Date.parse("2026-11-03T12:00:00.000Z");
const messages: RecoveryMessage[] = [
  {
    id: "question-1",
    direction: "inbound",
    body: "Can I buy this tomorrow?",
    createdAt: "2026-11-03T07:00:00.000Z",
  },
  {
    id: "reply-1",
    direction: "outbound",
    body: "I can help with that.",
    createdAt: "2026-11-03T08:00:00.000Z",
  },
];

function eligibility(overrides: Partial<Parameters<typeof isRecoveryEligible>[0]> = {}) {
  return isRecoveryEligible({
    messages,
    lastMessageAt: "2026-11-03T08:00:00.000Z",
    conversationStatus: "open",
    optedOut: false,
    hasOrder: false,
    now,
    ...overrides,
  });
}

test("recovery only qualifies a buying conversation that stalled inside the review window", () => {
  assert.equal(eligibility(), true);
  assert.equal(eligibility({ messages: [{ ...messages[1], direction: "inbound" }] }), false);
  assert.equal(eligibility({ conversationStatus: "handoff" }), false);
  assert.equal(eligibility({ optedOut: true }), false);
  assert.equal(eligibility({ hasOrder: true }), false);
  assert.equal(eligibility({ lastMessageAt: "2026-11-03T11:00:00.000Z" }), false);
  assert.equal(eligibility({ lastMessageAt: "2026-11-02T10:00:00.000Z" }), false);
});

test("recovery candidate stores the triggering message as evidence and stays generic", () => {
  const candidate = createRecoveryCandidate(messages);
  assert.equal(candidate?.triggerMessageId, "question-1");
  assert.equal(candidate?.reason, "buying_intent");
  assert.equal(candidate?.evidence, "Can I buy this tomorrow?");
  assert.match(candidate?.suggestedMessage ?? "", /plan changed/);
  assert.doesNotMatch(candidate?.suggestedMessage ?? "", /price|stock|discount/i);
});

test("recovery classifies price concern and Swahili buying intent", () => {
  const price = createRecoveryCandidate([
    { ...messages[0], body: "That is too expensive, any cheaper option?" },
    messages[1],
  ]);
  assert.equal(price?.reason, "price_concern");
  const swahili = createRecoveryCandidate([
    { ...messages[0], body: "Nitachukua hiyo, naweza pata kesho?" },
    messages[1],
  ]);
  assert.equal(swahili?.reason, "buying_intent");
});

test("non-sales conversation does not generate a recovery candidate", () => {
  assert.equal(
    createRecoveryCandidate([
      { ...messages[0], body: "Hello, what are your opening hours?" },
      messages[1],
    ]),
    null,
  );
});
