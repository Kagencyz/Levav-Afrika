# WP-0304 — Trajectory and Role Readiness

**Status:** READY_FOR_BUILD · **Sprint:** 3 · **Owner after handoff:** Codex
**Requirement IDs:** WRI-001, WRI-002, EMP-TAL-001, EMP-TAL-002, EMP-TAL-003, PDR-0012
**Audit classification:** BUILD · **Binding spec:** `WRI_SCIENTIFIC_SPEC_v1.md` §5

---

## Product problem

Two of the six required WRI outputs are missing, and both need a series of snapshots to exist before they can be computed.

**Trajectory** answers whether a dimension is improving, stable or weakening (EMP-TAL-003). It is the output that turns a score into something a person can act on — a mediocre estimate that is climbing means something quite different from the same estimate that is falling.

**Role Readiness** answers what the evidence supports for a *named target role* (EMP-TAL-002), alongside Current Role Readiness for the role they hold now (EMP-TAL-001). An employed senior accountant is not an entry-level job seeker, and the product must stop treating everyone as one.

The trap in both is overclaiming. Two snapshots a week apart are not a trend, and a target role the member picked in onboarding is not a validated career pathway.

## User journey

A member sees that their reliability evidence has strengthened over three months while their communication evidence has not moved, and what would change that. Separately, they see what their evidence supports for the role they are working towards, and specifically what is missing — not a verdict on whether they will get it.

## In scope

1. **Trajectory per dimension**, computed over the snapshot series: improving, stable, weakening, or **insufficient history** — a first-class state, not a default of "stable".
2. **A minimum-history rule**, configured not hard-coded: below it, trajectory is `insufficient history`. Two snapshots days apart is noise.
3. **Change attribution** — what evidence entered or left between the compared snapshots. A trajectory a member cannot trace back to something they did is not useful.
4. **Current Role Readiness** (EMP-TAL-001) — evidence relevant to the role they hold, from their profile.
5. **Next Role Readiness** (EMP-TAL-002) — evidence relevant to their declared target role, plus **what is missing**, which is the actionable half.
6. **Role Readiness stored on the snapshot** and versioned with it, so it is as replayable as everything else.
7. **Explicit gap output** — which dimensions or evidence levels the target role's profile calls for and the member has not got.

## Out of scope

- **Role Fit.** Not a WRI output (WRI-002). It uses role requirements and Workforce Graph context and belongs to Sprint 6. **Role Readiness and Role Fit must never appear as one value, one field or one screen element.**
- Any employer-facing exposure. Sprint 6.
- Any display — WP-0305.
- Role requirement modelling beyond what the taxonomy already provides. A full role-requirements graph is Sprint 9; Sprint 3 uses the career taxonomy from WP-0101 and declares its limits.
- Prediction of any kind. Trajectory describes what happened, never what will.

## Existing behaviour to preserve

- WP-0303's snapshot immutability. Trajectory is computed and stored on **new** snapshots; it never writes into old ones.
- The engine's purity — trajectory computation takes a snapshot series as input and stays pure, for the same replayability reasons.
- Member-facing surfaces unchanged until WP-0305.

## Acceptance criteria

1. Trajectory returns `insufficient history` below the configured minimum. It never defaults to "stable" — absence of history is not evidence of stability (the same reasoning as PDR-0012).
2. The minimum-history rule is configuration, not a literal.
3. Trajectory is computed from snapshots, not recomputed from raw evidence — otherwise a model change would silently rewrite history.
4. Change attribution names the evidence that entered or left between compared snapshots.
5. **Current and Next Role Readiness are separate values**, both present where a role and a target role exist, both absent (not zero) where they do not.
6. Role Readiness gap output names missing dimensions and evidence levels specifically.
7. **Role Readiness and WRI are separate fields end to end** — schema, engine return type, and API. A test asserts no endpoint returns them merged.
8. **The word "fit" appears nowhere** in this packet's fields, types or copy. Grep and confirm.
9. Trajectory and Role Readiness are stored on the snapshot and versioned with it.
10. Computation is pure and deterministic; same series, same result.
11. No predictive language in any output, field name or copy.
12. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Additive to WP-0303's snapshot. Trajectory and Role Readiness are computed at snapshot time and stored with the model version that produced them.

Target role comes from WP-0102's onboarding capture. Where the member declared none, Next Role Readiness is **absent** — not zero, not a default to their current role.

## Privacy requirements

- Trajectory is sensitive: it describes whether someone is getting better or worse at their work. Subject-only in Sprint 3, same as snapshots.
- Change attribution may reference evidence from a client or supervisor. It must not disclose anything about that actor beyond what the evidence already showed.
- In scope for SEC-010 export.

## Security considerations

- No employer read path. Trajectory is exactly the sort of output an employer would value and has no entitlement to see in Sprint 3.
- Gap output must not leak role-requirement internals that later become commercial (SEC-011).
- Subject-only reads, with negative tests as in WP-0303.

## Analytics and event requirements

`wri.trajectory.computed` with the direction and dimension — never values. Aggregate trajectory distribution is a product-health signal: if nobody's readiness ever improves, either the product is not developing anyone or the model cannot detect improvement, and both are worth knowing early.

## UI states

None. Any user-visible change is a defect until WP-0305.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | One snapshot | `insufficient history` for every dimension |
| 2 | Two snapshots one day apart | `insufficient history` |
| 3 | Series showing genuine improvement | `improving`, with attribution naming the new evidence |
| 4 | Series where strong new evidence lowered an estimate | `weakening`, attributed — not suppressed because it looks bad |
| 5 | Series with no material change | `stable` |
| 6 | Member with no target role | Next Role Readiness absent, not zero |
| 7 | Member with a target role and partial evidence | Readiness plus a specific gap list |
| 8 | Any endpoint merging WRI and Role Readiness | None exists |
| 9 | Grep for "fit" in this packet's surface | No results |
| 10 | Model version bump, recompute | Old snapshots' trajectories unchanged |
| 11 | Same series computed twice | Identical |

## Dependencies

**WP-0303** must be ACCEPTED and must have produced a snapshot series. **WP-0102** supplies the target role. Blocks WP-0305.

## Open product decisions

1. **Minimum history for trajectory.** Recommended: at least three snapshots spanning at least 30 days, configurable. Both bounds matter — three snapshots in one afternoon is not a trend either.
2. **How Role Readiness maps to role requirements** before the Workforce Graph exists. Recommended: derive a provisional dimension emphasis from the taxonomy's career family and seniority, label it provisional in the data, and treat it as replaceable in Sprint 9. Do not invent a detailed role-requirements model in Sprint 3 — that is Workforce Graph work, and a provisional stand-in that looks authoritative is worse than one that admits what it is.
3. **Whether weakening trajectories are shown to members at all.** Recommended yes, with the gap and the next action alongside. A measurement system that only reports good news is not a measurement system. This is a product judgement worth revisiting with real users, and it is recorded here so it is a decision rather than an accident.
