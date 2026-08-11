# Workforce Readiness Intelligence — Conceptual Model

**Status:** Product/data-model design document. Conceptual only — no schema is being created or modified by this document; see `DATABASE_DOMAIN_GAP_ANALYSIS.md` for how this maps to actual tables when Phase One implementation begins.

## The failure mode this model exists to prevent

Registration must not produce substantial readiness milestones. Completing profile fields is not proof of readiness. Self-reporting is not the same as demonstrated capability. A WRI that moves because someone filled in a form is not workforce readiness *intelligence* — it's a progress bar wearing a science costume. `backup-old-site`'s own `WriHistoryPage.tsx` is a cautionary example of the adjacent trap: a polished "WRI score timeline" UI backed entirely by `demoWriHistory`/`demoWriTrends` static arrays, with no real persisted history underneath it at all.

## What WRI must become

A living, explainable, evidence-backed readiness intelligence system — not a single universal score.

## Ten conceptual components

1. **Core workforce readiness** — a general-purpose baseline signal, useful for initial visibility, explicitly labelled as general and not role-specific.
2. **Readiness dimensions** — the decomposed signals underneath the core score (list below). The core score is a summary of dimensions, never computed independently of them.
3. **Evidence confidence** — a parallel signal to every score: how much of the underlying evidence is verified vs self-reported vs inferred. Never displayed without the score it qualifies.
4. **Growth trajectory** — direction and rate of change over time, not a snapshot. This is often more informative to an employer than the absolute value (a rising-trajectory candidate with a lower current score may be a better hire signal than a flat high one, depending on role).
5. **Consistency over time** — a distinct signal from trajectory: does the person show up reliably, or in bursts? Both matter and answer different employer questions.
6. **Role-specific readiness** — the same talent can score differently against different role profiles, because different roles weight the dimensions differently. There is no single "how ready is this person" answer independent of "ready for what."
7. **Organisation-context alignment** — readiness *for this organisation's actual context* (per its Talent DNA — see `EMPLOYER_TALENT_DNA.md`), distinct from role-specific readiness. A person can be role-ready but context-misaligned, or vice versa.
8. **Areas requiring development** — an explicit, first-class output, not an afterthought. What's uncertain and what would most improve the signal, stated plainly to the talent.
9. **Verified contribution** — volunteering, endorsed work, development-organisation-attested milestones — evidence categories that exist outside a formal employer relationship (see `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md` on informal/invisible experience).
10. **Outcome history** — how prior readiness signals actually correlated with real outcomes (interview performance, workplace feedback, retention) once outcomes exist to learn from. This component cannot populate until the Outcomes layer has real data — it's listed here as the eventual closing of the loop, not a Phase One input.

## Readiness dimensions (the decomposition under component 2)

Critical thinking, problem-solving, communication, collaboration, reliability, adaptability, learning agility, professional discipline, integrity, execution, initiative, leadership, digital capability, customer orientation, and role-specific competence.

Each dimension must be backed by real evidence sources per `TALENT_DEVELOPMENT_MODEL.md`'s capability pipeline — not asserted, computed. `backup-old-site`'s `api/services/wri-calculator.ts` is a genuine, working reference for this: a weighted 7-component engine (culture 15%, critical thinking 15%, reliability 15%, communication 15%, learning 15%, leadership 12%, impact 13%) pulling real signals from Levav 28 progress, volunteer hours, course completions, shift ratings, applications, and skills, with tier derivation and a component-score audit log. It is real, deterministic, production-shaped domain logic and the strongest single reusable asset found in either codebase for this component — see `ARCHIVED_IMPLEMENTATION_REVIEW.md`. Its specific weights and 7-dimension set are a starting reference, not a mandate; Phase One should re-derive weights deliberately against the 15-dimension list above rather than copy them verbatim.

## What influences scores and readiness signals

Completed challenges, submitted work, assessment quality, project outcomes, consistency, learning completion, critical-thinking tasks, response to feedback, collaboration, volunteering, verified endorsements, interview performance, workplace outcomes, and authenticated evidence. Notably absent from this list, deliberately: profile completeness, account age, or self-reported skill tags with no backing evidence.

## Why not one universal score

The same talent may simultaneously have strong general readiness, moderate readiness for one role, high readiness for another, strong alignment with one organisation and low alignment with another, strong potential but insufficient current evidence. A single number collapses all of this into something that answers no one's actual question. The UI implication: WRI is always presented *in context* — general, role-scoped, or organisation-scoped — never as a bare number with no frame.

## Explainability requirement

Every result must be explainable, on both sides:

- **Talent** sees why the result exists, what evidence supports it, what remains uncertain, and what actions would improve it.
- **Employer** sees what the score means, what it does not mean, what evidence supports it, how reliable that evidence is, and how relevant it is to their specific role/context.

This is a hard interface requirement, not a documentation nicety: no WRI display surface (talent dashboard, employer shortlist, matching result) may show a number without a reachable "why" behind it. `backup-old-site`'s `wri-calculator.ts` logging component-score deltas to an audit table (`wriComponentScores`) is the right shape of primitive to build this on.

## Evidence confidence, concretely

Every evidence item needs an explicit state, not an implicit assumption of trust: self-reported / peer-attested / organisation-verified / independently verified. Confidence propagates into the readiness dimension it feeds — a dimension built mostly on self-reported evidence should visibly read as lower-confidence, not silently average in with verified evidence at equal weight. This directly serves `AFRICAN_WORKFORCE_PRODUCT_PRINCIPLES.md`'s qualification-fraud concern and is a precondition for the HR value proposition's "trustworthy evidence" requirement (`HR_VALUE_PROPOSITION.md` Q5).

## Where AI fits, precisely — and where it is not allowed to fit

The AI layer (profession-personalised scenario generation, response analysis, observation-writing — see `TALENT_DEVELOPMENT_MODEL.md`'s governance-boundary section) is an **evidence source**, not a scoring authority. Concretely:

- An AI-generated observation about a talent's response enters the system exactly like any other evidence item — with an explicit confidence state (never "verified" by default merely because it came from AI; typically self/AI-observed until corroborated), tagged to the readiness dimension(s) it speaks to.
- **The scoring engine — Levav's own rubrics and weighting, not the AI — is what turns that observation into any movement in a readiness dimension.** This is the same engine referenced above (the archived `wri-calculator.ts` pattern): deterministic, weighted, auditable, logging component-score deltas. AI never writes to a score directly; it writes an observation that the scoring engine then evaluates against a rubric, same as it would evaluate a peer review or a mentor's structured feedback.
- This keeps the "why" in the explainability requirement (above) answerable in plain, non-black-box terms: "this dimension moved because of X evidence, weighted Y by the rubric" — never "the AI decided this person scored 72."

## Phase One scope note

Component 10 (Outcome history) cannot be built until real outcomes exist — it is listed for completeness and future sequencing (`INTEGRATION_ROADMAP.md` Slice 13), not as a Phase One deliverable. Components 1–9 are Phase One scope, phased across Slices 5–13.
