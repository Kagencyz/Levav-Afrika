# WP-0202 — Event pipeline and the sole ingestion writer

**Status:** READY_FOR_BUILD · **Sprint:** 2 · **Owner after handoff:** Codex
**Requirement IDs:** EVENT-001, EVENT-002, DATA-MODEL-002, EVD-001, EVD-002, API-006
**Audit classification:** BUILD
**Binding contract:** `specs/product-contracts/EVIDENCE_GRAPH_CONTRACT_v1.md` §8

---

## Product problem

The reason a readiness score once rose when a user posted to a feed is that a UI action could reach a score directly. Prohibiting that in a document is not a control. The control is architectural: **producing subsystems emit domain events, and exactly one consumer writes evidence.**

This packet builds that consumer and proves it end to end with one real producer. Everything Sprints 4–8 add is then a matter of emitting an event, not of gaining write access.

## User journey

A member adds a role to their profile. That claim is now recorded in the Evidence Graph as E0 self-declared, with provenance and a timestamp — visible to them in the Privacy and Evidence Centre later, and available to Sprint 3 as the weakest tier of input. They see no score, because none exists yet.

## The first producer: profile claims

**Read `SPRINT2_PLAN.md` §2 before starting.** The boundary is easy to get wrong.

This packet does **not** turn profile rows into evidence rows. Profile items stay the member's editable surface. Profile changes *emit events*; the ingestion consumer creates E0 nodes from those events. Two records, two purposes: the profile is what you currently claim, the graph is what you claimed and when.

