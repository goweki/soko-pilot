# SokoPilot — Final Presentation

*The WhatsApp sales copilot for small merchants. Catalogue-grounded answers, merchant control, and now: evidence you can inspect and stalled sales you can recover — with approval, never automatically.*

*This deck improves on `Presentation_v2.pptx`: same story, updated for what is actually built and measured as of 2026-11-03. Every claim below is labelled Built, Measured, or Target. Anything else is a roadmap item, not a capability.*

---

## 1. The storefront moved into the chat

**Say:** "Do you have a blue shirt for a wedding?" — "What size and budget?" — "Small, in sand." That is the whole product: ask → clarify → ground in the catalogue → hand off to a person when it matters.

- Customers already buy through WhatsApp conversations.
- Merchants lose sales in the gaps: slow replies, repeated questions, conversations that quietly stall.

## 2. Why now (context, not commerce proof)

- 23.4M internet users in Kenya, end of 2025 (DataReportal Digital 2026: Kenya).
- WhatsApp 19.8% vs Facebook 18.2% of platforms named for information use (Media Council of Kenya, State of the Media 2025) — channel familiarity, not conversion evidence.
- Meta is moving business AI into WhatsApp (May 2026 small-business AI announcement, India) — a roadmap signal, not Kenyan availability.

*Claim boundary: these figures describe the channel, not SokoPilot outcomes.*

## 3. What SokoPilot does today — Built

1. **Connect** — WhatsApp Business number via Cloud API webhook (signature-verified, deduplicated) or Embedded Signup.
2. **Ground** — every product claim comes from a server-side catalogue search. Tool results now carry product/variant IDs and a `retrievedAt` timestamp; search ranks matches and understands Kiswahili terms (e.g. *shati*, *viatu*).
3. **Assist** — text and photo questions, clarification when details are missing, English and Kiswahili.
4. **Control** — opt-out and merchant takeover stop automation instantly; handoff keeps the full history in one inbox.
5. **Recover (new, prototype)** — stalled buying conversations are detected and queued for merchant review. The merchant sees the triggering message, edits the follow-up, and approves or dismisses it. Nothing sends automatically.

## 4. AI proposes. SokoPilot checks. — Built

- Model tool calls are untrusted proposals: server validates enablement, tenant scope, and arguments.
- Catalogue facts (price, stock, variants) only ever come from the merchant's database — never from the model.
- Bounded tool rounds and context; failures fail closed to merchant handoff.
- No order, payment, or discount tools exist. A merchant always handles the sale itself.

## 5. Sales Recovery: the next major capability — Built (prototype, off by default)

- **Detect:** open conversation, last word was the shop's, quiet for 4+ hours, earlier buying/price/undecided signal, no opt-out, no pending order.
- **Review:** evidence-backed queue at Dashboard → Sales recovery; hourly sweep (Vercel Cron), frequency cap, one opportunity per triggering message.
- **Approve:** eligibility is re-checked at send time (still open, inside WhatsApp's 24h window, nothing newer sent); the send is claimed before it happens so it cannot duplicate.
- **Audit:** every opportunity records its reason, evidence, reviewer outcome, and provider message ID.

*Honest status: code-complete and unit-tested; the database migration is planned but not yet applied, so no recovery message has been sent yet. First pilot is one merchant, manual approval only.*

## 6. Evidence, measured — Measured (2026-11-03)

Versioned evaluation set `sokopilot-assistant-v1` (24 scenarios: catalogue, clarification, handoff, prompt-injection, order boundaries, Kiswahili), run against the configured live model `muse-wonder-1.0` via `npm run eval:assistant`:

- **20/24 passed (83%)** — catalogue grounding, handoff, injection resistance, and order-boundary refusals held.
- Latency p50 8.6s / p95 13.3s — above our proposed 10s p95 target; disclosed, not hidden.
- Failures kept: discount request (truncated provider reply), cross-tenant request (refused but no handoff), Kiswahili price objection and bundle request (no catalogue search made).
- Deterministic bundle check: no two-category bundle exists within KES 5,000 in the demo catalogue — so we make no bundle claim today.

*The separate 40-case set is prepared and still unrun. No sales lift, conversion, or time-saved claim is made anywhere in this deck.*

## 7. Two-minute demo

| Time | Show |
| --- | --- |
| 00:00–00:20 | The problem: repeated product questions and stalled chats on WhatsApp. |
| 00:20–00:50 | Text question → clarification → catalogue-grounded answer; show product ID and retrieval time in the run record. |
| 00:50–01:15 | Photo question → grounded reply with follow-up buttons. |
| 01:15–01:40 | "Talk to a person" → handoff, merchant takeover and reply in the inbox. |
| 01:40–02:00 | Sales Recovery queue: one stalled conversation, its evidence, edit → approve (test number only). Close on boundaries. |

## 8. Roadmap — Target (not built)

1. Apply the Sales Recovery migration; pilot with one merchant, manual approval only.
2. Fix the four evaluation failures; run the 40-case set and publish results.
3. One constrained bundle scenario, only where catalogue data supports exact totals.
4. Visual product matching only after live image-capability verification.
5. Explicitly out: automatic outreach, payments, order creation, ERP.

## 9. The ask

Pilot merchants who sell on WhatsApp and will measure time-to-first-correct-reply with us. SokoPilot's bet: the winning commerce agent is not the one that talks the most — it is the one whose every claim can be checked, and whose merchant never loses control.

---

## Appendix: screenshot checklist

- [ ] Inbox: conversation list with open/handoff states (`/{lang}/dashboard/conversations`).
- [ ] Open conversation: photo, grounded reply, merchant controls.
- [ ] Sales Recovery queue: one pending opportunity with evidence and edited suggestion.
- [ ] Customer phone: consented test exchange on the connected number.
- [ ] Assistant run record: provider/model, tool call, product IDs, retrieval timestamp.

*Privacy: synthetic or consented data only; scrub phone numbers, tokens, and access codes from every capture.*
