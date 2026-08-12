# WP-0301 — WRI model configuration

**Status:** READY_FOR_BUILD · **Sprint:** 3 · **Owner after handoff:** Codex
**Requirement IDs:** WRI-004, WRI-GOV-001, DATA-MODEL-001, SEC-011, §49
**Audit classification:** BUILD · **Binding spec:** `WRI_SCIENTIFIC_SPEC_v1.md` §2, §9

---

## Product problem

Every number the WRI engine will produce depends on coefficients nobody has validated yet. §49 makes the scale, evidence weights, confidence thresholds and recency decay **human decisions**, and §48 prohibits hard-coding provisional coefficients as permanent truth.

The failure this prevents is specific and common: a weight gets written into a function because something had to be shipped, it is never revisited, and eighteen months later it is load-bearing in a product that tells employers who to hire. This packet makes that impossible by ensuring no coefficient exists anywhere except as versioned, labelled configuration.

## User journey

None. This is the substrate the engine reads.

## In scope

1. **The ten dimensions as versioned reference data** — key, canonical display name from `COPY_DICTIONARY.md` §3, construct definition reference, active flag, version. Not a TypeScript enum, not a `src/` constant.
2. **Coefficient sets, versioned and immutable once published.** A set contains everything the engine needs: evidence-level weights, observation-versus-evaluation weighting, recency decay, independence weighting, confidence thresholds, and the scale bounds.
3. **Provisional labelling as data, not documentation.** Every set carries a status — `provisional` or `validated` — and a provenance note. Nothing may be marked `validated` in this packet; nothing has been validated.
4. **Exactly one active set** at a time, selected server-side. Changing it is a privileged, audited action.
5. **Rubric version registry** — the `bars.dN.v1` keys from `BARS_v1.md` §1, so an evaluation's `instrument_version` resolves to a known instrument.
6. **A published default set**, version 1, entirely provisional, with every value's rationale recorded — including "chosen as a starting point, not validated" where that is the honest answer.

## Out of scope

- **Any computation.** WP-0302 is the engine. This packet ships configuration and nothing that consumes it.
- Any admin UI. Changing a coefficient set is a migration or a privileged server-side action in Sprint 3, not a screen — a UI for changing scoring weights before governance exists is an invitation.
- Marking anything `validated`. That requires the §12.4 governance group and the validation programme.
- Role Readiness weighting — WP-0304.

## Existing behaviour to preserve

All Sprint 0–2 behaviour unchanged. This packet adds reference data and touches nothing existing.

## Acceptance criteria

1. Ten dimensions exist as versioned reference data with the canonical display names from the copy dictionary, matching `WRI_SCIENTIFIC_SPEC_v1.md` §2 exactly. A test asserts the set matches the spec — if someone edits one, the test fails.
2. A coefficient set is immutable once published. An attempted update fails; a change requires a new version. Demonstrate.
3. Every published set carries `status` and a provenance note. **No set is `validated`.** A test asserts this for Sprint 3.
4. Exactly one set is active. Activating another is server-side, privileged and audited; a standard user attempting it via direct API is rejected.
5. Coefficient values are **never** referenced as literals in engine code. `grep` for numeric weights in `server/` returns nothing that looks like a coefficient. Every value is read from configuration.
6. Rubric version keys resolve; an evaluation citing an unknown `instrument_version` can be detected.
7. Coefficient sets are **not readable by any non-privileged caller** (SEC-011). No endpoint returns them to a client. Negative test.
8. Reversible migration; RLS and grants follow the existing pattern; no DELETE grant.
9. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Reference tables, not `src/` constants — configuration in the frontend cannot be versioned, audited or kept from a client.

A coefficient set is one row with a structured `jsonb` payload plus version, status, provenance, published-at and activated-at. Immutability is enforced in the database, matching the evidence-table pattern from WP-0201.

## Privacy requirements

No personal data. The sensitivity here is the reverse of usual: this is the scoring key, and it must not leak (SEC-011).

## Security considerations

- **Coefficient sets are internal.** Anything that renders or returns them to a client is a defect, including error messages and debug output.
- Activation is privileged and audited — changing the active set changes every future readiness conclusion in the product.
- No endpoint accepts a coefficient set from a request body.
- Do not log full set contents.

## Analytics and event requirements

`wri.model.activated` with the version, actor and timestamp. This is an audit event first and an analytics event second — OBS-005 requires manual overrides and high-risk changes to be auditable, and OBS-006 requires controlled rollout for high-risk scoring changes.

## UI states

None. Any UI is a defect.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Dimension set compared to `WRI_SCIENTIFIC_SPEC_v1.md` §2 | Exact match |
| 2 | Update a published coefficient set | Rejected |
| 3 | Publish a set marked `validated` | Rejected in Sprint 3 |
| 4 | Standard user activates a set via direct API | Rejected |
| 5 | Any client endpoint returning coefficients | None exists |
| 6 | Grep engine code for numeric coefficient literals | None |
| 7 | Two active sets | Prevented by constraint |
| 8 | Migration down | Clean revert |

## Dependencies

Sprint 2 complete (§43 — migration chain). Blocks WP-0302.

## Open product decisions

1. **Internal representation of the estimate.** Recommended: a continuous internal value with banded presentation, rather than a raw 0–100 shown directly. A 0–100 number invites false precision the evidence cannot support, and banding is easier to defend and to change. The final scale remains a §49 decision — implement the internal value and leave presentation to WP-0305.
2. **Whether coefficient sets are per-dimension or global.** Recommended global for v1, with the payload shaped so per-dimension override can be added without a migration. Per-dimension weighting before any validation data exists is precision theatre.

Implement the recommendations and note them.
