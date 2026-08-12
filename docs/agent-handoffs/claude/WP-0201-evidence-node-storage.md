# WP-0201 — Evidence node storage, lifecycle and visibility

**Status:** READY_FOR_BUILD · **Sprint:** 2 · **Owner after handoff:** Codex
**Requirement IDs:** EVD-001, EVD-002, EVD-003, EVD-004, DATA-MODEL-001, DATA-MODEL-003, AUTH-003, SEC-004
**Audit classification:** BUILD
**Binding contract:** `specs/product-contracts/EVIDENCE_GRAPH_CONTRACT_v1.md` §3, §4, §6, §7

---

## Product problem

Levav has no factual layer. Every readiness claim the product will make must trace to a record with provenance, context, time and verification state, and none of that exists. Until it does, WRI cannot be built — §43 forbids it, and the defect this codebase already shipped is what happens when a number has no evidence beneath it.

This packet builds the storage and the rules. It deliberately builds **no writer** — that is WP-0202 — because the single-writer property is the structural guarantee and it should be introduced as one thing, not retrofitted onto a table that already has three write paths.

## User journey

Indirect. A person will eventually see, in one place, everything Levav holds about them, what is self-declared, what is verified, who verified it, and what can affect their readiness. This packet is the shape that makes that answerable.

## In scope

1. **Evidence node table** with every field in contract §3, including `kind` (`observation` | `evaluation`), `eligible_dimensions`, `work_context`, `instrument_version`, `supersedes_id` and `idempotency_key`.
2. **The observation/evaluation distinction expressed in the schema** (EVD-004, contract §4), with a constraint that an `evaluation` cannot exist without `instrument_version` and an actor.
3. **Status lifecycle** per contract §6, enforced at the database level where practical: `pending`, `active`, `disputed`, `quarantined`, `withdrawn`, `superseded`. Illegal transitions are rejected, not merely avoided in application code.
4. **Append-only semantics.** No update path may alter `payload`, `level`, `kind`, `subject_user_id`, `actor_user_id`, `eligible_dimensions` or `evidence_type`. Only `status` and `visibility` transition.
5. **Amendment by supersession** — a new row with `supersedes_id`; the original moves to `superseded` and stays readable.
6. **Visibility** (`private` | `members` | `public`) enforced server-side, expressed in the model.
7. **Evidence type vocabulary** as versioned reference data, not a hard-coded enum in `src/`.
8. **Read API** for the subject's own evidence, and a server-side internal read for future consumers. No public read in this packet.
9. **No DELETE grant anywhere**, matching the existing `levav_app` pattern in `db/schema.ts`.

## Out of scope

- **Any write path.** WP-0202 builds the ingestion consumer. This packet ships the table with no product-reachable insert. A test-only seeding helper is acceptable and must be clearly marked as such.
- Disputes (WP-0203) and the Privacy Centre (WP-0204) — the statuses exist here; the workflows do not.
- Any WRI computation, score or confidence. Confidence is never stored on a node (contract §3.1).
- Verification of anything.
- The audit store — write structured logs with correlation ids, and record the migration requirement in `docs/implementation/`.

## Existing behaviour to preserve

- All Sprint 0 and Sprint 1 behaviour, unchanged. This packet adds tables and touches no existing one.
- Auth, identity, RLS foundations and the registered router set unchanged.
- Test count may only rise.

## Acceptance criteria

1. Tables exist via a reversible migration, RLS enabled, following the existing `levav_app` grant pattern, **no DELETE grant**.
2. Every field in contract §3 is present with the stated semantics. `occurred_at` and `recorded_at` are distinct columns.
3. An `evaluation` row without `instrument_version` or without an actor is **rejected by a database constraint**, not only by application validation.
4. An attempt to `UPDATE` `payload`, `level`, `kind`, `subject_user_id`, `eligible_dimensions` or `evidence_type` on an existing row fails. Demonstrate with a direct SQL attempt, not just a service-layer test.
5. Illegal status transitions are rejected. Demonstrate at least: `withdrawn → active`, `superseded → active`.
6. Amendment creates a new row; the original becomes `superseded` and remains readable with its payload intact.
7. `work_context` is denormalised at write time — a later profile edit does not retroactively change an existing node's context. Test by writing a node, changing the profile, and re-reading the node.
8. Visibility is enforced server-side. A direct API call for another user's `private` node returns nothing, regardless of UI.
9. `eligible_dimensions` values validate against the ten canonical dimensions from `WRI_SCIENTIFIC_SPEC_v1.md` §2. An unknown dimension is rejected.
10. Evidence type vocabulary is reference data with a version, not a `src/` constant.
11. No product-reachable insert path exists. `grep` the router surface and confirm.
12. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Reversible migration. `payload` is `jsonb`, shaped by `evidence_type` — validate its shape per type at ingestion (WP-0202), not with a database constraint that would need a migration every time a type is added.

`eligible_dimensions` as an array of canonical dimension keys. Index for the queries Sprint 3 will run: by subject, by subject + status, by subject + dimension.

`idempotency_key` is unique across the table. This is the property that makes replay safe, so it is a database constraint, not an application check.

## Privacy requirements

- AUTH-003: evidence is person-owned. No organisation gains a read path by employing someone. Nothing in this packet creates one.
- Visibility is independent of existence (contract §7). A `private` node remains fully visible to its subject.
- The subject's own read returns everything about them regardless of visibility — visibility governs *others*, never the person themselves.
- SEC-009: this table is durable evidence. Raw assessment telemetry belongs elsewhere on a shorter clock; do not add telemetry columns here.

## Security considerations

- Reads are scoped to the calling user's own subject rows. Negative test for cross-user read.
- `eligible_dimensions` must be unwritable by any request body — there is no endpoint in this packet that accepts it, and there must not be one added casually later.
- Rejecting illegal transitions belongs in the database, because application code is the layer most likely to be bypassed by a future feature.
- No endpoint exposes `instrument_version` or rubric identifiers to a non-privileged caller (SEC-011).

## Analytics and event requirements

None in this packet — the pipeline is WP-0202. Do not emit placeholder events.

## UI states

None. This packet has no user interface. Any UI is a defect.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Insert an `observation` with no actor | Accepted — system-recorded facts have no actor |
| 2 | Insert an `evaluation` with no `instrument_version` | Rejected by constraint |
| 3 | Direct SQL `UPDATE` of `payload` on an active row | Rejected |
| 4 | Amend a node | New row created, original `superseded` and readable |
| 5 | `withdrawn → active` transition | Rejected |
| 6 | Write node, edit profile, re-read node | `work_context` unchanged |
| 7 | Cross-user read of a `private` node via direct API | Returns nothing |
| 8 | Subject reads own `private` node | Returns it |
| 9 | Insert with an unknown dimension key | Rejected |
| 10 | Duplicate `idempotency_key` | Rejected by unique constraint |
| 11 | Migration down | Clean revert; no other table affected |

## Dependencies

Sprint 1 migrations must be merged first — §43, and see `SPRINT2_PLAN.md`. Blocks WP-0202, WP-0203, WP-0204.

## Open product decisions

1. **`evidence_type` as reference table vs enum.** Reference table recommended; the vocabulary grows every sprint and an enum means a migration each time.
2. **Whether `work_context` is a `jsonb` snapshot or discrete columns.** `jsonb` recommended — it is a point-in-time record, never queried relationally, and its shape will change as the taxonomy grows.

Implement the recommendations and note them.
