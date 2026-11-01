# CrewFloat release status

1 November 2026 · public simulation deployment; no hackathon submission.

[Live demo](https://crewfloat.pages.dev) · [Public source](https://github.com/bobybarack/crewfloat) · [Deployment guide](DEPLOYMENT.md)

## Passed

- Production TypeScript/Vite build.
- 20 Node tests covering cash/scheduling, model tool boundaries, controlled PayPal responses, webhooks, repeated adverse events, owner access and setup-file preservation.
- Seven browser scenarios against the local Cloudflare Pages/Worker runtime: approval/payment recovery; mobile workflow; scenario and customer scope; streamed reversal; stale review; owner login/logout (separate protected Node instance); untrusted job labels.
- Additional Cloudflare API scenario checks visitor isolation, customer-link routing, forged internal headers, rollback after stale input, and simulation checkout restrictions.
- Cloudflare TypeScript checks and minified Worker dry run; GitHub Actions validation and Cloudflare Git build.
- npm audit: zero reported vulnerabilities at this check.
- `.env` created with private file permissions; credentials remain blank. Setup preserves existing secrets and does not print generated access codes.

## Release changes

Owner APIs and financial evidence can be protected with a signed expiring access cookie. Listening beyond loopback requires a strong access code and HTTPS for a remote origin. Public customer checkout remains separate from the owner workspace.

Customer checkout no longer loads the owner dashboard. The entry script is approximately 238 KB; the scheduler/dashboard code is a separate lazy chunk. The remaining owner chunk is large because of its component libraries; this is not a network-performance benchmark.

Development bootstrap uses a single initial workspace request. Browser checks build and launch a separate test instance, without touching the active demo or using merchant/model credentials.

Refund/reversal refreshes exclude funding and pause approvals. A new adverse event after owner reconciliation triggers a fresh review. Customer links expire, fixed payment amounts are checked server-side, and scheduler labels are encoded as text.

## Not externally verified

PayPal sandbox credentials, registered webhook access and AI provider credentials are absent. Controlled transports verify code paths and boundaries; they are not observed PayPal/model runs. No running local model service was available at the checked standard Ollama endpoint.

Banking data and usable funds remain owner assertions. Direct contractor interviews, measured outcomes, Bryntum coverage through judging and the final video remain outstanding. Public source and simulation access are now published; they do not establish PayPal or AI execution.

The Dockerfile remains untested because Docker is not installed. A new GitHub repository, Cloudflare Pages project and private API Worker were published with the user's authorization. Existing sites were not modified. No purchase, outreach or Devpost submission was performed.

## Next concrete input

Enter the sandbox and model settings in the private `.env`, then restart CrewFloat. Run `npm run doctor` to check configuration. Actual integration runs and their evidence must follow before the submission claims can be finalized.
