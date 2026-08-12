# Product Decision Record Log

**Owner:** Claude (Product Command). Codex must not edit this file (Master PRD §41).

An approved PDR is authority level 2 — it amends the Master PRD. Anything not recorded here is not a decision; it is an assumption, and Codex must return `BLOCKED_PRODUCT_DECISION` rather than invent one (CODEX-006).

**States:** PROPOSED · APPROVED · REJECTED · SUPERSEDED · **ESCALATED** (needs a human owner per Master PRD §49).

| ID | Title | State | Date |
|---|---|---|---|
| PDR-0001 | WRI is server-derived from evidence only | APPROVED | 2026-08-12 |
| PDR-0002 | The ten PRD dimensions are canonical; the six-dimension prototype set is retired | APPROVED | 2026-08-12 |
| PDR-0003 | "Assignment" is the canonical QuickWork unit; "gig" is prohibited | APPROVED | 2026-08-12 |
| PDR-0004 | Levav 28 prototype content is retired, not migrated | APPROVED | 2026-08-12 |
| PDR-0005 | Frontend typecheck becomes a required gate with a bounded debt allowance | APPROVED | 2026-08-12 |
| PDR-0006 | Unreachable routers are deleted, not preserved | APPROVED | 2026-08-12 |
| PDR-0007 | Day 15 evidence-sufficiency threshold | **ESCALATED** | 2026-08-12 |
| PDR-0008 | QuickWork payment, escrow and dispute model | **ESCALATED** | 2026-08-12 |
| PDR-0009 | Unimplemented controls state their absence; retired local keys are cleared | APPROVED | 2026-08-12 |
| PDR-0010 | Nominated written work samples may become evidence; publishing never does | **PROPOSED** | 2026-08-12 |

---

## PDR-0001 — WRI is server-derived from evidence only

**State:** APPROVED · **Requirements:** WRI-001…005, EVD-001, EVENT-001, FEED-008, IMPACT-002, LEARN-002, §48

**Context.** `src/lib/levavData.ts` exports `awardWriPoints(key)`, called directly from UI actions, mutating a `localStorage` object. Rules include `feed-first-post` (+10 communication), `quickwork-applied` (+5 reliability) and `impact-volunteer` (+15 leadership).

**Decision.** No client code may compute, award or persist a WRI value. WRI exists only as a server-side snapshot derived from evidence records through the controlled event pipeline. The client renders what the server returns and nothing else.

Consequences, decided explicitly:

1. Existing `localStorage` WRI values are **discarded, not migrated**. They have no provenance and cannot be reconstructed as evidence. There is no legitimate way to carry them forward.
2. Until the Sprint 3 engine exists, WRI surfaces render `wri.confidence.none.*` — an honest empty state, not a zero and not a placeholder number.
3. This is not reversible by convenience. Reintroducing client-side scoring requires a superseding PDR.

**Rejected alternative.** Keeping the client engine "temporarily so the UI has something to show". A number with no evidence behind it is precisely the failure mode the Master PRD is built to prevent, and shipping one teaches users to trust it.

**Implemented by:** WP-0003.

## PDR-0002 — The ten PRD dimensions are canonical

**State:** APPROVED · **Requirements:** WRI-001, LANG-002

**Context.** The code uses six dimensions — `technical, communication, reliability, leadership, creativity, growth`. `technical` and `creativity` are not PRD constructs; six of the PRD's ten are absent.

**Decision.** The canonical set is the Master PRD §12.1 ten, with the display names fixed in `COPY_DICTIONARY.md` §3. The six-dimension set is retired with no mapping table — a partial mapping would imply the old values carry meaning into the new model. They do not.

**Note for Sprint 3.** Coefficients and scale remain **provisional and versioned** (WRI-004). This PDR fixes the *constructs*, not their weights. Weights are PDR-0007-adjacent and remain a §49 human decision.

## PDR-0003 — "Assignment" is the canonical QuickWork unit

**State:** APPROVED · **Requirements:** QW-003, LANG-002, §48

**Context.** `gig` appears 157 times against `QuickWork` 65. The domain type is `QuickWorkGig`.

**Decision.** The unit of QuickWork is an **assignment**. "Gig" is prohibited in user-facing copy, code identifiers, database column names, event names and analytics keys. Vocabulary that pervasive shapes the schema, and the Master PRD explicitly forbids a gig board.

**Application.** Not a rename sweep in Sprint 0 — the code is being replaced anyway. It binds on every QuickWork packet from Sprint 5, and immediately on all new code.

## PDR-0004 — Levav 28 prototype content is retired, not migrated

**State:** APPROVED · **Requirements:** L28-001…009

**Context.** `LEVAV28_DAYS` is a 33-day motivational programme (`CONFRONT` phases, daily quotes, reflection prompts). The PRD specifies a 28-day adaptive work simulation with personas, modalities and rubrics.

**Decision.** The existing content is retired. It is not a seed for Scenario Studio, not a fallback, and not a "lite mode". Scenario content is authored against the scenario schema in Sprint 4 under `specs/scenarios/`.

