# SokoPilot

**Turn WhatsApp product questions into confident buying conversations.**

SokoPilot gives merchants one place to manage their catalogue, follow customer conversations, and step in when a customer needs a person. Its live assistant can answer product questions from the merchant's saved catalogue, so prices, variants, and stock come from the business's database rather than a model's guess.

The demo supports English and Kiswahili. It uses PostgreSQL as the source of truth for products, variants, prices, stock, customers, conversations, messages, assistant runs, and catalogue tool executions.

> **Demo status:** The Meta Model API integration is wired for the configured model, Muse Wonder (`muse-wonder-1.0`). Automated replies remain off until the deployment has valid server-side model and WhatsApp settings and an operator enables the assistant in Settings. The integration has not yet been verified against a rotated live API key or scored against the prepared evaluation set. Catalogue search is the only available business tool; order and payment actions are disabled.

## Preview the demo

Demo link: [soko-pilot.vercel.app](https://soko-pilot.vercel.app)

Open the deployed Vercel URL and choose **Explore the private demo**. Ask the demo operator for the shared access code. This is a temporary private-demo gate, not an individual merchant account.

Inside the workspace:

1. **Browse the catalogue.** The landing page, dashboard, and Products page read product and variant data from PostgreSQL.
2. **Manage products.** Create a product with variants, prices, and opening stock, then adjust variant stock. Changes are saved to the database.
3. **Review conversations.** The inbox shows persisted WhatsApp messages and the latest assistant provider/model/run status.
4. **Enable the assistant when configured.** Settings shows model and WhatsApp readiness. An authorized operator can enable or pause automation there. New text questions on eligible conversations are sent to the exact configured Meta model; catalogue claims require a server-side search of the saved merchant catalogue.
5. **Take over any conversation.** A customer request for a person, provider failure, or manual merchant takeover leaves the conversation for human follow-up. Manual replies are saved after WhatsApp confirms delivery.

The public landing page displays catalogue data only. Customer conversations are behind the demo gate. Use synthetic or consented demo data.

## Run locally

### Requirements

- Node.js **24.11.0** (pinned in `.nvmrc`)
- npm
- A dedicated PostgreSQL database for development

### Install and configure

```sh
npm ci
cp .env.template .env.local
```

Set the local values in `.env.local`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sokopilot_dev"
DEMO_ACCESS_CODE="a-private-demo-passphrase"
DEMO_GATE_SECRET="a-separate-random-secret-at-least-32-characters"
DEMO_MERCHANT_ID="sokopilot-demo-merchant"
SOKOPILOT_DEMO_DB_WRITE_APPROVED="YES"
```

Use a random access code of at least 12 characters and a separate random signing secret of at least 32 characters. Never point local setup commands at the hosted demo database.

For a new local database, review the Prisma migration plan before applying it, then seed synthetic demo records:

```sh
npm run db:migrate
npm run db:seed-demo
```

Start the app with HTTPS:

```sh
npm run dev
```

For local HTTP, run `npm run dev:http`. Visit `https://localhost:3000/en` or `https://localhost:3000/sw` and unlock the workspace with your local demo code.

The app does not substitute static products or conversations when the database is unavailable. It reports missing configuration instead. Do not run migration, reset, or seed commands against the provisioned hosted demo database.

### Configure Meta Model API

Set these server-only values locally and in the Vercel project environment:

```dotenv
META_MODEL_API_URL="https://api.meta.ai/v1"
META_MODEL_NAME="muse-wonder-1.0"
META_MODEL_API_KEY="your-rotated-secret"
```

Keep the key out of source control, screenshots, client-side variables, and logs. The app calls Meta's Chat Completions API using the exact configured model identifier; it does not silently switch models. A readiness check only confirms configuration is present, not that a live completion succeeds.

### Connect a WhatsApp test number

WhatsApp is optional for exploring database-backed catalogue features. For the live inbox and assistant flow, use a dedicated Meta WhatsApp Business test number and configure these server-side values:

- `META_APP_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`
- `META_WABA_ID`, `META_PHONE_NUMBER_ID`, optional `META_DISPLAY_PHONE_NUMBER`
- `META_ACCESS_TOKEN` and `WHATSAPP_TOKEN_ENCRYPTION_KEY` (32 bytes as 64 hex characters)
- `META_GRAPH_API_VERSION` (a supported `vNN.N` value)
- `SOKOPILOT_DEMO_DB_WRITE_APPROVED=YES`

Set the Meta webhook callback to `https://YOUR_HOST/api/webhooks/whatsapp` and subscribe to WhatsApp message events. After verifying the selected database and environment, connect the test number:

```sh
npm run db:connect-demo-whatsapp
```

This setup stores the WhatsApp token encrypted in the database. Once the deployment's Settings page reports both integrations ready, enable the assistant there. Inbound message IDs are deduplicated. Opt-outs and conversations already under merchant control are not sent to the model. If the model or WhatsApp send fails, the inbound message remains saved and the conversation stays in handoff.

## Deploy on Vercel

Configure the repository's existing Next.js build in Vercel and add required values from `.env.template` under **Project Settings → Environment Variables**. Values in `.env.local` do not automatically reach Vercel. At minimum, the private workspace needs `DATABASE_URL`, `DEMO_ACCESS_CODE`, and `DEMO_GATE_SECRET`; intended database writes also require `SOKOPILOT_DEMO_DB_WRITE_APPROVED=YES`.

For live AI replies, add the three Meta model variables above and the WhatsApp test-number variables. Keep all credentials server-side; never use `NEXT_PUBLIC_*` names for secrets. Redeploy after changing environment values, then use Settings to enable the assistant. Use distinct local and hosted database URLs.

## Routes and stack

| Route                             | Purpose                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `/en`, `/sw`                      | Localized pitch page with database-backed catalogue preview        |
| `/{lang}/sign-in`                 | Shared private-demo access gate                                    |
| `/{lang}/dashboard`               | Database-backed workspace overview                                 |
| `/{lang}/dashboard/products`      | Catalogue creation and variant stock updates                       |
| `/{lang}/dashboard/conversations` | Persisted inbox, assistant run evidence, handoff, and manual reply |
| `/{lang}/settings?tab=assistant`  | Model/WhatsApp readiness and assistant enable/pause control        |
| `/api/webhooks/whatsapp`          | Meta webhook verification and signed inbound event handling        |

Built with Next.js 16, React 19, TypeScript, Tailwind CSS, PostgreSQL, and Prisma 8's contract-first API. `src/prisma/contract.prisma` is the single source schema; its emitted `contract.json` and `contract.d.ts` plus the runtime client in `src/prisma/db.ts` stay alongside it. `src/lib/prisma/` contains database setup scripts such as the synthetic seed and WhatsApp connection helper, not a second schema or client.

## Validation

```sh
npm run test:ci
npm run type-check
npm run lint:check
npm run build
```

Unit tests cover catalogue input validation and Meta endpoint, readiness, tool-argument, and response parsing rules. These checks do not prove a live PostgreSQL, Meta Model API, webhook, or WhatsApp send. The 40-case evaluation set is prepared but unrun; no quality, latency, safety-score, sales-lift, or merchant-impact result is claimed.

## Current boundaries

- Catalogue search is read-only. Order creation, checkout, payments, fulfillment, campaigns, and account management are out of scope.
- The inbox shows up to the latest 100 persisted messages per conversation. Product editing and deletion are not implemented.
- Voice/image interpretation and WhatsApp delivery-status reconciliation are not implemented.
- The shared access code is a private-demo gate, not production merchant authentication or per-user authorization.
- Assistant activation requires a configured WhatsApp connection, model key, enabled catalogue-search tool, and explicit operator action.
- The prepared evaluation thresholds are proposed gates, not measured outcomes.
