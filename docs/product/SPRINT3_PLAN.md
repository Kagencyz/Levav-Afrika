# Sprint 3 — Versioned WRI Engine

**Owner:** Claude (Product Command). **Requirements:** WRI-001 … WRI-005, WRI-GOV-001, EMP-TAL-001 … 003, EVENT-002, OBS-003, OBS-006, SEC-011, §48, §49
**Binding specs:** `specs/product-contracts/WRI_SCIENTIFIC_SPEC_v1.md`, `specs/rubrics/BARS_v1.md`, `specs/product-contracts/EVIDENCE_GRAPH_CONTRACT_v1.md`
Where a packet and a spec differ, the spec wins and the packet is a defect.

---

## Exit gate (Master PRD §46)

> Given controlled test evidence, the system produces deterministic versioned WRI snapshots and separate confidence values, with traceable contributions and tests.

**Deterministic** is the operative word. The same evidence and the same model version must always produce the same snapshot. A scoring engine that cannot be replayed cannot be audited, calibrated or defended.

## Packet sequence

| ID | Title | Depends on |
|---|---|---|
| **WP-0301** | WRI model configuration — dimensions, coefficient sets, versioning | Sprint 2 complete |
| **WP-0302** | Scoring and confidence engine (pure, deterministic, no persistence) | WP-0301 |
| **WP-0303** | Snapshots and the recalculation consumer | WP-0302, WP-0202 |
| **WP-0304** | Trajectory and Role Readiness | WP-0303 |
| WP-0305 | Member-facing WRI surfaces | Scoped, **not issued** — awaits WP-0303 |

WP-0305 is withheld on the same principle as WP-0105/0106: the display cannot be specified precisely until the snapshot shape is settled in code, and §43 forbids building on unstable contracts.

## Why WP-0302 is a pure function

The single most important structural decision in this sprint: **the scoring engine takes an evidence set and a model version, and returns the six outputs. It reads no database, writes nothing, and calls no service.**

Three reasons, in order of weight:

1. **Determinism becomes testable.** Fixture in, snapshot out, byte-comparable. A model bumped from v1 to v2 can be run against a stored historical cohort in seconds, which is what WRI-GOV-001's "historical cohort tests run before release" actually requires.
2. **Calibration and fairness analysis become possible.** Both mean running the same evidence through different model versions. That is trivial against a pure function and painful against a service that queries as it computes.
3. **It separates the science from the plumbing.** The part that must be defensible to an industrial-organisational psychologist is isolated from the part that must be defensible to a database.

## The three properties every packet in this sprint must preserve

1. **Confidence is computed independently of the estimate** and can rise while the estimate falls (WRI spec §6). A test asserting exactly this is required in WP-0302 and must never be weakened.
2. **An unmeasured dimension is `not measured`, never zero** (PDR-0012). This propagates from `not_exercised` ratings through the engine to the snapshot to the display, without collapsing at any layer.
3. **Historical snapshots never mutate.** A model change produces new snapshots going forward and rewrites nothing (§48, WRI-004).

## What Sprint 3 does not build

- **Role Fit.** It is not a WRI output (WRI-002). It uses role requirements and Workforce Graph context, and belongs to Sprint 6 with employer matching. WP-0304 builds **Role Readiness**, which is a different thing: readiness evidence relative to the member's own declared target role.
- **Employer-facing WRI, entitlement or paywall.** Sprint 6. No employer may see any WRI in Sprint 3 — EMP-004 does not exist yet, and §43 forbids premium WRI UI without server-side entitlement design.
- **Final coefficients, scale, thresholds or decay rates.** All §49 human decisions. Sprint 3 ships them configurable, versioned, and labelled provisional. Hard-coding any of them as truth is prohibited.
- **Any claim of predictive validity.** Criterion validity requires E4 outcomes and cannot be claimed before Sprint 7 (WRI spec §8.2). No surface, document or copy may imply WRI predicts job performance.
- **AI evaluation of scenario responses.** That produces evidence and belongs to Sprint 4. Sprint 3 interprets evidence that already exists.

## Test evidence

The exit gate says "given controlled test evidence". Sprint 2's only producer is profile claims, which are E0 with no eligible dimensions — deliberately useless for scoring. So Sprint 3 needs **fixtures**, not a live producer.

WP-0302 defines a fixture set of synthetic evidence covering: a single weak observation, a dense single-source history, a diverse multi-source history, disputed evidence, evidence at every level E0–E4, and a case where new strong evidence lowers an estimate while raising confidence. These fixtures become the regression suite for every future model version, and they outlive this sprint.