**Rejected alternative.** Wrapping the existing days as "development mode" content under L28-003. The development/assessment split is about *scored vs unscored evidence tasks*, not about keeping motivational content that no longer matches the product.

## PDR-0005 — Frontend typecheck becomes a required gate

**State:** APPROVED · **Requirements:** §47.1, ENG-003

**Context.** `npm run typecheck` covers only `tsconfig.server.json` and exits 0 while the frontend carries 156 errors. `npm run build` inherits the blind spot.

**Decision.** `typecheck` must cover both projects. Because 156 pre-existing errors cannot be fixed inside Sprint 0 without touching most of the frontend:

- `npm run typecheck` runs both configs and **reports** both.
- A committed baseline file records the known frontend errors. CI fails on any error **not** in the baseline, and on any packet that increases the count.
- The baseline shrinks as each surface is rebuilt. It is never increased. Removing the baseline mechanism entirely is the Sprint 10 target.

**Rejected alternatives.** (a) Leave the gate as-is — it lies. (b) Fix all 156 in Sprint 0 — that is a frontend rewrite disguised as housekeeping, and §48 forbids blind rewrites.

**Implemented by:** WP-0002.

## PDR-0006 — Unreachable routers are deleted

**State:** APPROVED · **Requirements:** ENG-005, SEC-004, §48

**Context.** Eight routers (`employer`, `job`, `application`, `message`, `notification`, `review`, `upload`, `wri`) are written, unregistered, guarded by `server/router.test.ts`, reference dropped tables, and carry known authorisation defects.

**Decision.** Delete them. They will be rebuilt against the Evidence Graph and entitlement model, and nothing in them survives that rebuild. The allowlist guard in `server/router.test.ts` is **kept** — it is a good control and continues to protect the registration surface.

**Why deletion rather than retention.** Code that looks 90% finished is an invitation. `employer.ts` reads `ctx.user.id` where the context provides `userId`; `upload.getPresignedUrl` has no authorisation check. Git history preserves them for reference.

## PDR-0009 — Unimplemented controls state their absence; retired local keys are cleared

**State:** APPROVED · **Requirements:** SEC-005, SEC-010, PRIV-001, LANG-003
**Raised by:** Codex `BLOCKED_PRODUCT_DECISION` on WP-0001 · **Applied in:** WP-0001 Amendment A1

**Context.** `src/lib/auditService.ts` writes an "audit log" to `localStorage` and feeds the Admin Audit Logs tab. Two verified facts: nothing in `src/` writes `localStorage['user']`, so the service's actor lookup returns `null` on every call and no entry has been written since the httpOnly-cookie migration; and the record shape hard-codes `ipAddress: 'client-side'`. The tab renders an empty log today, and would render fabricated provenance if it ever rendered anything.

**Decision, part 1 — unimplemented controls.** A security or compliance surface that exists in the interface but is not implemented must **state that it is not implemented**. It must never render an empty result set, a zero count, or a disabled control.

The reasoning generalises beyond audit: for a control that is supposed to observe things, an empty result and a control that is not running are visually identical, and the empty result is read as assurance. "No entries found" tells an administrator nothing happened. "Levav is not recording an audit trail" tells them the truth. This binds on every future surface where a control is scheduled but absent — access history, export logs, moderation queues, consent records.

**Decision, part 2 — retired local keys.** Personal data left in `localStorage` after its feature is removed must be actively cleared, not abandoned. `levav_audit_log` holds up to 500 records of `userId` and `userEmail`.

Orphaned personal data has no purpose, no retention rule, no lawful basis, and — because no server knows it exists — no way to satisfy a deletion or export request (SEC-010, PRIV-001). "Harmless" is not a category the privacy requirements recognise.

Cleanup is consolidated into **one** retired-key module shared with WP-0003's `wriScore` removal, with a documented removal condition. Two competing cleanup paths is how one of them silently stops running.

**Rejected alternative.** Removing the Audit Logs tab outright. It is the tidier change, but it deletes the only visible marker that SEC-005 is unmet, and an administrator who remembers the tab would reasonably assume audit had moved rather than never existed.
## PDR-0010 — Nominated written work samples may become evidence; publishing never does

**State:** PROPOSED · endorsed in principle by the product owner 2026-08-12 · **decided at Sprint 8**
**Requirements:** FEED-002, FEED-008, EVD-001, EVD-003, WRI-003, WRI-005, AI-002, AI-008, TRUST-001
**Relationship to PDR-0001:** complementary, not a reversal. PDR-0001 stands in full.

**Context.** WP-0003 removes `feed-first-post`, which awarded +10 communication for the existence of a user's first post. The product owner asked whether feed writing should be able to count for readiness at all, "especially if it's valid and helpful". The answer is yes — under the same rules as every other piece of evidence, and only for what the artefact actually demonstrates.

### The distinction this PDR turns on

**The act of publishing is not evidence. A piece of written work can be.**

