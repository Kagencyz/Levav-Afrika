# Evidence Graph — Product Contract v1

**Owner:** Claude (Product Command). Codex implements against this; Codex does not edit it.
**Requirements:** EVD-001 … EVD-004, DATA-MODEL-001 … 003, EVENT-001, EVENT-002, AUTH-003, PRIV-001, TRUST-002, SEC-004, SEC-009, WRI-003
**Status:** APPROVED for Sprint 2 implementation. Amendments require a Product Decision Record.

---

## 1. What this is, and why it comes first

The Evidence Graph is the factual backbone of Levav. Every readiness claim the product makes must trace to a record with provenance, context, time and verification state. WRI is an *interpretation* of this graph; it holds no facts of its own.

This contract exists before Sprint 2 because §43 forbids building WRI before the evidence contract is stable, and because the failure already removed from this codebase — a score that moved when you posted to a feed — was possible precisely because there was no evidence layer between an action and a number. **The graph is the thing that makes that class of defect structurally impossible rather than merely prohibited.**

One rule governs everything below:

> An action is not evidence. An observation of work is.

## 2. Evidence levels

Five levels, from the Master PRD §11.1. The level is a property of **how the record was produced**, not of how good it is. A weak E3 is still E3.

| Level | Name | Produced by | Examples |
|---|---|---|---|
| **E0** | Self-declared | The subject | CV claims, profile statements, declared skills, unverified projects, a nominated written work sample (PDR-0010, if approved) |
| **E1** | Learning | An instrument inside Levav Learn | Assessment results where measurement quality is sufficient, module outputs |
| **E2** | Controlled simulation | Levav 28 | Scenario attempts under known conditions against a published rubric |
| **E3** | Verified real-world work | A counterparty who observed the work | QuickWork completion and closeout review, verified employment output, verified Impact contribution, supervisor review |
| **E4** | Longitudinal outcome | An employer confirming what happened after | Probation outcome, retention, rehire, time-to-productivity, promotion |

**Level is assigned by the producing system, never by the subject, and never by a client.** A client that submits a level is rejected.

### 2.1 What is explicitly not evidence

This list is normative. None of these may create an evidence node:

- Publishing a post, liking, following, saving, sharing, or any social action (FEED-008).
- Applying to anything — a QuickWork listing, a job, an Impact opportunity.
- Enrolling in a course, opening a lesson, or marking a day complete.
- Participating in Levav Impact (IMPACT-002). The *verified outputs* of a contribution are E3; the participation is not.
- Completing a Learn course, on its own (LEARN-002). Only an assessment with sufficient measurement quality produces E1.
- Profile completeness, login streaks, session duration, or any engagement metric.

If a future feature seems to need one of these to count, that is a `BLOCKED_PRODUCT_DECISION`, not an implementation detail.

## 3. The evidence node

Required fields (EVD-001). Names are indicative; the semantics are binding.

| Field | Meaning | Notes |
|---|---|---|
| `id` | Stable identifier | Never reused |
| `subject_user_id` | The person the evidence is about | Always a person, never an organisation |
| `level` | E0 … E4 | Set by the producing system |
| `kind` | `observation` or `evaluation` | See §4 |
| `evidence_type` | What produced it, from a versioned vocabulary | e.g. `quickwork.closeout_review`, `levav28.scenario_attempt` |
| `source_system` | The subsystem that emitted it | |
| `source_ref` | The originating record | Assignment id, attempt id, placement id |
| `actor_user_id` | Who produced the observation or judgement | Null for system-recorded facts |
| `actor_relationship` | The actor's relationship to the subject | `client`, `supervisor`, `employer`, `peer`, `system`, `self` |
| `occurred_at` | When the observed work happened | Distinct from `recorded_at` |
| `recorded_at` | When Levav recorded it | |
| `work_context` | Role, industry, seniority, engagement type at the time | Denormalised deliberately — context must not change retroactively when a profile is edited |
| `eligible_dimensions` | Which WRI dimensions this record may inform | See §5 |
| `payload` | The observation or evaluation itself | Shape determined by `evidence_type` |
| `instrument_version` | Rubric, scenario or model version | Required when `kind = evaluation` |
| `visibility` | `private`, `members`, `public` | See §7 |
| `status` | Lifecycle state | See §6 |
| `supersedes_id` | Prior version, if amended | See §6 |
| `idempotency_key` | Producer-supplied uniqueness key | See §8 |

### 3.1 What the node does not contain

