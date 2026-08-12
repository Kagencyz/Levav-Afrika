# WP-0204 — Privacy and Evidence Centre

**Status:** READY_FOR_BUILD · **Sprint:** 2 · **Owner after handoff:** Codex
**Requirement IDs:** PRIV-001, AUTH-003, SEC-010, EVD-001, LANG-003, AFR-001, AFR-010
**Audit classification:** BUILD
**Binding contract:** `EVIDENCE_GRAPH_CONTRACT_v1.md` §10

---

## Product problem

Levav asks people to let a system record observations about their work and interpret those observations as readiness that employers will see. The only thing that makes that reasonable is that the person can see exactly what is held, where it came from, what it can affect, and who can see it — without asking anyone.

PRIV-001 requires this surface. The Evidence Graph contract makes it a design constraint on the schema rather than a screen bolted on later: if these questions cannot be answered with ordinary queries, the schema is wrong.

This is also the packet that makes the Evidence Graph *legible* to its own subject. Everything before it is infrastructure the member cannot see.

## User journey

A member opens their Privacy and Evidence Centre. They see everything Levav holds about them, grouped so it makes sense: what they declared themselves, what others recorded, when, by whom. Each item states whether it can affect readiness and who can see it. They can change visibility, dispute anything, and export the lot. Nothing is hidden from them, and nothing is presented as more certain than it is.

## In scope

1. **A complete inventory** of the member's evidence — every node where they are the subject, at any status, including `withdrawn` and `superseded`. Nothing is concealed from the person it describes.
2. **Answer the six PRIV-001 questions** (contract §10): what is held · what is self-declared versus verified, and by whom · what can affect readiness · who can see each item · dispute route · consent and revocation where applicable.
3. **Provenance display** — source, actor and relationship, when the work happened versus when it was recorded, and the instrument where one was used. **Rubric contents and internal weights are never shown** (SEC-011); the instrument is named, not opened.
4. **Readiness eligibility, stated plainly per item.** An item with `eligible_dimensions: []` says so — this is the surface where the difference between *recorded* and *counts toward readiness* becomes visible to a real person, and it must be unmistakable.
5. **Visibility control per item**, server-enforced, reusing WP-0103's model.
6. **Dispute entry point** into WP-0203.
7. **Export** — machine-readable, complete, covering all statuses (SEC-010).
8. **Superseded and withdrawn history** shown as history, not hidden.

## Out of scope

- **Protected-WRI access history.** PRIV-001 lists it; it requires the audit store, which does not exist (PDR-0009 removed the fake one). Show an honest unavailable state using the PDR-0009 pattern — state that access logging is not yet in place, never "no access recorded", which would falsely assure. Copy in §13.
- Any WRI score, dimension estimate or confidence value. Sprint 3.
- Deletion of evidence. Nothing here deletes; correction is dispute, and lawful erasure is a separate privileged path.
- Consent management for sponsored development and employer verification — those consents do not exist yet.
- Employer-facing views of any kind.

## Existing behaviour to preserve

- WP-0201 append-only guarantees, WP-0202 single-writer, WP-0203 dispute semantics.
- WP-0103's profile visibility model — reuse it; do not create a second, competing visibility concept for evidence.
- All Sprint 0/1 behaviour unchanged.

## Acceptance criteria