`feed-first-post` measured the act: one post, once, +10, regardless of content. That is unfixable by tuning, because nothing about it is an observation of behaviour. What *is* observable is the writing itself — its clarity, structure, reasoning and audience awareness.

So the mechanism is not "posting raises your score". It is: **a member nominates a piece of their own professional writing for assessment, and the assessment is what produces evidence.** The feed is where the writing happens to live. Publishing frequency becomes irrelevant to readiness, which removes the volume incentive entirely.

### The trap in "helpful"

Helpfulness must never be inferred from engagement. Reactions, comments, saves, shares, follower counts and reach are **inadmissible as evidence inputs** — using them is FEED-008, restated. A post that many people liked is a popular post, and Levav does not measure popularity.

Helpfulness is assessed from the artefact, against a rubric: does the writing make a reader more able to do something, decide something or understand something, in a professional context. That is a property of the text, and it is assessable without counting anyone's approval.

### What a written sample can and cannot show

The decisive constraint. A post describing work is a **claim** about that work. The assessment can observe the writing; it cannot verify that the described events happened.

| Observable in the artefact | Not observable |
|---|---|
| Communication — clarity, structure, audience awareness | Reliability and execution |
| Critical thinking — where the writing reasons through a real problem, shows its assumptions and considers alternatives | Collaboration and teamwork |
| Professional discipline — where the writing demonstrates documentation quality or rigour | Initiative and ownership |
| | Leadership readiness · Adaptability · Problem solving · Contribution |

**Eligible dimensions are limited to Communication, Critical Thinking and Professional Discipline**, and only where the sample genuinely exercises them. Nothing else may be inferred from a self-authored text.

### Conditions, all of which must hold

1. **Nominated, not automatic.** The member explicitly submits a specific piece for assessment. Levav never harvests the feed.
2. **Bounded.** A small standing allowance — proposed three nominations per assessment window, exact figure a Sprint 8 decision. Volume produces no additional evidence.
3. **Rubric-assessed and versioned.** Behaviourally anchored rubric, structured AI output, recorded rubric and model version (WRI-005, AI-002, AI-003). Low-confidence assessment routes to human review, never to a silent score.
4. **Recorded as E0.** Self-authored, self-selected, produced under no controlled conditions and with unrestricted assistance. It is the weakest evidence tier and its provenance must say so.
5. **Capped, and never sufficient alone.** A nominated sample may contribute to a dimension but may never, by itself, lift that dimension above provisional confidence. E0 cannot substitute for E2 or E3 (WRI-003, EVD-003).
6. **Authorship risk is a signal only.** Suspected undisclosed AI authorship is a risk flag that may trigger a follow-up or a live task. It never produces a WRI penalty on its own (L28-008, AI-008).
7. **Engagement metrics are structurally excluded** from the assessment input, the evidence record and the confidence calculation.
8. **Independent endorsement is not a shortcut.** A qualified peer confirming a sample's substance may raise Evidence Confidence, subject to reviewer trust and reciprocal-endorsement detection (TRUST-001). It never converts E0 into verified work evidence.

### Why this is worth building

It gives the Feed a reason to exist inside the readiness system without corrupting it, and it gives members a route to demonstrate written reasoning that Levav 28 cannot fully cover — self-directed writing about problems the member chose, which is closer to how senior professionals actually demonstrate judgement. It is also the honest form of what `feed-first-post` was gesturing at.

### Why it is PROPOSED and not APPROVED

It cannot be implemented before the Evidence Graph (Sprint 2), the WRI engine (Sprint 3) and the rubric work (Sprint 4) exist. Approving it now would create a specification with no foundation to sit on, and the cap in condition 5 needs the real confidence model to be set meaningfully.

**Decision point:** Sprint 8, when the Feed is specified. Until then this PDR governs nothing and no packet may implement it. WP-0003 proceeds unchanged.

## PDR-0007 — Day 15 evidence-sufficiency threshold

**State:** **ESCALATED to human owner** (Master PRD §49) · **Requirements:** L28-005

Levav 28 Day 15 must gate on evidence sufficiency rather than calendar completion. The threshold — how many observations, across how many dimensions, at what measurement quality — is a launch policy decision, not an agent decision. Claude will prepare options with trade-offs before Sprint 4. **Neither agent may set this value as permanent policy.** Sprint 4 implements it as a configurable, versioned parameter with a provisional default that is clearly labelled provisional.

## PDR-0008 — QuickWork payment, escrow and dispute model

**State:** **ESCALATED to human owner** (Master PRD §49) · **Requirements:** QW-008

Funding model, escrow provider, milestone release conditions, partial completion, revision limits, cancellation, refunds, chargebacks and platform fee are all §49 decisions requiring human approval. Sprint 5 builds the **assignment lifecycle and payment state model** without committing to a provider, so that the commercial decision plugs in through an adapter (API-004). `src/pages/MilestonePayments.tsx` and `ContractWorkspace.tsx` stay deferred until this is resolved.
