# CrewFloat competition audit and build decision

Competitive research date: **13 October 2026**, Africa/Nairobi. Official rules and sponsor pages were rechecked **20 October 2026**; implementation and release materials were updated the same day. This is an evidence-led strategy, not a prediction or guarantee of an award.

## Verdict

Keep CrewFloat, but reposition it around **recovering a contractor's week from a payment bottleneck**. A cash dashboard with a calendar is insufficient. The strongest demonstrable difference is the connection between a specific payment, feasible work, a reviewed customer action, and the consequences of losing that funding.

The original local build was not submission-ready: external PayPal and model paths were unverified, AI only imported briefs, and blocked-job explanations did not distinguish minimum extra funding from the remainder after optional proposals. The revision addresses the product and implementation weaknesses, while external verification remains an explicit gate.

## What the official rules reward

The five equally weighted criteria are implementation, design, impact, innovation and presentation; implementation breaks the first tie. PayPal must be central and AI useful. Required deliverables include functional access, public licensed source and an under-three-minute public YouTube demo. Deadline: **12 November 2026, 23:00 Nairobi**. Access must remain available through judging on **15 December**. One sponsor award can accompany either a grand prize or honorable mention. [Official rules](https://paypalaihackathon.devpost.com/rules)

This means breadth of API calls alone is weak evidence. The most valuable work is a coherent, reproducible result, with a model and payments actually connected. Neither a polished simulated flow nor a list of tests substitutes for external integration evidence.

The current FAQ confirms multiple sponsor tools are allowed, with one sponsor prize maximum per project. [Official FAQ](https://paypalaihackathon.devpost.com/details/faqs)

## Public competition and evidence quality

The official gallery remains unpublished. Searchable public projects are a partial sample. Registration counts are people, not final eligible submissions; no category-level abandonment rate or win probability can be computed from this evidence. [Gallery](https://paypalaihackathon.devpost.com/project-gallery)

| Public pitch | What it already covers | CrewFloat response |
|---|---|---|
| PayPilot | Invoice creation, reminders, payment lookup and refunds; its author reports live sandbox lifecycle verification | Avoid competing on a generic PayPal assistant or claiming API breadth as innovation. Demonstrate a quantified operational result. |
| paypal-frontdesk | Appointments, deposits, captures, cancellations/refunds and invoices | Booking only after payment is already represented. Show multi-job allocation and funding constraints. |
| Mandate | Spending authority, exact payment controls, milestone billing and project-funded contractor payouts | Approval gates and budget limits alone are not a differentiator. Show which work becomes feasible and how funding loss is handled. |
| Ledgerbird | Freelancer invoice extraction, overdue priorities, reminders and payment-event updates | Avoid a generic collections queue. Rank a payment by its marginal schedule outcome. |
| Mandat | Budgeted agent booking, payments and a Bryntum calendar | Sponsor-tool combination alone is not new. Use the scheduler to explain meaningful alternatives. |

Sources: [PayPilot Devpost](https://devpost.com/software/paypilot-an-agentic-commerce-operator-for-paypal), [frontdesk Devpost](https://devpost.com/software/paypal-frontdesk), [Mandate repository](https://github.com/Sid3503/mandate), [Ledgerbird repository](https://github.com/greatgeekgrace/ledgerbird), [Mandat repository](https://github.com/blanco1er/mandat).

These are first-party claims and public artifacts. Competitor payment flows and tests were not independently executed in this audit. A report of live integration is meaningful competitive evidence, but not an independently verified benchmark.

Broader competition also exists. Tirion markets construction cash forecasts linked to schedules and billing/supplier timing. Tesorio offers order-to-cash workflows. CrewFloat cannot credibly claim invention of construction cash planning or invoice recovery. The working hypothesis is a lighter, short-horizon decision workflow for a small contractor. [Tirion](https://www.homodeus.co/tirion/en), [Tesorio](https://tesorio.com/)

## Likely submission families

These are inferences from visible pitches and sponsor examples, not measured category shares:

1. Shopping or booking agents with a PayPal checkout.
2. Invoice/collections agents and financial chat interfaces.
3. Agent spending controls with approval and audit records.
4. Payment-aware calendars and appointment tools.
5. Dashboards, transaction analytics and fraud/risk demos.

CrewFloat sits near families 2 and 4. It stands out only if the judge can see a consequential difference: the payment changes a feasible allocation of crews and cash, with the explanation and failure handling inspectable.

## Sponsor strategy

**Primary sponsor fit: Bryntum.** Its official page values meaningful timeline/resource use and agents driving schedules. It explicitly lists payment-driven rescheduling among its examples, so that concept is a baseline rather than our originality claim. The award is three $1,000 prizes. [Bryntum category](https://paypalaihackathon.devpost.com/details/bryntum)

CrewFloat should demonstrate two uses of the same actual scheduler: a current feasible plan and a clearly hypothetical recovery plan, followed by visible funding-review status after a reversal. Crew skills, deadline windows and fixed approved commitments provide substantive constraints.

**AG Grid is secondary today.** Its category page emphasizes AG Studio, custom widgets, theming and the Studio Agent Framework. Our useful Community ledger meets the broad tool-use requirement, but a plain grid is a weak basis for a best-use claim against tailored Studio submissions. Do not pretend CrewFloat uses AG Studio. [AG Grid category](https://paypalaihackathon.devpost.com/details/aggrid)

**Honorable mention targets:** Most Impactful and Best Demo Delivery. Best Use of PayPal + AI becomes credible only after actual model and sandbox flows are demonstrated. Best Use of Agentic Commerce is less natural while the analyst has read-only tools and owners initiate the reviewed transaction flow. This restraint protects financial authority, but should not be pitched as fully autonomous commerce.

**Overall grand-prize case:** possible through strong implementation and presentation, but currently unproven. Public entrants already report external integration evidence. Our live gates and user evidence must catch up.

## Why the problem is credible

Intuit's July 2026 research reports that 39% of surveyed owners had a late payment make payroll or bills difficult, 49% said processing times created material cash gaps, and 42% reported outside pressures delaying payments to their own contractors/suppliers/vendors. These are vendor-commissioned, broadly sampled business findings, not validation of CrewFloat or its narrow contractor segment. [2026 report](https://quickbooks.intuit.com/r/small-business-data/small-business-late-payments-report-2026/)

The product therefore distinguishes a payment's completion from its usability. PayPal's reporting balance endpoint can lag by up to three hours. Captured funds should not automatically become a real-time bank balance. This build uses owner-confirmed net availability and clearly identifies that limitation. [PayPal balances API](https://developer.paypal.com/api/transaction-search/v1/balances-get/)

## Changes made in this revision

| Criterion | Original weakness | Implemented response | Remaining evidence |
|---|---|---|---|
| Implementation | Minimal AI role; no payment lifecycle recovery | Read-only tool-calling analyst, fixed-amount customer links, server-side capture verification, verified webhook handler, reversal restrictions, event updates and proof export | Actual sandbox and model calls |
| Design | Generic calendar/ledger entry point | Recovery desk with deposit comparison, usable-amount control, hypothetical timeline and reviewed next action | Final visual QA and a concise recorded demo |
| Impact | Aggregate problem data only | Concrete jobs/crew-days/booked-value comparison with explicit assumptions | Real contractor incidents and usability feedback |
| Innovation | Cash plus calendar is already pitched | Exact minimum-funding alternatives, marginal deposit ranking, funding-loss review and inspectable tool evidence | Direct user comparison with current tools |
| Presentation | Positive simulation only | Positive and negative event story, customer perspective, evidence download and labelled fallback behavior | Real integration footage, public video and setup rehearsal |

The example's full $1,600 Oak deposit can make **$4,850 additional booked work and three additional crew days** feasible relative to the initial selected plan. This is a computed scenario. It is not earned revenue, profit, saved jobs or a customer outcome. After the initial two jobs are approved and $1,550 net becomes available, Oak and Elm can be added while the original jobs stay fixed.

## Required evidence before claiming a winning submission

1. **Sandbox:** Observe the real customer link → approval → capture → verification flow; test failures and duplicate verification. Capture alone must not fund the schedule. Exercise signature verification with an actual registered webhook and refund/reversal event.
2. **AI:** Run the real provider against anonymized contractor briefs and recovery questions. Confirm correct tools, accurate claims, source evidence and refusal of unauthorized financial tools. Test missing facts and malicious instructions. Current provider-path unit tests use controlled transports, not a real model.
3. **Users:** Five short interviews; three concrete payment-driven schedule incidents; two people willing to try their own data. Record what changed and what did not help. Do not invent adoption, testimonials or measured savings.
4. **Licensing:** Confirm Bryntum access through judging. The offered 45-day trial cannot be assumed to cover December from an October installation. Preserve the MIT source and third-party notices. [Bryntum access](https://paypalaihackathon.devpost.com/details/bryntum)
5. **Judge access:** Fresh-machine installation or hosted access, visible simulation/live modes, understandable credentials setup, reliable persistence and error recovery. Avoid requiring judges to debug our environment.
6. **Submission:** Public repository, truthful Devpost story, screenshots and an under-three-minute public video. No publication/submission has been performed by this audit.

## Final positioning

> CrewFloat helps small contractors recover the week when a payment blocks work. It shows which payment could make the most work feasible, prepares a reviewed customer action, and checks the resulting schedule against usable cash, crews and deadlines.

The signature demonstration is one causal chain: **blocked materials → compared payment outcomes → reviewed customer payment → verified capture → confirmed usable funds → approved work → reversal → funding-review flag**.

Build this chain exceptionally well. Extra tools, fictional growth metrics and claims of guaranteed victory would weaken the submission.