Producers to wire (all from WP-0103's tables):

| Event | Produces |
|---|---|
| `profile.experience.declared` | E0 observation, `eligible_dimensions: []` |
| `profile.education.declared` | E0 observation, `eligible_dimensions: []` |
| `profile.project.declared` | E0 observation, `eligible_dimensions: []` |
| `profile.certification.declared` | E0 observation, `eligible_dimensions: []` |
| `profile.item.removed` | Transitions the corresponding node to `withdrawn` |
| `profile.item.amended` | Creates a superseding node per contract §6 |

**`eligible_dimensions` is empty for every one of these, deliberately.** A self-declared claim is a record of what someone said, not an observation of behaviour. It belongs in the graph — the member should see it, and Sprint 3 needs to know a claim exists — but it may not inform any dimension. This is the clearest possible demonstration that being in the graph and affecting readiness are different things.

## In scope

1. **A single ingestion consumer** — the only code path that inserts into the evidence table.
2. **Idempotency** — every producer supplies an `idempotency_key` derived from source record plus transition. Replay creates nothing new (EVENT-001, API-006).
3. **Payload validation per `evidence_type`** at ingestion. An event with a malformed payload is rejected and parked, never partially written.
4. **Traceability** — every node records the event that created it (EVENT-002).
5. **Failure isolation** — a consumer failure never half-writes. Failed events are retried with backoff, then parked in a dead-letter store with enough context to replay.
6. **`wri.recalculation.queued` emitted** on every node create or status change. **Nothing consumes it in Sprint 2.** An unconsumed queue is the correct end state.
7. **The six profile producers above**, wired end to end.
8. Event transport chosen within the existing stack — see open decision 1.

## Out of scope

- **Any WRI consumer.** Sprint 3. Do not build a stub that computes anything.
- Producers for Levav 28, QuickWork, Impact, Learn or hire outcomes — Sprints 4–8.
- Disputes (WP-0203), Privacy Centre (WP-0204).
- Verification. Nothing here verifies a claim; E0 stays E0.
- Retrospective backfill of profile items that existed before this packet — see open decision 2.

## Existing behaviour to preserve

- **WP-0103's profile behaviour must not change from the member's point of view.** Adding, editing and removing profile items behaves exactly as before; the event emission is additional.
- One exception, and it must be implemented deliberately: removing a profile item no longer removes everything. The profile row goes; the evidence node becomes `withdrawn`. `SPRINT2_PLAN.md` §2 explains why this is not a regression.
- Auth, identity and all Sprint 0/1 behaviour unchanged.

## Acceptance criteria

1. **The ingestion consumer is the only insert path.** Demonstrate by grep and by an architectural test asserting no other module imports the evidence insert.
2. Replaying the same event twice creates exactly one node. Demonstrate with the same `idempotency_key` submitted twice.
3. Every created node names its originating event; the chain event → node is queryable.
4. A malformed payload is rejected and parked. No partial node exists afterwards.
5. All six profile producers work end to end. Adding an experience entry creates exactly one E0 node with `eligible_dimensions: []`.
6. **No profile-derived node ever declares a dimension.** Assert across all six producers.
7. Removing a profile item transitions its node to `withdrawn`; the node and payload remain readable by the subject.
8. Amending a profile item creates a superseding node; the original stays `superseded` and readable.
9. `wri.recalculation.queued` is emitted and nothing consumes it. Confirm no code path computes a score.
10. A consumer crash mid-batch leaves no partial writes. Demonstrate with an induced failure.
11. Server-side only. No client can emit a producer event directly — negative test with a forged request.
12. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

An event log or outbox with: event id, type, payload, producer, `idempotency_key`, created-at, processed-at, attempt count, and last error. This is operational data, not evidence — keep it in its own table with its own retention, and do not let it become a second source of truth.

The dead-letter store must retain enough to replay after a fix.

## Privacy requirements

- Event payloads carry personal data and are subject to the same protections as the evidence they produce.
- Do not log full payloads at info level. Log the event id and type; the payload stays in the store.
- The dead-letter store needs a retention rule — parked events containing personal data must not accumulate indefinitely. Propose one and record it.

## Security considerations

- Producer events originate **server-side only**. There is no endpoint that accepts an evidence-producing event from a client, and adding one later requires a product decision.
- The consumer does not trust event contents for `subject_user_id` — derive it from the source record, not the payload.
- `level` and `eligible_dimensions` are set by the consumer from the `evidence_type` mapping, never from the event body.
- Rate-limit any path that can cause event emission at volume (SEC-008).

## Analytics and event requirements

Operational metrics from the start, because this pipeline is invisible when it works and dangerous when it silently stops: ingestion lag, failure rate, dead-letter depth, replay count. OBS-002 requires these; a queue nobody watches is how evidence quietly stops being recorded.

## UI states

None directly. One member-visible consequence to handle: removing a profile item must not appear to fail or behave oddly because a node is being withdrawn behind it. The removal is confirmed to the member as it was before.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Add an experience entry | One E0 node, `eligible_dimensions: []`, traceable to its event |
| 2 | Same event replayed | Still one node |
| 3 | Add all four claim types | Four nodes, none with a dimension |
| 4 | Remove a profile item | Node `withdrawn`, payload still readable by subject |
| 5 | Amend a profile item | Superseding node; original `superseded` and readable |
| 6 | Malformed payload | Rejected, parked, no node |
| 7 | Induced consumer crash mid-batch | No partial writes; events retried |
| 8 | Forged client request emitting a producer event | Rejected |
| 9 | Event body claiming a different `subject_user_id` | Ignored; subject derived from the source record |
| 10 | Event body supplying `eligible_dimensions` | Ignored; consumer sets it |
| 11 | Any code path computing a WRI value | None exists |
| 12 | 100 rapid profile edits | Each idempotent; queue drains; no duplicates |

## Dependencies

**WP-0201** (storage) and **WP-0103** (profile tables, which supply the producer). Both must be ACCEPTED. Blocks WP-0203 and WP-0204.

## Open product decisions

1. **Event transport** — database-backed outbox, a queue, or Postgres `LISTEN/NOTIFY`. Codex's call within the existing stack, provided it satisfies contract §8's five properties. An outbox in the same Postgres transaction as the source write is the recommendation: it gives atomicity between the domain change and the event with no new infrastructure, which matters for a product that must run cheaply.
2. **Backfill of pre-existing profile items.** Recommended: **do not backfill.** A node's `recorded_at` would be a lie about when the claim was made, and E0 claims inform nothing. Emit events only for changes from this packet forward, and note the discontinuity in `docs/implementation/`. If Codex sees a strong reason to backfill, return `BLOCKED_PRODUCT_DECISION` — this is a provenance question, not an implementation preference.
