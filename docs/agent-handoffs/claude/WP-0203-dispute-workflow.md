# WP-0203 — Dispute workflow

**Status:** READY_FOR_BUILD · **Sprint:** 2 · **Owner after handoff:** Codex
**Requirement IDs:** TRUST-002, EVD-002, WRI-GOV-001, SEC-010, LANG-003
**Audit classification:** BUILD
**Binding contract:** `EVIDENCE_GRAPH_CONTRACT_v1.md` §6

---

## Product problem

Levav intends to let other people record observations about a person's work, and to interpret those observations as readiness. That is a significant power, and it is only legitimate if the person can contest what is recorded about them. WRI-GOV-001 requires a dispute route for evidence that materially affects readiness conclusions; TRUST-002 makes disputes a first-class workflow state rather than a support email.

The failure mode to design against is the one every platform falls into: a dispute that quietly deletes the disputed item, or quietly changes a score, leaving no record that anything happened. **A dispute must preserve the original, change the processing state, and be auditable from both sides.**

## User journey

A member sees a record about their work that is wrong — a review that describes work they did not do, a completion marked late when the client changed the deadline. They dispute it, saying why. The record stops counting immediately. Both parties can see its state. A resolution is recorded, the original is still there, and the readiness recalculation happens through the pipeline rather than by someone editing a number.

## In scope

1. **Dispute a node** — by the subject, or by the actor who produced it (people correct their own mistakes too).
2. **Immediate exclusion** — `active → disputed` removes the node from interpretation at once. A person should not have to wait for resolution to stop being judged on a contested record.
3. **Reason capture** — a structured category plus the disputer's own words.
4. **Resolution states** — upheld (returns to `active`), corrected (superseding node created per contract §6), withdrawn (node `withdrawn`), or escalated to `quarantined` for trust review.
5. **Both-sides visibility** — the subject and the actor can each see the dispute and its state. Neither can see the other's private data as a consequence.
6. **Recalculation via the pipeline** — every transition emits `wri.recalculation.queued`. **Nothing consumes it in Sprint 2.**
7. **Audit** of every transition: who, when, from, to, reason.
8. **Copy** from `COPY_DICTIONARY.md` — `wri.dispute.action`, `quickwork.dispute.*`, `impact.record.dispute`. New keys are in §13, added by this packet.

## Out of scope

- **Any resolution authority or moderation queue.** There is no trust team and no admin moderation surface yet — that is Sprint 10. Sprint 2 records disputes and supports transitions; **it does not decide them.** A dispute raised in Sprint 2 sits in `disputed` until a privileged path exists to resolve it, and that is the honest state.
- Reviewer trust scoring (TRUST-001). Sprint 10.
- Any WRI recalculation consumer. Sprint 3.
- Automatic resolution of any kind. No heuristic, no timeout that auto-upholds. A record that nobody has adjudicated is unadjudicated.
- Notifications beyond in-app state. Email is a later packet.

## Existing behaviour to preserve

- WP-0201's append-only guarantees. A dispute never mutates `payload`.
- WP-0202's single-writer property. Dispute transitions go through the same controlled path; they do not become a second write route into the evidence table.
- All Sprint 0/1 behaviour unchanged.

## Acceptance criteria

1. The subject of a node can dispute it. The actor who produced it can dispute it. Nobody else can — negative test with a third party.
2. `active → disputed` takes effect immediately and excludes the node from any interpretation query. Assert that the standard "evidence for subject" read used by Sprint 3 excludes it.
3. **The original payload is unchanged after a dispute.** Byte-compare before and after.
4. Each resolution path behaves per contract §6: upheld returns to `active`; corrected creates a superseding node with the original left `superseded`; withdrawn sets `withdrawn`; escalated sets `quarantined`. All four demonstrated.
5. A dispute cannot be raised on a node already `disputed`, `withdrawn` or `superseded`. Rejected with a clear message.
6. Every transition writes an audit record with actor, timestamp, from-state, to-state and reason.
7. `wri.recalculation.queued` is emitted on every transition, and nothing consumes it.
8. Both parties can read the dispute state; neither gains access to anything else about the other.
9. All copy comes from the dictionary. No invented strings.
10. Dispute flow works at 360 px; loading, empty, error and permission states exist.
11. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

A dispute record: node id, raised-by, raised-at, category, the disputer's statement, current state, resolution, resolved-by, resolved-at, and resolution note. One open dispute per node; a second attempt while one is open is rejected rather than queued.

The disputer's statement is their own words and is never edited by the system, only stored.

## Privacy requirements

- A dispute exposes the disputing party's statement to the other party. **Tell the disputer that before they submit** — copy key `dispute.visibility.notice` in §13. Someone writing a complaint must know who will read it.
- Neither party gains access to the other's profile, evidence or contact details through a dispute.
- Dispute records fall under SEC-010 correction and export rights.
- Do not include the disputer's statement in any analytics payload.

## Security considerations

- Authorisation is server-side: only subject or actor, verified against the node, never from the request body.
- The resolution endpoints require privilege that does not exist yet — implement them as server-side functions with an explicit authorisation check that currently only an admin path satisfies, rather than leaving them unprotected for a future caller.
- Rate-limit dispute creation (SEC-008). A dispute is cheap to file and expensive to review.
- Never expose the actor's identity to the subject beyond what the evidence already showed — a dispute must not become an identity-disclosure channel.

## Analytics and event requirements

`evidence.disputed`, `evidence.dispute.resolved` with the resolution type, `evidence.quarantined`. Category but never free text. Dispute rate is a Sprint 10 trust metric and a product-health signal — if disputes cluster on one evidence type, that instrument is broken.

## UI states

| State | Requirement |
|---|---|
| Dispute entry point | On any node the viewer is entitled to dispute; `wri.dispute.action` |
| Dispute form | Category, own words, and the visibility notice before submission |
| Submitted | Confirms the record stopped counting immediately |
| Under review | Honest: no adjudication path exists yet. Say what happens next and do not imply a timeline |
| Resolved | Shows the resolution and that the original is retained |
| Not disputable | Explains why (already disputed, withdrawn, superseded) |
| Loading / error / permission / 360 px | All present |

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Subject disputes their own node | Accepted; node `disputed` |
| 2 | Actor disputes a node they produced | Accepted |
| 3 | Unrelated user disputes | Rejected |
| 4 | Payload compared before and after dispute | Identical |
| 5 | Interpretation read after dispute | Node excluded |
| 6 | Each of the four resolutions | Behaves per contract §6 |
| 7 | Dispute an already-disputed node | Rejected clearly |
| 8 | Every transition | Audit record written |
| 9 | Both parties read state | Both succeed; no extra data leaks |
| 10 | Resolution endpoint called without privilege | Rejected |
| 11 | Rapid repeated dispute attempts | Rate-limited |
| 12 | Flow at 360 px | Usable |

## Dependencies

**WP-0201** and **WP-0202** must be ACCEPTED. Blocks WP-0204.

## Open product decisions

1. **Dispute categories.** Proposed: *did not happen*, *inaccurate detail*, *unfair characterisation*, *wrong person*, *other*. These map to different resolution paths later and are worth getting roughly right now — the set can grow, but renaming is expensive once people have filed under them.
2. **Whether the actor is notified in-app when the subject disputes.** Recommended yes, in Sprint 2, in-app only. A dispute the other party never learns about cannot be corrected by the person best placed to correct it.
