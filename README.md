# SokoPilot

**Turn WhatsApp product questions into confident buying conversations.**

SokoPilot is a merchant workspace for managing a product catalogue and WhatsApp customer conversations. Its assistant answers text questions and supported image queries using the configured Meta model. Product names, variants, prices, and stock are checked against the merchant's PostgreSQL catalogue before the assistant makes product claims. Merchants can take over a conversation and reply from the inbox.

The workspace interface is available in English and Kiswahili. The shared access code protects the workspace; it does not provide individual merchant accounts or per-user permissions.

## Preview the app

Open [soko-pilot.vercel.app](https://soko-pilot.vercel.app) and enter the workspace access code supplied by the operator.

For a local preview, follow **Run locally** below. The app needs a PostgreSQL database with the SokoPilot schema and workspace records. It does not display fallback catalogue or conversation data when the database is missing.

## What works

- Browse and manage products, variants, prices, and stock.
- Receive WhatsApp text and image messages through the Cloud API webhook.
- Send recent conversation context and supported images to the configured Meta model. Image files are fetched securely from WhatsApp when needed; SokoPilot stores the WhatsApp media ID, not a copy of the image bytes.
- Ground product claims with a server-side catalogue lookup. Tool results carry product/variant IDs and a retrieval timestamp, and search ranks matches (including Kiswahili synonyms) instead of requiring every term to match.
- Offer image follow-up buttons. **Talk to a person** moves the conversation to merchant handoff; other choices continue as customer messages.
- Review messages, attached images, assistant runs, and handoff status in the inbox. Send manual WhatsApp replies after taking over.
- Review Sales Recovery opportunities: when detection is enabled for the merchant, stalled buying conversations appear in a review queue with their triggering evidence. The merchant can edit and approve a follow-up (sent only after a fresh eligibility check) or dismiss it. Nothing is sent automatically.
- Use Meta Embedded Signup when it is configured and no WhatsApp credentials or connected number are already present. When credentials or a connected number are present, the option is disabled and explains why.

Voice-note transcription, order creation, payments, returns, delivery-status reconciliation, automatic outreach (Sales Recovery always requires merchant approval), and a separate support-ticket system are not implemented. Handoff is recorded as the conversation status with its message history. A versioned 24-scenario assistant evaluation was run once against the configured live model on 2026-11-03 (20/24 passed; p50 8.6s, p95 13.3s — see `local/docs/critical-path.md` for the kept failures). Live WhatsApp delivery and image-question behaviour still need verification against the target deployment; no business-impact result is claimed.

## Run locally

### Requirements

- Node.js **24.11.0** (see `.nvmrc`)
- npm
- PostgreSQL 15 or newer

### Install and configure

```sh
npm ci
cp .env.template .env.local
```

Set the required local values in `.env.local`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sokopilot_dev"
SOKOPILOT_MERCHANT_ID="sokopilot-workspace-merchant"
WORKSPACE_ACCESS_CODE="a-private-workspace-passphrase"
WORKSPACE_ACCESS_SECRET="a-separate-random-secret-at-least-32-characters"
SOKOPILOT_DATABASE_WRITES_ENABLED="YES"
```

Use a random access code of at least 12 characters and an independent signing secret of at least 32 characters. Set `SOKOPILOT_DATABASE_WRITES_ENABLED=YES` only after checking that `DATABASE_URL` points to your intended local database. Never run setup commands against a shared or production database.

For a new local database, plan and apply the schema, then create the workspace records:

```sh
npm run db:migrate
npm run db:seed
```

Start the app:

```sh
npm run dev
```

The HTTPS development server uses a local certificate. Visit `https://localhost:3000/en` or `https://localhost:3000/sw` and accept the browser's local-certificate prompt. For local HTTP instead, use `npm run dev:http` and visit `http://localhost:3000/en` or `/sw`.

### Configure the Meta model (for AI replies)

Set these server-side values in `.env.local`:

```dotenv
META_MODEL_API_URL="https://api.meta.ai/v1"
META_MODEL_NAME="muse-wonder-1.0"
META_MODEL_API_KEY="your-model-api-key"
```

The app calls the exact configured model and does not switch models automatically. Settings checks that the values are present; it does not make a live API call. Keep model and Meta credentials out of source control, browser variables, screenshots, and logs.

### Connect WhatsApp (optional)

Local catalogue features work without WhatsApp. To receive and send live WhatsApp messages, configure a Meta app, webhook, and WhatsApp Business number. Set the server-side values below in `.env.local`:

```dotenv
META_APP_ID=""
META_APP_SECRET=""
META_WEBHOOK_VERIFY_TOKEN=""
META_GRAPH_API_VERSION="vNN.N"
META_WABA_ID=""
META_PHONE_NUMBER_ID=""
META_ACCESS_TOKEN=""
META_DISPLAY_PHONE_NUMBER=""
WHATSAPP_TOKEN_ENCRYPTION_KEY=""
```

`META_DISPLAY_PHONE_NUMBER` is optional. `WHATSAPP_TOKEN_ENCRYPTION_KEY` must be 32 random bytes represented as 64 hexadecimal characters. The app stores the access token encrypted in PostgreSQL.

Point the Meta webhook callback to `https://YOUR_HOST/api/webhooks/whatsapp` and subscribe to WhatsApp message events. After confirming the selected database and write approval, save the environment-based number as a workspace connection:

```sh
npm run db:connect-whatsapp
```

The credentials alone do not create a database connection: the assistant only processes numbers saved as connected `WhatsAppConnection` records. If this connection is already present, do not run the setup command again unnecessarily. In Settings, confirm WhatsApp and model readiness, then explicitly enable the assistant.

The webhook verifies Meta signatures and deduplicates inbound message IDs. Opted-out customers and conversations under merchant control are not sent to the model. If processing or sending fails, the conversation remains available for merchant handoff. The protected image route is `GET /api/whatsapp/media/{messageId}`; it requires workspace access and verifies the message belongs to the configured merchant.

### Embedded Signup

Embedded Signup is an optional alternative for onboarding a number through Meta's Facebook SDK. It requires `META_APP_ID`, `META_APP_SECRET`, `META_GRAPH_API_VERSION`, `META_WEBHOOK_VERIFY_TOKEN`, `META_EMBEDDED_SIGNUP_CONFIG_ID`, `WHATSAPP_TOKEN_ENCRYPTION_KEY`, and database write approval. The Meta app and deployment domain must also be configured for WhatsApp Embedded Signup and the Facebook JavaScript SDK.

When `META_WABA_ID`, `META_PHONE_NUMBER_ID`, and `META_ACCESS_TOKEN` are all set, or a number is already connected in the workspace, Settings disables Embedded Signup. The server rejects submissions when all three fixed-number credentials are set.

## Environment variables

`.env.template` lists every supported setting. The main groups are:

| Purpose | Variables |
| --- | --- |
| Database and workspace | `DATABASE_URL`, `SOKOPILOT_MERCHANT_ID`, `SOKOPILOT_DATABASE_WRITES_ENABLED` |
| Workspace access | `WORKSPACE_ACCESS_CODE`, `WORKSPACE_ACCESS_SECRET` |
| Meta Model API | `META_MODEL_API_URL`, `META_MODEL_NAME`, `META_MODEL_API_KEY` |
| WhatsApp Cloud API | `META_APP_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`, `META_GRAPH_API_VERSION`, `META_WABA_ID`, `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN`, `META_DISPLAY_PHONE_NUMBER`, `WHATSAPP_TOKEN_ENCRYPTION_KEY` |
| Embedded Signup | `META_EMBEDDED_SIGNUP_CONFIG_ID` plus the relevant app, webhook, Graph API, encryption, and database settings above |
| Sales Recovery sweep | `CRON_SECRET` (provided automatically by Vercel Cron) or `SALES_RECOVERY_CRON_SECRET` for external schedulers |

For compatibility, existing deployments may still use `DEMO_MERCHANT_ID`, `SOKOPILOT_DEMO_DB_WRITE_APPROVED`, `DEMO_ACCESS_CODE`, and `DEMO_GATE_SECRET`. New setups should use the neutral names listed in `.env.template`.

## Routes and project layout

| Route | Purpose |
| --- | --- |
| `/en`, `/sw` | Localized product page and catalogue preview |
| `/{lang}/sign-in` | Workspace access |
| `/{lang}/dashboard` | Workspace overview |
| `/{lang}/dashboard/products` | Catalogue and stock management |
| `/{lang}/dashboard/conversations` | WhatsApp inbox, image attachments, handoff, and replies |
| `/{lang}/dashboard/recovery` | Sales Recovery review queue (approve-and-send or dismiss; detection off by default) |
| `/{lang}/settings?tab=assistant` | Integration readiness and assistant controls |
| `/api/webhooks/whatsapp` | WhatsApp webhook verification and inbound processing |
| `/api/cron/sales-recovery` | Hourly Sales Recovery sweep (Vercel Cron; bearer-secret protected) |
| `/api/whatsapp/media/{messageId}` | Protected retrieval of a message image |

The stack is Next.js 16, React 19, TypeScript, Tailwind CSS, PostgreSQL, and Prisma 8's contract-first API. `src/prisma/contract.prisma` is the schema source; `contract.json` and `contract.d.ts` are generated beside it. Prisma setup scripts are in `src/prisma/scripts/`.

## Checks

```sh
npm run test:ci
npm run type-check
npm run lint:check
npm run build
npm run eval:assistant   # live-model evaluation; requires database + model configuration
```

The automated tests (31) cover catalogue input validation, Meta endpoint/readiness/tool-argument/response parsing, catalogue ranking and evidence, Sales Recovery eligibility and frequency caps, the deterministic bundle builder, evaluation scoring, WhatsApp webhook payload parsing and opt-out detection, workspace-gate cookie and redirect rules, cron authorization, WhatsApp token encryption, and English/Kiswahili dictionary parity. They are unit tests for deterministic logic; database-backed flows still require integration testing against an isolated database. `npm run eval:assistant` runs the versioned 24-scenario set against the configured live model through the read-only prompt preview (no WhatsApp sends) and exits non-zero on failures; its 2026-11-03 run passed 20/24 with the failures recorded in `local/docs/critical-path.md`. A passing build or test suite does not prove a live database, webhook, WhatsApp send, or business outcome, and no business-impact result is claimed.

Sales Recovery note: the database migration for the recovery tables is planned under `migrations/app/20261103T1145_add_sales_recovery/` and must be applied to the target database (review `npm run db:migrate` first) before detection can create opportunities. On Vercel, the daily sweep in `vercel.json` (06:00 UTC) runs automatically once deployed.
