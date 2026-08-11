# Employer Talent DNA

**Status:** Product/data-model design document, conceptual only.

## What Talent DNA is

Employers should not merely create an account. They should build a rich organisation and workforce profile that Levav uses to explain, target, and improve matching over time — not a static "about us" field.

## What it captures

Organisation name, type, mission, vision, values, culture, operating environment, leadership style, communication style, decision-making style, pace of work, team dynamics, innovation appetite, customer philosophy, growth plans, workforce goals, hiring philosophy, capability gaps, retention challenges, role outcomes, behavioural expectations, essential capabilities, trainable capabilities, performance indicators, and what success looks like after 30, 90, and 365 days.

## What Levav does with it

- Recommends better candidates.
- Explains why candidates are relevant (an explanation is not optional — see `WRI_CONCEPTUAL_MODEL.md`'s explainability requirement, which Talent DNA is the other half of).
- Identifies capability gaps.
- Builds talent pipelines.
- Prepares people before vacancies arise.
- Supports workforce planning.
- Improves matching over time as outcome data accumulates (`WRI_CONCEPTUAL_MODEL.md` component 10).

## The hard requirement: translate preference into observable criteria

This is the part of Talent DNA that most needs product and engineering discipline, because "culture fit" is the most common vector for bias in hiring anywhere in the world, and a platform that operationalises culture matching without a translation layer will automate the bias instead of reducing it.

The system must distinguish:

- Culture contribution vs culture sameness.
- Legitimate role requirements vs personal preference.
- Essential criteria vs trainable criteria.
- Evidence vs self-reported claims.
- Potential vs current readiness.
- Qualification vs actual capability.
- Fit vs discriminatory exclusion.

**Culture matching must never become a proxy for:** tribalism, class preference, gender bias, age bias, disability exclusion, elite-school bias, accent preference, appearance, personal familiarity, or vague statements like "people like us."

### Translation table — the interaction pattern this requires

The Talent DNA intake UI cannot accept free-text "what kind of person fits your culture" and hand it to a matching algorithm unexamined. It must guide employers from vague preference language to observable, job-relevant, explainable criteria, at the point of entry — not as a moderation pass after the fact.

| Instead of accepting | Levav should prompt toward |
|---|---|
| "We want people who fit our culture" | "Works effectively in structured environments" / "Communicates clearly with customers" / "Manages ambiguity" / "Takes initiative without constant supervision" / "Follows procedures accurately" / "Handles pressure responsibly" / "Collaborates across departments" / "Responds constructively to feedback" |
| "Young and energetic" | Age is never an acceptable criterion; if the underlying need is "adapts quickly to new tools," capture that instead |
| "From a good university" | If the underlying need is a specific verified competency, capture the competency directly and let evidence (not pedigree) satisfy it — this is the direct product expression of `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`'s "capable people without elite credentials" principle |
| "Someone who'll fit in with the team" | Decompose into specific observable behavioural expectations (communication style, collaboration pattern, pace of work) that can actually be evidenced against a candidate's Levav profile |

### Implementation implication

Each captured "criterion" in Talent DNA needs a type tag (essential / trainable / preference-flagged-for-review) and, ideally, a lightweight real-time check against the translation table above at entry time — free-text fields that map to a known bias-risk pattern (age, school-name, appearance-adjacent language) should be flagged for reframing before they can be saved as matching criteria, not silently accepted and only caught later in an audit.

## Bias detection and control as an ongoing product responsibility

This is not a one-time intake-form fix. `HR_VALUE_PROPOSITION.md` Q6 ("How is bias detected and controlled?") must be answerable on an ongoing basis: outcome data (who gets shortlisted, interviewed, hired, against which stated criteria) needs to be reviewable for disparate impact once volume exists, and the Talent DNA criteria themselves should be periodically re-surfaced to the employer for review rather than treated as set-once-forget-forever.

## Relationship to matching and WRI

Talent DNA is the organisation-side input that `WRI_CONCEPTUAL_MODEL.md` component 7 (organisation-context alignment) and component 6 (role-specific readiness) are computed against. Neither can exist meaningfully without the other — this is why Employer onboarding + Talent DNA (`INTEGRATION_ROADMAP.md` Slice 8) is sequenced immediately after Identity, before Jobs/Matching, rather than treated as an optional enrichment step employers can skip.

## What this replaces from the archived implementation

`backup-old-site` has no equivalent Talent DNA concept — its employer side (`EmployerDashboard.tsx`) is a real, well-built ATS but has no structured organisation-context capture beyond a flat "company profile" settings tab, and its one "AI-powered matching" surface (`JobMatchingPage.tsx`) is a hardcoded score array with nothing resembling this model underneath it. Talent DNA is new conceptual scope for Phase One, not a rebuild of anything that already exists — see `ARCHIVED_IMPLEMENTATION_REVIEW.md`.
