# Cloudflare deployment

The public build runs **simulation mode** with a **deterministic rules preview**. No PayPal or model credentials are deployed. The protected Node server retains the sandbox PayPal and AI adapters; their real provider verification remains pending.

## Architecture

- Cloudflare Pages project `crewfloat` serves the Vite production assets.
- Its advanced-mode Worker forwards `/api/*` through the `API` service binding to `crewfloat-api`. The backend has no public workers.dev endpoint.
- Each visitor is routed to a separate SQLite-backed `CrewWorkspace` Durable Object using a random HTTP-only workspace cookie. Existing revision checks, SQL transactions and session cookies still apply.
- Customer links contain a workspace hash prefix plus 128 random bits. The hash routes the link without disclosing the workspace cookie. The customer API returns only its scoped job and payment status.
- Server-sent events carry workspace revisions. Customer pages load without the large owner Scheduler bundle.
- No local SQLite database, `.env`, vendor source, or build output is committed. Business examples remain fictional; do not enter sensitive customer data in the public demonstration.

## Local Cloudflare verification

Use Node 26 and install dependencies with `npm ci`. Build with `npm run build:pages`.

Create an ignored `cloudflare/.dev.vars` containing:

```dotenv
APP_ORIGIN=http://localhost:8788
PAYMENT_MODE=demo
```

Run `npm run dev:cloudflare`, then open `http://localhost:8788`. In another terminal, run:

```sh
npm run check:cloudflare
npx playwright test --config playwright.cloudflare.config.ts
```

Run against a deployment using `CREWFLOAT_TEST_URL=https://your-project.pages.dev npx playwright test --config playwright.cloudflare.config.ts`. These tests create fictional isolated workspaces and exercise simulation controls.

## Publish

The checked-in configs use `crewfloat.pages.dev`. If Pages assigns another name, update `APP_ORIGIN` in `cloudflare/wrangler.jsonc` and redeploy the API before publishing the frontend.

With Wrangler authenticated to the intended Cloudflare account:

```sh
npm run check:cloudflare
npm run deploy:api
npm run deploy:pages
```

`wrangler.jsonc` defines the Pages service binding. `cloudflare/wrangler.jsonc` defines the private API, SQLite-backed Durable Object migration, simulation mode and logging. Compatibility date October 30, 2026 matches the current published local Workers runtime.

For a Git-connected Pages project, use production branch `main`, build command `npm run build:pages`, output directory `dist`, and `NODE_VERSION=26`. Frontend pushes do not automatically deploy API changes; deploy the API explicitly when server/shared/Cloudflare backend code changes.

The public Worker deliberately fails closed if payment mode changes or PayPal/model credentials are present. Enabling actual sandbox checkout on Cloudflare requires protected owner access and verified webhook-to-workspace routing before removing this guard.

## Licensing

Authored source is MIT licensed. Bryntum remains a proprietary trial. The repository references its package and does not vendor its source. License coverage through judging remains an outstanding submission requirement.
