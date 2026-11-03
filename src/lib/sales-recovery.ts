export type RecoveryMessage = {
  id: string;
  direction: "inbound" | "outbound" | "internal";
  body: string | null;
  createdAt: string;
};

export type RecoveryCandidate = {
  triggerMessageId: string;
  lastOutboundMessageId: string;
  reason:
    | "buying_intent"
    | "price_concern"
    | "unavailable_item"
    | "undecided"
    | "unanswered_question"
    | "unknown";
  evidence: string;
  suggestedMessage: string;
};

const SIGNALS: Record<RecoveryCandidate["reason"], RegExp> = {
  buying_intent:
    /\b(?:buy|order|reserve|purchase|checkout|i(?:'|’)ll take|nitachukua|nitanunua|naweza pata|naomba niagize)\b/i,
  price_concern:
    /\b(?:too expensive|too costly|price is high|cheaper|discount|budget|ghali|bei iko juu|punguzo)\b/i,
  unavailable_item:
    /\b(?:out of stock|not available|sold out|haipo|imeisha|hamna stock)\b/i,
  undecided:
    /\b(?:not sure|thinking about it|let me think|nitafikiria|sijui bado)\b/i,
  unanswered_question:
    /\?\s*$/,
  unknown: /$a/,
};

const REASON_ORDER: RecoveryCandidate["reason"][] = [
  "price_concern",
  "unavailable_item",
  "undecided",
  "buying_intent",
];

const hasSalesSignal = (body: string) =>
  REASON_ORDER.some((reason) => SIGNALS[reason].test(body));

export function isRecoveryEligible(input: {
  messages: RecoveryMessage[];
  lastMessageAt: string | null;
  conversationStatus: string;
  optedOut: boolean;
  hasOrder: boolean;
  now?: number;
  inactivityMs?: number;
}): boolean {
  if (
    input.optedOut ||
    input.hasOrder ||
    input.conversationStatus !== "open" ||
    !input.lastMessageAt
  ) {
    return false;
  }

  const lastMessage = input.messages.at(-1);
  if (!lastMessage || lastMessage.direction !== "outbound") return false;
  const lastMessageTime = Date.parse(input.lastMessageAt);
  if (!Number.isFinite(lastMessageTime)) return false;

  const now = input.now ?? Date.now();
  const inactivityMs = input.inactivityMs ?? 4 * 60 * 60 * 1000;
  const ageMs = now - lastMessageTime;
  if (ageMs < inactivityMs || ageMs > 24 * 60 * 60 * 1000) return false;

  return input.messages.some(
    (message) =>
      message.direction === "inbound" &&
      message.body !== null &&
      hasSalesSignal(message.body),
  );
}

export function createRecoveryCandidate(
  messages: RecoveryMessage[],
): RecoveryCandidate | null {
  const inbound = messages.filter(
    (message) => message.direction === "inbound" && message.body?.trim(),
  );
  const signalMessage = [...inbound].reverse().find((message) =>
    hasSalesSignal(message.body!),
  );
  if (!signalMessage?.body) return null;
  const lastOutbound = [...messages]
    .reverse()
    .find((message) => message.direction === "outbound");
  if (!lastOutbound) return null;

  const reason =
    REASON_ORDER.find((candidate) =>
      SIGNALS[candidate].test(signalMessage.body!),
    ) ?? (signalMessage.body.includes("?") ? "unanswered_question" : "unknown");
  const evidence = signalMessage.body.trim().slice(0, 500);
  const suggestedMessage =
    "Hi! I’m following up on your earlier question. Would you still like help, or has your plan changed?";

  return {
    triggerMessageId: signalMessage.id,
    lastOutboundMessageId: lastOutbound.id,
    reason,
    evidence,
    suggestedMessage,
  };
}
