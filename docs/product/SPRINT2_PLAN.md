# Sprint 2 — Evidence Graph Foundation

**Owner:** Claude (Product Command). **Requirements:** EVD-001 … EVD-004, DATA-MODEL-001 … 003, EVENT-001, EVENT-002, PRIV-001, TRUST-002, AUTH-003, SEC-004, SEC-009, SEC-010
**Binding contract:** `specs/product-contracts/EVIDENCE_GRAPH_CONTRACT_v1.md`. Read it before any packet here. Where a packet and the contract differ, the contract wins and the packet is a defect.

---

## Exit gate (Master PRD §46)

> A verified event can create an auditable evidence node, and a dispute can change its processing state without deleting history.

## Packet sequence

| ID | Title | Depends on |
|---|---|---|
| **WP-0201** | Evidence node storage, lifecycle and visibility | — |
| **WP-0202** | Event pipeline and the sole ingestion writer | WP-0201, **WP-0103** |
| **WP-0203** | Dispute workflow | WP-0201, WP-0202 |
| **WP-0204** | Privacy and Evidence Centre | WP-0201, WP-0203 |

All four are issued. They are strictly sequential — each builds on the last, and none of them is parallelisable against another without touching the same tables.

## Two coordination rules, so this sprint does not collide with Sprint 1

### 1. Sprint 1 and Sprint 2 must not run concurrently on the migration chain

§43 prohibits two branches modifying the same database migration chain without coordination. WP-0101, WP-0103 and WP-0201 all add tables. **Finish and merge the Sprint 1 migrations before starting WP-0201.** If capacity ever allows parallel work, WP-0104 (email change) is the only Sprint 1 packet that is safe to run alongside Sprint 2 — it touches no shared table.

Recommended order end to end:

```
WP-0002 → WP-0004 → WP-0101 → WP-0102 → WP-0103 → WP-0201 → WP-0202 → WP-0203 → WP-0204
                                          └── WP-0104 may run anywhere in parallel
```

### 2. The profile-claims boundary — read this before WP-0202

There is an apparent contradiction between two documents I issued, and it is deliberate. Resolving it wrongly would corrupt the graph, so it is stated here explicitly.

- **WP-0103 says** nothing in Sprint 1 creates an evidence record, and that deleting a profile item is a real deletion.
- **The Evidence Graph contract says** E0 self-declared evidence includes "profile statements".

Both are correct, in sequence:

| Phase | Profile item | Deletion |
|---|---|---|
| After Sprint 1 | A row in the profile tables. Not evidence. No provenance. | Real deletion is legitimate |
| After WP-0202 | Still a profile row, and **additionally** the source of an E0 evidence node emitted through the pipeline | The profile row may be removed; **the evidence node is withdrawn, not deleted** (EVD-002) |

So WP-0202 does not turn profile rows into evidence rows. It makes profile changes *emit events*, and the ingestion consumer creates E0 nodes from those events. The profile stays the user's editable surface; the graph keeps the immutable record of what was claimed and when.

**The consequence Codex must implement carefully:** once WP-0202 ships, deleting a profile item stops being a hard delete of everything. The row can go; the evidence node transitions to `withdrawn` and stays. This is not a regression against WP-0103 — it is the boundary WP-0103's privacy section explicitly told Codex to expect.

## What Sprint 2 does not build

- **Any WRI computation, score, confidence or dimension estimate.** That is Sprint 3 and it needs `WRI_SCIENTIFIC_SPEC_v1.md`. Sprint 2 may emit `wri.recalculation.queued` and have nothing consume it — an unconsumed queue is the correct state at the end of this sprint.
- Verification of E0 claims. Nothing in Sprint 2 verifies anything; it records provenance for claims that remain self-declared.
- E1–E4 producers. Levav 28, QuickWork, Impact, Learn and hire outcomes are Sprints 4–8. WP-0202 wires **one** producer end to end to prove the pipeline.
- Reviewer trust (TRUST-001) and the fraud queue. Sprint 10.
- The server-side audit store. It does not exist — PDR-0009 removed the fake one. Sprint 2 writes structured logs with correlation ids and records the migration requirement, exactly as WP-0104 does. **Do not build an audit table as a side effect of an evidence packet.**

## Standing constraints on every packet in this sprint

1. No client may write an evidence node. The ingestion consumer is the only writer (contract §8).
2. No subject, client or request body may set `level`, `eligible_dimensions` or `actor_relationship`.
3. Nothing is hard-deleted through a product flow. Lawful erasure is a separate privileged path (SEC-010).
4. Visibility is enforced server-side and expressed in the data model (DATA-MODEL-003).
5. Confidence is never stored on a node (contract §3.1).
6. Every status transition is audited and every node traces to the event that created it (EVENT-002).
