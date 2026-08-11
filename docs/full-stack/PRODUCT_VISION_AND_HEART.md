# Product Vision and Heart

**Status:** Product-strategy document produced during the Reconciliation, Modernisation and Integration phase, directly capturing the product mandate given for this phase. This is the canonical statement of *why* Levav exists — other documents in this folder answer *what to build* and *in what order*; this one is the test every one of those answers must pass.

## What "Levav" means, and why it is the product's organising idea

Levav speaks to the heart — the inner person: mindset, judgement, intention, character, intelligence, and the capacity from which meaningful action flows. That is not a branding flourish. It is the reason the product is structured around *becoming* (development, evidence, growth) rather than around *listing* (a directory of registered users with self-reported fields). A platform named for the heart cannot reward registration; it can only reward the things a heart actually does — think, decide, act, improve, contribute.

## Why Levav exists

- Reveal potential.
- Develop capability.
- Strengthen mindset.
- Build critical thinkers.
- Produce credible evidence.
- Celebrate African intelligence.
- Connect people to meaningful opportunity.
- Help organisations build exceptional teams.
- Contribute to the Africa we want to see.

## The primary product principle

Every feature must answer at least one of these two questions clearly, or it should be redesigned, deferred, or removed:

1. **Does this help an organisation make a better workforce decision, reduce risk, improve productivity, or build a stronger team?**
2. **Does this help the talent become a better, more capable, more responsible, more thoughtful, more valuable version of themselves — and contribute to the Africa we want to build?**

This is the filter applied throughout `PRODUCT_SURFACE_INVENTORY.md`, `PRODUCT_COHERENCE_REVIEW.md`, and the retain/redesign/defer calls in the Final Report. A feature that cannot clear this bar does not get a "maybe" — the audit treats "unclear value" as a defer/redesign signal, not a pass.

## Levav is not, and must resist becoming

- A collection of disconnected dashboards.
- Attractive but non-functional pages.
- Placeholder metrics.
- Isolated backend routers with no frontend consumer (or vice versa).
- Duplicated concepts (both codebases audited here already show this failure mode concretely — two employer dashboards, three onboarding flows, two admin dashboards in `backup-old-site`; a five-section admin panel in `main` that silently never shows real data).
- Generic AI-generated interfaces.
- Unearned scores (a WRI that moves because a form was filled in, not because something was demonstrated).
- Forms that lead nowhere.
- Features that do not contribute to a measurable workforce outcome.

The platform must feel intentional, intelligent, premium, modern, and deeply human — see `UI_UX_MODERNISATION_REVIEW.md` for how the current visual system measures against that bar, and `DESIGN_SYSTEM_RECOMMENDATION.md` for how to hold it as the product grows.

## The six connected product layers

Every major Levav feature belongs to one or more of these. A feature that belongs to none of them is out of scope for Phase One, full stop.

1. **Levav Identity** — who is this person or organisation: user identity, talent identity, organisation identity, membership, authority attestation, verification, public/private profiles, consent, trust, access control.
2. **Levav Development** — how the person becomes more ready, capable, and valuable: onboarding, Levav 28, learning, challenges, reflection, critical thinking, communication, problem-solving, collaboration, execution, leadership development, professional discipline.
3. **Levav Evidence** — what proves capability and growth: submitted work, projects, assessments, verified experience, volunteering, endorsements, workplace feedback, learning completion, interviews, task outcomes, certificates, badges, evidence confidence, performance history.
4. **Levav Opportunity** — where readiness can be applied: jobs, graduate programmes, internships, fellowships, volunteering, learning opportunities, mentoring, QuickWork, future SkillSpace.
5. **Levav Matching** — where the best contextual fit is: role requirements, organisation culture and goals, capability requirements, behavioural expectations, readiness dimensions, candidate aspirations, evidence confidence, location, availability, employer Talent DNA.
6. **Levav Outcomes** — what value was ultimately created: interviews, placement, hiring, retention, performance, productivity, learning outcomes, increased capability, improved income, employer satisfaction, promotions, workforce planning, organisational impact.

These layers are deliberately sequential in causal logic (identity enables development, development produces evidence, evidence unlocks opportunity, opportunity plus matching produces outcomes) but are not a rigid pipeline in the UI — a returning user moves between them constantly. The Integration Roadmap's slice ordering (`INTEGRATION_ROADMAP.md`) follows this causal order for Phase One precisely because each layer's data becomes the *input* to the next; building Matching before Evidence exists, for instance, gives you `backup-old-site`'s `JobMatchingPage.tsx` mistake — a "match score" that is actually a hardcoded array, because there was nothing real underneath it to compute from.

## The daily-return test

A platform organised around becoming, not listing, must answer: what makes someone open Levav on a Tuesday they have no interview scheduled? The honest answer has to be development and evidence-building (a Levav 28 day, a reflection, a course module, a challenge), not a notification bell — notifications sustain a habit that must already exist for another reason. Every Development- and Evidence-layer feature should be evaluated partly on whether it gives a person a reason to return without an external trigger.

## Guardrail against decorative excellence language

"Celebrate African intelligence" and "Africa is capable" are not achieved by copy on a landing page (see `HeroSection.tsx`'s hardcoded, unverifiable "2,500+ Talents / 45+ Countries / 98% Completion" stats in `main` — a concrete example of the trap this vision must avoid: claiming excellence instead of evidencing it). They are achieved by the product actually producing verifiable evidence of capability, actually connecting that evidence to real opportunity, and actually reporting real outcomes back. `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md` and `WRI_CONCEPTUAL_MODEL.md` carry this into concrete design requirements.