1. Every node where the member is the subject appears, including `withdrawn`, `superseded`, `disputed` and `quarantined`. Nothing about them is hidden from them.
2. Each item shows: source, actor and relationship where applicable, `occurred_at` and `recorded_at` distinctly, evidence level, and instrument name where one was used.
3. Each item states whether it can affect readiness. An item with no eligible dimensions says so in plain language, not by omission.
4. Self-declared and verified are **structurally** distinguishable, not by colour alone (AFR-010). In Sprint 2 everything is self-declared, so the surface must not display a verified treatment that nothing yet satisfies.
5. Visibility is changeable per item and enforced server-side. Verified with a direct API call from another account.
6. Dispute entry point works and lands in WP-0203's flow.
7. Export produces a complete machine-readable file covering all statuses, and is generated server-side with authorisation. It must not become an enumeration endpoint — negative test for exporting another member's evidence.
8. Protected-WRI access history shows the honest unavailable state, never an empty list.
9. No rubric content, anchor text, weight or internal scoring detail appears anywhere (SEC-011).
10. Usable at 360 px, and with images and non-essential assets unloaded (AFR-002).
11. All copy from the dictionary. Loading, empty, error and permission states exist.
12. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Read-only over WP-0201's tables plus WP-0203's disputes. **No new evidence storage.** If a query needed here is awkward, that is a signal the WP-0201 schema is wrong and should be raised as a defect against WP-0201 rather than solved with a denormalised copy — a second store of evidence is exactly how two systems come to disagree about the same fact.

Export is generated on demand. If it needs to be asynchronous for large accounts, deliver it through an authenticated, expiring, single-use path — never a public URL.

## Privacy requirements

- The member sees everything about themselves regardless of visibility. Visibility governs others.
- Export is authenticated, rate-limited, audited, and scoped to the requester.
- No cross-subject leakage: an actor's identity appears only where the evidence already disclosed it.
- The export file contains personal data — the interface must say so plainly before download.

## Security considerations

- Every read is scoped to `subject_user_id = caller`. Negative test for cross-user read on every endpoint this packet adds.
- Export is the highest-risk endpoint here: authenticate, authorise, rate-limit, audit, and never accept a subject id from the client.
- No endpoint may return `instrument_version` contents, only its identifier and name.
- Ensure this surface cannot be used to enumerate actors or their organisations.

## Analytics and event requirements

`privacy.centre.viewed`, `privacy.visibility.changed` (item type and new level, never values), `privacy.export.requested`. Visibility changes and exports are privacy-relevant actions and belong in the audit trail as well — recorded via structured logs until the audit store exists, with the migration requirement noted in `docs/implementation/`.

## UI states

| State | Requirement |
|---|---|
| No evidence yet | Honest empty state explaining that evidence appears as they do work; no score, no placeholder |
| Evidence present | Grouped comprehensibly — by source or by time, Codex's call, but not one undifferentiated list |
| Item detail | Full provenance, eligibility statement, visibility control, dispute entry |
| Withdrawn / superseded | Shown as history with its state clear |
| Disputed | Clearly marked as not counting |
| Access history | Unavailable state per PDR-0009 |
| Export | Requested, ready, failed; plain statement that the file contains personal data |
| Loading / error / permission / offline / 360 px | All present |

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Member with no evidence | Honest empty state; no zero, no placeholder |
| 2 | Member with E0 nodes from WP-0202 | All listed with provenance |
| 3 | Item with `eligible_dimensions: []` | States plainly that it does not affect readiness |
| 4 | Withdrawn and superseded nodes | Visible as history |
| 5 | Change item visibility, read as another user via direct API | Enforced |
| 6 | Dispute from this surface | Lands in WP-0203 |
| 7 | Export | Complete, all statuses, authenticated |
| 8 | Export another member's evidence via direct API | Rejected |
| 9 | Any endpoint queried cross-user | Rejected |
| 10 | Search the rendered surface for rubric or weight detail | None present |
| 11 | Access-history section | Unavailable state, never "no access recorded" |
| 12 | 360 px, images blocked | Fully usable |

## Dependencies

**WP-0201, WP-0202 and WP-0203** must be ACCEPTED. This is the last packet in Sprint 2 and the one that demonstrates the sprint's exit gate to a real person.

## Open product decisions

1. **Grouping.** Proposed: by source system, with a time view as a secondary. A person thinks "what did that client say" before "what happened in March".
2. **Export format.** JSON recommended for completeness and machine readability. A human-readable form is worth adding later, but the SEC-010 obligation is portability, and a PDF is not portable data.
