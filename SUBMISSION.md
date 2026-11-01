# CrewFloat submission draft

Draft updated 1 November 2026. Target early eligibility review by November 5; finish the first submission package by November 4 as an internal target. This file is not a submitted entry. Replace missing evidence with observed integration results before submitting.

[Hosted simulation](https://crewfloat.pages.dev) · [Public source and run instructions](https://github.com/bobybarack/crewfloat). The public app uses fictional payments and deterministic rules; actual PayPal/AI execution is still pending.

## Name and tagline

**CrewFloat: recover the week when a payment blocks work.**

## Built With (draft)

- **PayPal** sandbox: Orders v2, completed-capture verification and verified webhook handling.
- **AI**: tool-calling LLM adapter with read-only cash, deposit-comparison and job-explanation tools. Add the actual provider/model only after its run has been verified; it is currently unconfigured.
- Bryntum Scheduler, AG Grid Community, React, TypeScript, Node.js, Express and SQLite.

The final description, actual Devpost technology tags and video must explicitly identify both PayPal and AI. Labels alone do not prove that either external integration works.

## Inspiration

A small contractor can have a full order book and still lack usable cash for materials. A cash dashboard does not answer the immediate question: which customer payment would make the most useful work feasible, and what can the crews actually commit to after it arrives?

CrewFloat connects that financial question to a short working schedule for an owner managing several installation and repair jobs.

## What it does

CrewFloat compares unpaid agreed deposits by the additional booked work and crew days they could make feasible. The owner adjusts a hypothetical usable amount for fees or holds; previews never change the ledger.

A recovery analyst inspects cash, compares deposits and explains a job through read-only tools. Its evidence and proposed customer message are visible for review. A prepared customer link contains one fixed deposit, expires in 24 hours and grants no access to the owner's finances. Preparing the link sends no message.

The PayPal sandbox adapter creates the order, handles the buyer's return and verifies capture details against the saved job. Captured money enters the planning budget only after the owner confirms net availability. Verified adverse callbacks restrict funding, flag existing commitments and pause further approvals until reconciliation.

The owner approves the schedule explicitly. The planner enforces crew skill, time windows, deadlines and integer-cent cash constraints, preserving approved assignments. A decision log and evidence export make the result inspectable.

## How it is built

React and TypeScript provide the owner and customer experiences. Bryntum Scheduler displays current and hypothetical crew allocations; AG Grid Community presents the job ledger. Express and SQLite store workspaces, approvals, payment links, analysis runs, PayPal order identifiers and processed webhook IDs.

The public simulation is hosted on Cloudflare Pages with a private API Worker and a separate SQLite-backed Durable Object per visitor workspace. The protected Node server retains the credential-dependent sandbox and model routes.

The bounded planner searches a five-day example with two crews and at most eight jobs. It maximizes booked value subject to the entered constraints. Exact minimum-funding alternatives distinguish a cash shortage from a resource-window problem or optional proposals that could be replaced.

An OpenAI-compatible tool-calling adapter provides the analyst. A deterministic preview remains explicitly labelled when no model is configured. Validated server routes control financial mutations independently of the model's prose.

## Challenges and decisions

Payment completion and cash usability are separate states. Opening cash and available net amounts remain owner inputs; no bank feed is claimed.

The negative event path matters as much as the positive one. A refund/reversal does not silently erase work commitments or restore money on a stale callback. A new adverse event after reconciliation triggers another review. Duplicate callbacks are recorded and ignored.

## Demonstrated example

The fictional example starts with $1,800 cash and $1,000 protected commitments. The $800 planning budget fits Cedar and Maple. A full $1,600 Oak deposit could increase feasible booked work by $4,850 and crew utilization by three days. Those figures are a counterfactual, not earned revenue or measured savings.

After the first jobs are approved and $1,550 is simulated as usable, Oak and Elm can be added while those assignments stay fixed. The simulated fee/hold difference is illustrative. The final sandbox recording must use the actual observed amount.

## Present evidence and gaps

| Claim | Current support |
|---|---|
| Working planner, scenarios, approvals, decision log and export | Local source and automated tests |
| Actual Bryntum Scheduler and AG Grid use | Installed packages and browser checks |
| Tool-calling model adapter and authority boundaries | Controlled provider responses; real model run missing |
| Orders, capture, verification and webhook handling | Controlled PayPal transport; real sandbox run missing |
| Contractor impact | Broad problem research; interviews and measured outcomes missing |
| Public source and hosted access | Public GitHub repository and Cloudflare simulation published; per-visitor storage and customer scopes tested |
| Protected owner access for sandbox use | Signed-cookie access and login/logout tests on the Node server; real provider verification pending |
| Trial/license coverage through judging | Needs confirmation |

## Category emphasis

Primary sponsor fit: **Best Use of Bryntum**. Current and hypothetical timelines explain a resource/cash decision and flag funding risk.

Honorable mention story: **Most Impactful** and **Best Demo Delivery**, subject to genuine user evidence and final presentation. **Best Use of PayPal + AI** needs actual observed integrations. AG Grid is used; AG Studio and the Studio Agent Framework are not integrated.

## Before publication

- Complete the early-review gates in [EARLY_REVIEW.md](EARLY_REVIEW.md).
- Attach public licensed source and working access instructions.
- Record actual sandbox and model evidence; update the evidence table accurately.
- Confirm Bryntum validity through 15 December 2026.
- Add genuine contractor findings, including limitations.
- Rehearse a fresh install or hosted judge session.
- Record an under-three-minute YouTube demonstration using [DEMO.md](DEMO.md).
- Recheck the official rules before 12 November 2026, 23:00 Nairobi.

Public source and the simulation deployment are published. No video or Devpost entry has been submitted. No customer, savings or partnership claim is implied.
