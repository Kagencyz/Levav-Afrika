# WP-0303 — Snapshots and the recalculation consumer

**Status:** READY_FOR_BUILD · **Sprint:** 3 · **Owner after handoff:** Codex
**Requirement IDs:** WRI-004, EVENT-001, EVENT-002, OBS-002, OBS-003, OBS-006, SEC-004, SEC-011, §48
**Audit classification:** BUILD · **Binding spec:** `WRI_SCIENTIFIC_SPEC_v1.md` §7

---

## Product problem

WP-0302 computes. Nothing stores the result, and nothing triggers it. WP-0202 emits `wri.recalculation.queued` into a queue that deliberately has no consumer — this packet is that consumer.

The requirement that shapes everything here is WRI-004: **historical snapshots never mutate.** A model change produces new snapshots going forward and rewrites nothing. The moment history can be rewritten, every calibration claim and every explanation to a member becomes unfalsifiable.

## User journey

Indirect. A member completes work, evidence is recorded, and their readiness is recomputed without them waiting for it. When they later ask why a figure changed, the answer exists — which snapshot, from which evidence, under which model version.

## In scope

1. **Snapshot storage** with everything in `WRI_SCIENTIFIC_SPEC_v1.md` §7: model version, coefficient set version, rubric versions used, evidence window, contributing node ids with weights, all six outputs, timestamp.
2. **Immutability.** No update path exists. A correction produces a new snapshot.
3. **The recalculation consumer**, consuming `wri.recalculation.queued` from WP-0202: resolve the member's evidence set, resolve the active coefficient set, call the pure engine, persist the snapshot.
4. **Idempotency** — the same trigger does not produce duplicate snapshots for an unchanged evidence set (EVENT-001).
5. **Traceability** — every snapshot names the event that triggered it, and every contributing node is recorded (EVENT-002).
6. **Server-side read** for the subject's own current and historical snapshots. **No employer read. No public read.**
7. **Observability** from day one (OBS-002, OBS-003): recalculation lag, failure rate, queue depth, and the distribution of estimates and confidence per model version.

## Out of scope

- **Trajectory** — WP-0304. It needs a series of snapshots, which only exists once this packet has been running.
- Role Readiness — WP-0304.
- **Any member-facing display** — WP-0305. This packet stores and exposes a server-side read; it renders nothing.
- **Any employer-facing exposure whatsoever.** EMP-004 entitlement does not exist, and §43 prohibits premium WRI UI without it.
- Backfilling snapshots for historical evidence — see open decision 2.

## Existing behaviour to preserve

- WP-0202's single-writer property for evidence. This consumer **reads** evidence and writes snapshots; it never writes an evidence node.
- WP-0202's queue semantics, idempotency and dead-lettering.
- Member-facing WRI surfaces continue showing `wri.confidence.none.*` until WP-0305. **Storing a snapshot must change nothing a member sees in this packet.**
- All Sprint 0–2 behaviour unchanged.

## Acceptance criteria

1. Snapshots store every field in spec §7. Reversible migration, RLS, no DELETE grant.
2. **Immutable.** A direct SQL `UPDATE` on a stored snapshot fails. Demonstrate.
3. The consumer processes `wri.recalculation.queued` end to end and persists a snapshot whose outputs match the engine called directly with the same inputs.
4. **Idempotent.** Replaying the same trigger against an unchanged evidence set produces no second snapshot.
5. **Recalculation is never inline.** No request handler waits for a snapshot. Demonstrate that an evidence-producing request returns before recalculation completes.
6. **A model version bump creates new snapshots and alters no existing one.** Run a cohort under v1, activate v2, recompute, and assert every v1 snapshot is byte-identical to before.
7. Every snapshot names its triggering event and its contributing node ids.
8. Subject-only read. Negative tests: another member, and an unauthenticated caller.
9. **No endpoint returns weights, coefficients or rubric contents** (SEC-011). The stored contributions may hold them; the read must not expose them.
10. Consumer failure is isolated — no partial snapshot. Induced-failure test.
11. Observability metrics emitted and queryable.
12. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Snapshots are append-only, indexed by subject and by created-at, since WP-0304 will read a series per member.

Contributing node ids and weights are stored on the snapshot. This is the audit trail — without it, "explain this figure" is unanswerable a month later when evidence has moved on.

Retention: snapshots are durable and are not pruned. If volume ever demands it, that is a §49 decision, not an engineering cleanup.

## Privacy requirements

- Snapshots are personal data of the highest sensitivity in Levav. Subject-only access in Sprint 3, with no exceptions and no service path that quietly bypasses it.
- Snapshots must appear in the member's Privacy and Evidence Centre once WP-0305 lands. Confirm the WP-0204 queries can reach them, and raise a defect against WP-0204 if they cannot.
- Snapshots are within scope of SEC-010 export.

## Security considerations

- No employer, organisation or institutional read path exists in this packet. Adding one requires entitlement (EMP-004) and a product decision.
- The subject read must not leak internal weights or rubric identifiers.
- The consumer derives the subject from the source event's evidence, never from a request body.
- Rate-limit the read (SEC-008).
- **Every protected WRI view must eventually be audited** (SEC-005). The audit store does not exist — write structured logs with correlation ids and record the migration requirement in `docs/implementation/`, as WP-0104 and WP-0203 do. Do not build an audit table here.

## Analytics and event requirements

`wri.snapshot.created` with model version and dimensions-measured count — never values. Operational metrics per OBS-002/003: lag, failure rate, queue depth, and estimate/confidence distribution per model version. The distribution is a calibration and drift signal, and it is the thing that tells us the model has quietly started behaving differently.

## UI states

None. Any user-visible change in this packet is a defect — members continue to see the empty state until WP-0305.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Evidence created → event → consumer | Snapshot persisted matching a direct engine call |
| 2 | Replay the same trigger, unchanged evidence | No second snapshot |
| 3 | Direct SQL update of a snapshot | Rejected |
| 4 | Cohort under v1, activate v2, recompute | New snapshots; every v1 snapshot byte-identical |
| 5 | Evidence-producing request | Returns before recalculation completes |
| 6 | Another member reads a snapshot | Rejected |
| 7 | Unauthenticated read | Rejected |
| 8 | Subject read | No weights, coefficients or rubric contents in the payload |
| 9 | Induced consumer failure | No partial snapshot; retried |
| 10 | Dispute an evidence node | Recalculation queued; new snapshot excludes it; prior snapshot unchanged |
| 11 | Member-facing surfaces after a snapshot exists | Still the empty state |

## Dependencies

**WP-0302** (engine) and **WP-0202** (queue) must be ACCEPTED. Blocks WP-0304 and WP-0305.

## Open product decisions

1. **Recalculation granularity.** Recommended: recompute all dimensions for the member on any trigger. Partial recomputation is an optimisation with a correctness risk, and member evidence volumes are small for years.
2. **Backfill.** Recommended: **do not backfill** snapshots for evidence that predates this packet. Generate the first snapshot on the next real trigger. A backdated snapshot claims the system concluded something on a date it did not exist. If Codex sees a strong reason, return `BLOCKED_PRODUCT_DECISION` — this is a provenance question.
3. **Debounce window.** A member editing several profile items produces several triggers. Recommended: a short debounce so a burst yields one snapshot rather than six near-identical ones, with the window configured, not hard-coded.
