# HR Value Proposition

**Status:** Product-strategy document defining the employer promise and the test every employer-facing feature must pass.

## The employer promise

**Hire with greater confidence using readiness, evidence, and organisational context — not assumptions, polished CVs, or informal networks alone.**

## What Levav must help employers do

- Receive stronger shortlists.
- Reduce unsuitable applications.
- Reduce time to hire.
- Reduce the cost of poor hiring.
- Discover overlooked talent.
- Identify emerging potential.
- Improve candidate-role alignment.
- Improve culture contribution (not culture sameness — see the bias guardrails in `EMPLOYER_TALENT_DNA.md`).
- Improve onboarding.
- Improve early performance.
- Improve retention.
- Reduce dependence on informal referrals.
- Plan future workforce needs.
- Build leadership pipelines.
- Measure the organisational value created by successful hires.

## The seven-question test for every employer-facing feature

1. What HR decision does this help improve?
2. What does Levav provide that a CV or conventional job board does not?
3. How does this reduce cost, time, or risk?
4. How does it improve performance, retention, or organisational value?
5. What evidence makes the recommendation trustworthy?
6. How is bias detected and controlled?
7. What outcome can the employer measure?

Applied to what's already been audited:

| Existing/archived feature | Passes the test? |
|---|---|
| `backup-old-site`'s `EmployerDashboard.tsx` (jobs, applicants, interviews, talent pool, analytics, billing) | Structurally yes — it answers "what decision" (hiring pipeline management) clearly. Its shortcoming is not scope, it's substance: applicant data is mock/localStorage, so it currently answers none of Q3–Q7 with real evidence. Worth rebuilding *on real data*, not redesigning conceptually. |
| `backup-old-site`'s `JobMatchingPage.tsx` ("AI-Powered Job Recommendations" with a hardcoded `[78, 65, 82, 71, 88]` match-score array) | Fails outright. It answers none of the seven questions honestly — the "recommendation" isn't a recommendation, it's a decoration. This is the canonical example of what the primary product principle exists to prevent, and it must not be repeated with real branding attached to fake output. |
| `main`'s `MarketIntel.tsx` (salary-benchmark tool over hardcoded `SALARY_DATA`/`DEMAND_DATA`) | Fails today (Q5 — no real evidence backs the numbers) but the *feature shape* (workforce planning, Q&A 13/19 in `PRODUCT_COHERENCE_REVIEW.md`) is legitimate for a later phase once real aggregate data exists across enough employers to be meaningful and non-identifying. |
| `main`'s `SmartMatchWidget.tsx` (real, if simple, skill/location/WRI/category scoring algorithm, currently run over mock localStorage data) | Passes structurally — this is the one place in either codebase with an honest, explainable, non-fabricated matching algorithm. It should be the starting point for Matching-layer work, run against real evidence instead of `localStorage`. |

## Employer Talent DNA is the mechanism, not a feature

The seven-question test cannot be answered generically — "reduce risk" is meaningless until an employer's actual role requirements, culture, and success criteria are captured in a structured, queryable way. That capture mechanism is Employer Talent DNA, detailed in its own document (`EMPLOYER_TALENT_DNA.md`). HR value and Talent DNA are two sides of the same requirement: value cannot be delivered without the DNA input, and DNA capture is pointless without a value delivery loop (better shortlists, explainable matches, retention insight) on the other end.

## What would make HR actually pay

Drawing on the African workforce context (`AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`) and the audit of what currently exists:

- **Time saved on shortlisting** is the most immediately monetisable value for SME/NGO/school employers with no dedicated recruiter — this is where `backup-old-site`'s `EmployerDashboard.tsx` applicant-pipeline pattern (kanban filter, private notes, status pipeline) is worth rebuilding first, on real data.
- **Confidence in a first hire from an unfamiliar background** — this is the differentiated value only Levav can offer versus a job board, precisely because it depends on evidence (Layer 3) a CV cannot carry. This is the wedge, not a nice-to-have.
- **Retention/early-performance insight fed back into future hiring** (Outcomes layer) is the long-term moat — see Q19/Q20 in `PRODUCT_COHERENCE_REVIEW.md` — but it requires outcome data that can only accumulate after real hires happen through the platform, so it cannot be the Phase One pitch; it's the reason Phase One must ship with real evidence and real matching from day one rather than deferring quality to "later."

## What Levav is not, from the employer's side

Not an ATS that only tracks pipeline state an employer already has from elsewhere. Not a job board that trades in volume of unfiltered applications. Not a generic assessment platform whose scores don't connect to a role or an organisation's actual context. See `PRODUCT_COHERENCE_REVIEW.md` Q7–Q9 for the full argument.
