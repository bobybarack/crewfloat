# CrewFloat

Recover the week when a payment blocks work. CrewFloat compares which agreed customer deposit could make the most work feasible, prepares a reviewed customer action, and checks the resulting plan against usable cash, crews and deadlines.

Built with React, TypeScript, Express, SQLite, the actual Bryntum Scheduler trial, and AG Grid Community. [Competition audit](WIN_STRATEGY.md) · [Demo script](DEMO.md) · [Submission draft](SUBMISSION.md) · [November 5 early review](EARLY_REVIEW.md)

All interface SVG icons use Hugeicons, including the favicon and grid/scheduler controls. `src/icons.tsx` provides the shared React icons. Regenerate the library SVG assets with `npm run icons:generate` after changing `scripts/generate-icons.mjs`.

[Open the public demo](https://crewfloat.pages.dev) · [GitHub source](https://github.com/bobybarack/crewfloat)

The Cloudflare deployment runs the fictional simulation and deterministic rules preview. It does not have PayPal or AI credentials. See [Cloudflare deployment](DEPLOYMENT.md) for architecture, commands and verification.

## Run locally

Requires a current Node.js with built-in `node:sqlite` (tested with Node 26), npm, and a modern browser.

```sh
npm ci
npm run setup
npm run dev
```

Open **http://127.0.0.1:5178**. The API runs on **127.0.0.1:4310**. Use that exact UI origin. Setup creates a private, ignored `.env` with empty credential fields; it preserves an existing file.

The default **simulation mode** needs no keys. All business data is fictional and uses October 12–16, 2026 as a fixed example week. Each browser receives its own workspace cookie lasting seven days. SQLite persists data in `data/crewfloat.sqlite`; cookie expiration does not automatically delete stored rows. Sandbox and simulation use separate workspace cookies.

## Try the complete story

1. **Recovery desk:** $1,800 opening cash, $1,000 protected commitments, $800 available for new work. Compare Oak's $1,600 deposit with Birch's $1,000 deposit. The full-Oak scenario makes $4,850 more **booked work value** and three additional crew days feasible. This is hypothetical, before fees/holds; it is not income, profit or a measured customer result.
2. Move the usable-amount slider. Only the preview changes. Inspect the minimum-funding explanation: before optional jobs are approved, $400 extra can fit Oak by replacing those proposals. After Cedar and Maple are approved, Oak needs $1,200 extra because those commitments stay fixed.
3. Choose **Analyze with rules**. The default has no model attached and explicitly says so. Inspect its three read-only tool results and reviewed message. With model credentials, the same workflow uses **Analyze with AI**.
4. Choose **Prepare payment link**, then open its customer page. The example page shows one fixed deposit, exposes no workspace finances, and cannot move money in simulation mode. Preparing a link never sends a message.
5. Open **Work planner**, review and approve Cedar and Maple. Their $800 material commitment is reserved once.
6. Open Oak. Simulate a pending payment, then a captured payment. Neither increases usable cash. Confirm **$1,550** net with reference `SIM balance check 001` and the owner checkbox. The example's $50 difference is illustrative, not a claim about PayPal fees.
7. Review and approve Oak and Elm. The first two jobs stay fixed, four jobs are committed, and $150 remains uncommitted.
8. Reopen Oak and choose **Test a payment reversal**. Its net credit is excluded, approved jobs are flagged for funding review, and new approvals pause. Review the decision log and cash inputs. A fresh balance check and explicit reconciliation are required before the pause clears.
9. Download the evidence JSON. It contains inputs, scenarios, schedule checks, latest analysis trace and a SHA-256 fingerprint. The fingerprint detects changes to the exported payload; it is not a signature or external attestation.

## Verification boundary

| Capability | Evidence |
|---|---|
| Integer-cent cash constraints, crew skills, deadlines and fixed approvals | Local planner/API tests |
| Exact minimum extra funds and deposit counterfactuals | Local invariants and browser scenario checks |
| Customer links, scope, fixed amounts and expiry | Local routes and controlled transport tests |
| PayPal order, capture and verification | Actual adapter exercised with controlled responses; real PayPal verification remains pending |
| Signature verification, duplicate webhooks and adverse payment events | Controlled transport tests; actual registered callback remains unverified |
| Analyst tool loop and brief extraction | Analyst boundaries tested with controlled model responses; actual provider and extraction quality remain unverified |
| Owner access and logout | Signed expiring cookie, HTTP boundary and built-application browser tests |
| Event updates, stale approvals and reversal display | Browser tests |
| Bryntum and AG Grid | Actual packages and desktop/mobile checks; Bryntum trial coverage must be confirmed |
| Bank balance or automatic funds availability | Owner-entered inputs; no bank feed |
| Procurement, payroll execution, notifications, refund initiation | Not connected |

Local tests do not establish real integration success, customer demand, measured savings or competition readiness. Public hosting and a recorded final demo have not been performed.

## PayPal sandbox

Enter credentials **locally** in `.env`, never in chat or frontend variables:

```dotenv
PAYMENT_MODE=sandbox
APP_ORIGIN=http://127.0.0.1:5178
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
```

Restart the server. Run the analyst, review its message and prepare a customer link. Use a sandbox personal buyer account distinct from the business seller. The customer creates an order, approves at PayPal and returns to **verify payment**. The owner can also verify a saved order from its job.

The server uses the saved job and expected amount, not the browser's amount or returned token. It validates USD currency, job identity, order total, single capture and completed status. Stable request IDs support retries. Duplicate verification does not add a receipt. A redirect is not payment evidence.

Captured net reported by PayPal is a ceiling for the owner's usable-funds entry. Availability is still an **owner assertion**. Enter only money absent from the opening balance. Check actual restrictions, debits and fees when reconciling. Deposits must be available for these business commitments; restricted-purpose funds should not be treated as unrestricted cash.

Only sandbox hosts are implemented. One deposit and one completed capture per job are supported. Partial payments, refund initiation and dispute management are outside this version.

References: [Orders](https://developer.paypal.com/api/orders/v2), [holds](https://www.paypal.com/us/cshelp/article/why-is-my-payment-on-hold-or-unavailable-help126), [webhook verification](https://developer.paypal.com/api/rest/webhooks/rest/).

## Payment events

Register a public HTTPS callback at **`/api/paypal/webhook`** and set `PAYPAL_WEBHOOK_ID` locally. The handler supports capture-completed, refunded, reversed and denied events. PayPal must be able to reach it; a loopback URL alone cannot receive callbacks.

Incoming event bytes and PayPal headers go to its verification endpoint. Only verified messages can update state. The handler finds the saved order, refreshes its current capture, records the event ID and excludes funding after an adverse event. Positive callbacks never restore restricted funds automatically. Explicit order verification also restricts a capture that PayPal now reports as refunded/reversed, even if its webhook was missed.

The owner browser receives revisions through an event stream. Stale approval is rejected. Reconciliation preserves obligations and does not cancel work or initiate a refund. A new adverse event after reconciliation triggers a new review.

## AI analyst and extraction

Configure an OpenAI-compatible Chat Completions provider supporting tools and JSON output:

```dotenv
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=your_supported_model
AI_API_KEY=your_key
```

Restart. The analyst has three read-only tools: `inspect_cash`, `compare_deposits`, and `explain_job`. It must inspect the chosen unpaid deposit's evidence. Calls are bounded, unknown authority is rejected, and results are tied to a workspace revision. The owner reviews the message before preparing the server-controlled link. No notification is sent automatically.

**Add a job → Extract with AI** sends the brief to the configured provider and returns editable fields with quotations. The server rejects absent quotes, missing financial/scheduling evidence, invalid amounts and impossible windows. Review every field before saving; quotations do not prove semantic correctness. The manual example is explicitly labelled.

## Owner access and hosting

The default server binds to loopback. To protect owner access:

```sh
npm run setup -- --owner-access
```

This adds a generated code only when `.env` has none and prints no secret. Read it from the private file, restart, then enter it in the owner screen. An existing configured code is preserved.

Access uses an expiring signed HTTP-only cookie, constant-time secret comparison, bounded login attempts and mutation-origin checks. Owner APIs, analysis, exports and streams require access when enabled. Customer checkout uses separate expiring, job-scoped links; callbacks require PayPal signature verification. This protects a small hosted demonstration. It does not provide multi-user identity, account recovery or enterprise authorization.

For a served local build:

```sh
npm run build
APP_ORIGIN=http://127.0.0.1:4310 npm start
```

For a remote host, set `BIND_HOST=0.0.0.0`, a strong `OWNER_ACCESS_CODE`, and an HTTPS `APP_ORIGIN`. Startup rejects remote binding without the code and non-HTTPS remote origins. Preserve SQLite on durable storage. Provide judges suitable access in testing instructions; do not publish merchant/model secrets.

The Dockerfile has **not been built or tested here**, because Docker is unavailable. It installs pinned dependencies, builds the UI, runs as a non-root user, and expects runtime configuration plus persistent `/app/data`. No service has been deployed.

## Checks

```sh
npm run doctor        # Configuration only; no external calls or success claims
npm run build
npm test
npm audit
# With Google Chrome installed; the suite builds and starts an isolated server:
npm run test:browser
```

Tests cover planning, payment states, duplicate/stale requests, exact funding alternatives, customer scope, model tools, controlled PayPal/webhook responses, reversal recovery, owner access, persistence and mobile layout. Passing them does not verify a real provider or merchant account.

## Planning limits

One USD workspace, two crews, five whole days, and at most eight jobs. The bounded search maximizes booked job value, breaking ties with lower material costs. Materials are reserved at approval time. Forecast payments never enter usable cash. Optional proposals may change; approved assignments stay fixed.

The version does not model travel, hourly labor costs, dependencies, holidays, partial days, material lead times or multiple currencies. Booked value is not profit. Cash and availability remain user inputs. The scenario slider never changes the ledger or authorizes approval.

## Source and license

Core files: `shared/model.ts` (planner/recovery), `server/index.ts` (routes/persistence), `server/paypal.ts` (sandbox), `server/agent.ts` (analyst), `server/access.ts` (owner access), and `src/RecoveryDesk.tsx` (workflow).

CrewFloat source is MIT licensed. Third-party packages retain their licenses. Bryntum is a proprietary trial; do not redistribute its source or assume October access lasts through December judging. AG Grid Community provides the ledger. **AG Studio is not integrated.**

Before submission: verify actual PayPal/model flows, confirm license coverage, validate with contractors, rehearse fresh judge access, publish licensed source and record a truthful demo. See [SUBMISSION.md](SUBMISSION.md) for the draft and missing evidence.