- **No score, weight or confidence value.** Confidence is computed by the WRI engine across a set of evidence (WRI-003). Storing a confidence figure on a node would let two systems disagree about the same fact.
- **No aggregate.** Nothing counts or rolls up inside the graph.
- **No free-text conclusion about the person's capability.** Evaluations reference a rubric and record anchored ratings; they do not record prose verdicts as though they were data.

## 4. Observations and evaluations are different things

EVD-004 requires this separation, and it is the second structural defence against the failure we removed.

**Observation** (`kind = observation`) — a fact that can be checked. Submitted at 14:02. Deadline was 14:00. Twelve hours verified. Assignment completed. Rework requested once. Repeat engagement: third time with this client.

Observations have no rater, need no rubric, and are not opinions. They are the strongest evidence Levav holds precisely because they are boring.

**Evaluation** (`kind = evaluation`) — a judgement made by a person or an instrument against a **published, versioned rubric** with behavioural anchors (WRI-005). A client rating communication. An AI evaluating a Levav 28 response.

Evaluations must carry `actor_user_id` (or the model identity), `actor_relationship`, and `instrument_version` — the per-dimension version key from `specs/rubrics/BARS_v1.md` §1, e.g. `bars.d5.v1`. An evaluation without a rubric version is invalid and must be rejected at write time, not cleaned up later.

**A rater declining to rate produces nothing.** Where a rater returns `not_exercised` for a dimension (`BARS_v1.md` §3), no evidence is created for that dimension. It is not a node with a low value, and it is not a node declaring that dimension with an empty payload. Absent opportunity and absent behaviour are different facts, and the graph must not collapse them.

The WRI engine weights these differently. That is Sprint 3's business, but the graph must make the distinction available, and a schema that blurs them cannot be unblurred afterwards.

## 5. Eligible dimensions

Every node declares which of the ten WRI dimensions it *may* inform. This is a **declaration of relevance, not of score**.

Rules:

1. The producing system declares eligibility at creation, from the fixed vocabulary in `COPY_DICTIONARY.md` §3.
2. A node may declare zero dimensions. That is normal and useful — the record still exists, is still visible to the person, and still contributes to their history without touching readiness.
3. **A subject can never set or change their own node's eligible dimensions.** Nor can a client, an employer, or any request body.
4. Eligibility is a ceiling, not a floor. The WRI engine may use fewer dimensions than declared; it may never use more.
5. Declaring a dimension does not mean the evidence supports it positively. Evidence may lower a dimension estimate.

This field is where the "posting raises your score" defect would have to reappear, and it is why it cannot: a post produces no node, and any node it did produce would declare no eligible dimensions.

## 6. Immutability, amendment and disputes

EVD-002: evidence cannot be silently overwritten.

**Records are append-only.** No update path rewrites a node's payload, level, actor or dimensions. Only `status` and `visibility` may transition on an existing row.

**Amendment** creates a *new* node with `supersedes_id` pointing at the original. The original moves to `superseded` and remains readable forever. Both are visible in the person's history and in any audit.

**Status lifecycle:**

```
pending ──▶ active ──▶ superseded
              │
              ├──▶ disputed ──▶ quarantined ──▶ active | withdrawn | superseded
              │
              └──▶ withdrawn
```

- `pending` — recorded, awaiting a required verification step.
- `active` — counts toward interpretation.
- `disputed` — the subject or the actor has contested it. **Still recorded, still visible, no longer counted** until resolved (TRUST-002).
- `quarantined` — under trust review; excluded from interpretation.
- `withdrawn` — the producing party retracted it. Not deleted.
- `superseded` — replaced by an amendment.

**Nothing is ever hard-deleted through a product flow.** Lawful erasure (SEC-010) is a separate, privileged, audited path — and it removes the record rather than editing it into a different fact.

Every transition writes an audit entry: who, when, from, to, why.

**A dispute never deletes the original and never silently changes a score.** It changes the node's status, and the WRI recalculation happens through the event pipeline (§8), not inline.

## 7. Visibility is independent of existence

AUTH-003. Three levels: `private`, `members`, `public`.

- Hiding evidence never deletes it and never removes it from the person's own view.
- **Visibility is not eligibility.** A private node may still inform the subject's own WRI. What an employer sees is governed separately by entitlement (EMP-004), which is Sprint 6.
- Employment by an organisation grants that organisation nothing. There is no path by which an employer reads a person's evidence because they employ them.
- Enforcement is server-side and expressed in the data model (DATA-MODEL-003). UI filtering is not a control.

## 8. The event pipeline

