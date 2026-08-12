# WP-0302 — Scoring and confidence engine

**Status:** READY_FOR_BUILD · **Sprint:** 3 · **Owner after handoff:** Codex
**Requirement IDs:** WRI-001, WRI-002, WRI-003, WRI-004, WRI-005, EVD-003, AFR-009, PDR-0012
**Audit classification:** BUILD · **Binding specs:** `WRI_SCIENTIFIC_SPEC_v1.md` §4, §5, §6; `BARS_v1.md` §3

---

## Product problem

This is the part of Levav that has to be scientifically defensible. Everything else in the product is software; this is a measurement instrument, and it will be used to influence whether people get work.

It must be **deterministic** — same evidence, same model version, same result, every time. Without that there is no calibration, no fairness analysis, no historical cohort testing, and no way to answer a member who asks why their readiness changed.

## The structural requirement

**The engine is a pure function.** It takes an evidence set and a resolved coefficient set, and returns the six outputs from `WRI_SCIENTIFIC_SPEC_v1.md` §5. It reads no database, writes nothing, calls no service, and consults no clock except one passed in.

This is not a style preference. It is what makes the model testable against fixtures, replayable against historical cohorts before a version is released (WRI-GOV-001), and analysable for fairness by running the same evidence through different versions. A service that queries as it computes cannot do any of those things.

## In scope

1. **The pure engine** — `(evidenceSet, coefficientSet, asOf) → outputs`.
2. **Estimate per dimension**, computed only from evidence whose `eligible_dimensions` includes that dimension (Evidence Graph §5 — the ceiling is never exceeded).
3. **Confidence per dimension and overall**, computed **independently** of the estimate, from the §6 inputs: observation count, evidence diversity, independent actors, E3/E4 coverage, recency distribution, duration, cross-context agreement, measurement reliability.
4. **Coverage** — which dimensions and evidence levels are represented, and which are absent.
5. **Overall estimate across measured dimensions only**, reporting how many of the ten are measured. Two measured dimensions do not mean 20% of a person (PDR-0012).
6. **Explainability output** — for every dimension, which evidence nodes contributed, at what weight, and why. This is a first-class return value, not a debug mode.
7. **Exclusion of `disputed` and `quarantined` evidence**, with the exclusion visible in the explanation.
8. **The fixture suite** described in `SPRINT3_PLAN.md` — synthetic evidence sets that become the permanent regression corpus for every future model version.

## Out of scope

- **All persistence.** Snapshots are WP-0303. This packet returns values; it stores nothing.
- Trajectory and Role Readiness — WP-0304. Trajectory needs snapshots over time, which do not exist yet.
- **Role Fit.** Not a WRI output (WRI-002). Sprint 6.
- Any display, API endpoint or client exposure.
- Producing evidence. The engine consumes it.

## Existing behaviour to preserve

All Sprint 0–2 behaviour unchanged. This packet adds a module and its tests.

## Acceptance criteria

1. **The engine is pure.** No database access, no network, no service calls, no `Date.now()` inside — time is a parameter. A test calls it with no database available and it works.
2. **Deterministic.** The same fixture and coefficient set produce a byte-identical result across 100 runs and across processes.
3. **The eligible-dimensions ceiling is never exceeded.** A node declaring only D5 can never move D9. Asserted across the whole fixture suite.
4. **Confidence can rise while the estimate falls.** A dedicated fixture demonstrates this, and the test asserting it is marked as a governing invariant that may not be weakened without a PDR.
5. **Confidence is bounded by its weakest input, not an average.** Twenty observations from one actor do not produce high confidence. Fixture required.
6. **An unmeasured dimension returns `not measured`** — a distinct value, not zero, not null-coerced-to-zero anywhere in the return type (PDR-0012). Asserted at the type level where the language allows.
7. **`not_exercised` ratings contribute nothing** — no estimate effect, no confidence effect (`BARS_v1.md` §3).
8. **Disputed and quarantined evidence is excluded**, and the explanation states that it was excluded and why.
9. **Every dimension estimate is explainable** — node ids and weights returned. A test asserts the contributions reconstruct the estimate.
10. **No coefficient literal appears in engine code** (WP-0301 criterion 5). All values arrive in the coefficient set.
11. **E0 alone can never lift a dimension above provisional confidence** (WRI spec §4 rule 2). Fixture required.
12. **D7 requires two time-separated observations**; with one, it returns `not measured` (WRI spec §4 rule 7).
13. Fixture suite covers all six cases named in `SPRINT3_PLAN.md`, and each fixture's expected output is committed so a model change shows as a visible diff.
14. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

None. The engine touches no storage. Fixtures are committed test data, structured as evidence sets matching the Evidence Graph contract §3 shape — so a fixture is a realistic node set, not a convenient abstraction.

## Privacy requirements

Fixtures are synthetic. **No real member evidence may be committed as a fixture**, now or later, regardless of anonymisation — a readiness profile is re-identifiable from its shape.

## Security considerations

- The explanation output contains node ids and weights. It is **internal** — WP-0305 and Sprint 6 decide what a member or employer sees, and neither may receive raw weights (SEC-011).
- The engine must not be reachable from a client. It is a module, not an endpoint.

## Analytics and event requirements

None — a pure function emits nothing. Its caller (WP-0303) handles observability.

## UI states

None. Any UI is a defect.

## Test scenarios

| # | Fixture | Expected |
|---|---|---|
| 1 | Empty evidence set | All ten dimensions `not measured`; no zeros anywhere |
| 2 | One weak E0 claim | Dimension still `not measured` — E0 with no eligible dimensions contributes nothing |
| 3 | Single observation, one dimension | That dimension measured at provisional confidence; nine `not measured` |
| 4 | 20 observations, one actor, one context | Estimate rises; confidence stays capped |
| 5 | 6 observations, three independent actors, three contexts | Confidence materially higher than #4 despite fewer observations |
| 6 | Strong new E3 evidence contradicting a high E2 estimate | **Estimate falls, confidence rises** |
| 7 | Evidence at every level E0–E4 | Weighting ordered E4 ≥ E3 > E2 > E1 > E0 |
| 8 | Half the set disputed | Excluded; explanation says so; estimate reflects only the remainder |
| 9 | Node declaring D5 only | D9 unmoved |
| 10 | All ratings `not_exercised` | `not measured`, not a low score |
| 11 | One observation for D7 | D7 `not measured` |
| 12 | Same fixture, 100 runs, two processes | Byte-identical |
| 13 | Same fixture, coefficient set v1 vs a modified v2 | Different results, both deterministic, diff visible |

## Dependencies

**WP-0301** must be ACCEPTED. Blocks WP-0303 and WP-0304.

## Open product decisions

1. **Aggregation across dimensions for the overall estimate.** Recommended: a simple mean across *measured* dimensions for v1, with the count of measured dimensions returned alongside and never suppressed. Weighted aggregation implies we know which dimensions matter more, and we do not yet — that is what criterion validity (Sprint 7) will tell us.
2. **How recency decay is applied.** Recommended: continuous decay by a configured half-life, never a cliff (WRI spec §4 rule 5). Old evidence keeps contributing at reduced weight and never expires to nothing.
3. **Whether confidence is a continuous value or the four bands** in the copy dictionary. Recommended: continuous internally, banded for presentation — same reasoning as the estimate in WP-0301.

Implement the recommendations and note them. If Codex believes an aggregation approach materially changes what WRI means, return `BLOCKED_PRODUCT_DECISION` rather than choosing — that is a scientific question, not an implementation one.
