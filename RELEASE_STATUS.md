# CrewFloat release status

20 October 2026 · local validation, no public deployment or submission.

## Passed

- Production TypeScript/Vite build.
- 20 Node tests covering cash/scheduling, model tool boundaries, controlled PayPal responses, webhooks, repeated adverse events, owner access and setup-file preservation.
- Seven browser scenarios against an isolated production build: approval/payment recovery; mobile workflow; scenario and customer scope; streamed reversal; stale review; owner login/logout; untrusted job labels.
- npm audit: zero reported vulnerabilities at this check.
- `.env` created with private file permissions; credentials remain blank. Setup preserves existing secrets and does not print generated access codes.

## Release changes

Owner APIs and financial evidence can be protected with a signed expiring access cookie. Listening beyond loopback requires a strong access code and HTTPS for a remote origin. Public customer checkout remains separate from the owner workspace.

Customer checkout no longer loads the owner dashboard. The entry script is approximately 238 KB; the scheduler/dashboard code is a separate lazy chunk. The remaining owner chunk is large because of its component libraries; this is not a network-performance benchmark.

Development bootstrap uses a single initial workspace request. Browser checks build and launch a separate test instance, without touching the active demo or using merchant/model credentials.

Refund/reversal refreshes exclude funding and pause approvals. A new adverse event after owner reconciliation triggers a fresh review. Customer links expire, fixed payment amounts are checked server-side, and scheduler labels are encoded as text.

## Not externally verified

PayPal sandbox credentials, registered webhook access and AI provider credentials are absent. Controlled transports verify code paths and boundaries; they are not observed PayPal/model runs. No running local model service was available at the checked standard Ollama endpoint.

Banking data and usable funds remain owner assertions. Direct contractor interviews, measured outcomes, Bryntum coverage through judging, public judge access, a public repository and final video remain outstanding.

The Dockerfile is prepared but untested because Docker is not installed. No hosting, account creation, purchase, outreach, publication or submission was performed.

## Next concrete input

Enter the sandbox and model settings in the private `.env`, then restart CrewFloat. Run `npm run doctor` to check configuration. Actual integration runs and their evidence must follow before the submission claims can be finalized.
