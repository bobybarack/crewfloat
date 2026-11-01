# CrewFloat early eligibility review

Updated 1 November 2026, Africa/Nairobi.

## Dates and scope

The organizer says projects submitted by **Thursday, November 5** can receive early eligibility checks and still be edited through the final deadline. The update gives no specific November 5 cutoff time. This is an eligibility review, not a promise of judging feedback, a higher score or an award. [Official update](https://paypalaihackathon.devpost.com/updates/47305-two-weeks-to-go-get-your-project-checked-early)

The final deadline remains **Thursday, November 12, 2026, 12:00 PST**, which is **23:00 Nairobi**. The rules require working access, public licensed source and a public YouTube demo under three minutes. [Official rules](https://paypalaihackathon.devpost.com/rules)

**Internal target: finish the first submission package by November 4.** This is our proposed working target, not an organizer deadline. No automation, submission or message has been scheduled or sent.

## Priority order

| Order | Required evidence or action | Current workspace status |
|---|---|---|
| 1 | Configure merchant sandbox credentials and a model provider locally | PayPal client ID/secret and AI model/key are blank as checked November 1 |
| 2 | Observe an actual AI run: inspect cash, compare deposits, explain the selected job | Code and controlled-response tests exist; real provider run is pending |
| 3 | Observe an actual PayPal buyer approval and server-verified capture | Code and controlled transport tests exist; real sandbox run is pending |
| 4 | Show the payment-to-plan chain, including owner-confirmed usability | Simulation works; record the actual observed payment amount and status |
| 5 | Provide public licensed source and reproducible run instructions or a hosted demo | [Public source](https://github.com/bobybarack/crewfloat) and [hosted simulation](https://crewfloat.pages.dev) published November 1 |
| 6 | Record and upload an under-three-minute working demonstration | Script prepared; actual video and URL are pending |
| 7 | Explicitly name PayPal and AI in description, Built With and video | Draft updated; identify the actual model once verified |
| 8 | Inspect the final repo and video for exposed secrets | Staged source passed Gitleaks before push; .env and local databases are excluded. Video inspection remains pending |
| 9 | Confirm Bryntum availability through judging | Trial is integrated; December coverage is unconfirmed |
| 10 | Submit the complete entry by November 5 for early review | Human submission action has not been performed in this workspace |

## What counts as proof

The recording should show the model's actual tool calls and the corresponding facts, the customer-facing PayPal sandbox checkout, server verification, availability confirmation and a changed feasible schedule. A static integration badge, mocked provider response or simulated payment must not be presented as observed external behavior.

Model and PayPal settings belong in the private `.env`; never in public source, screenshots, video or submission text. Add provider/model names to Built With after connection, without publishing credentials.

Keep remaining limitations explicit: opening cash and net usability are owner assertions; booked value is hypothetical work value, not profit or measured savings. Interview evidence and contractor outcomes should be added only after they exist.

## Editing after early review

Resolve any organizer-identified eligibility gaps first. Continue improving user evidence, presentation and documented reliability through November 12. Preserve the working build, testing instructions and required component access throughout judging. Check feedback manually unless a separate monitoring task is requested.

## Current validation record

November 1 validation: production build, 20 Node tests, Cloudflare type checking, seven browser scenarios against the Cloudflare runtime and a further API isolation/routing scenario passed locally. Public deployment is recorded in [RELEASE_STATUS.md](RELEASE_STATUS.md). These results do not establish actual PayPal/model success.