EVENT-001, EVENT-002, and Master PRD §34. This is the mechanism that makes §1's rule enforceable.

**No UI action, request handler or client may write an evidence node directly.** Producing subsystems emit domain events; a single evidence ingestion consumer is the only writer.

```
domain action → domain event → evidence ingestion consumer → evidence node
                                                                  │
                                                                  ▼
                                                        wri.recalculation.queued
```

Required properties:

1. **Idempotent.** Every producer supplies an `idempotency_key` derived from the source record and transition. Replaying an event must not create a second node. This is not optional for finalisation and payment-sensitive flows (EVENT-001).
2. **Traceable.** Every node names the event that created it; every WRI change traces back through nodes to source events (EVENT-002).
3. **Ordered per subject where it matters**, and safe when it is not.
4. **Failure-isolated.** A consumer failure must not corrupt a node or partially apply one. Failed ingestion is retried or parked, never half-written.
5. **WRI recalculation is queued, never inline.** A request that produces evidence returns without waiting for a score, and cannot be made to compute one.

Initial event vocabulary — the producing side of Sprints 4–8:

| Event | Produces |
|---|---|
| `levav28.attempt.completed` | E2 observation + evaluation |
| `quickwork.assignment.submitted` | E3 observations (timing, completion) |
| `quickwork.review.completed` | E3 evaluation against the closeout rubric |
| `employment.evidence.verified` | E3 |
| `impact.placement.verified` | E3 — the verified outputs, never the participation |
| `course.assessment.completed` | E1, only where measurement quality is sufficient |
| `hire.outcome.recorded` | E4 |
| `evidence.disputed` | Status transition + recalculation |

## 9. Evidence strength inputs

EVD-003. Strength is contextual and is computed by the WRI engine, not stored here. The graph's obligation is to **carry the inputs** so that computation is possible and explainable:

verification strength · actor relationship · recency (`occurred_at`) · duration · complexity · repetition across records · independence of actors · context relevance (`work_context`) · measurement reliability (`instrument_version`)

One consequence to design for now: **a single review must not dominate a long history.** The graph enables this by recording enough structure for the engine to see that a history is long. It does not enforce it — that is Sprint 3.

Reviewer trust (TRUST-001) attaches to the actor, not the node, and influences confidence rather than becoming a public score. Sprint 10.

## 10. Privacy and Evidence Centre

PRIV-001. The graph must be able to answer, for the subject, without special tooling:

- What evidence does Levav hold about me?
- Which is self-declared and which is verified, and by whom?
- Which of it can affect my readiness?
- Who can see each item?
- Who has viewed my protected readiness data? *(requires the audit store; Sprint 10)*
- How do I dispute this?

If the schema cannot answer these with ordinary queries, the schema is wrong. This is a design constraint on Sprint 2, not a screen to be built later.

## 11. Retention

SEC-009: raw assessment telemetry — keystroke timing, revision traces, session detail — is retained separately from durable evidence, on a shorter clock. Durable evidence outlives it. A node must remain interpretable after its telemetry is gone.

## 12. What Sprint 2 must deliver

1. Evidence node storage with every §3 field, RLS, and no DELETE grant.
2. The observation/evaluation distinction expressed in the schema.
3. Status lifecycle with audited transitions and append-only amendment.
4. Visibility enforced server-side.
5. The ingestion consumer as the sole writer, idempotent, with at least one real producer wired end to end.
6. Dispute transition changing status without deleting or mutating payload.
7. Privacy and Evidence Centre queries answerable.
8. Tests: idempotent replay, cross-user write rejection, direct-write rejection, dispute preserving the original, visibility enforced against direct API calls, and eligible-dimensions immutability by the subject.

**Exit gate (§46):** a verified event can create an auditable evidence node, and a dispute can change its processing state without deleting history.

## 13. Open decisions

| # | Decision | Disposition |
|---|---|---|
| 1 | Whether `evidence_type` is a database enum or a versioned reference table | Codex's call; reference table is likely, since the vocabulary grows every sprint |
| 2 | Event transport — database-backed outbox, queue, or Postgres NOTIFY | Codex's call within the existing stack. Must satisfy §8's five properties. Do not add infrastructure without justification |
| 3 | Telemetry retention period (SEC-009) | **Human decision (§49).** Sprint 2 implements it as configurable with a labelled provisional default |
| 4 | Whether E1 requires a per-assessment quality flag or a per-course one | Proposed per-assessment. Deferred to the Learn packet |

None blocks Sprint 2.
