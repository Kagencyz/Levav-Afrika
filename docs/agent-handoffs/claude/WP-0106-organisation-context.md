# WP-0106 — Organisation membership, verification and employer context

**Status:** READY_FOR_BUILD · **Sprint:** 1 · **Owner after handoff:** Codex
**Requirement IDs:** AUTH-002, AUTH-003, EMP-001, EMP-002, ONB-002, SEC-004, SEC-005, SEC-006, SEC-007, PRIV-001, §48
**Audit classification:** COMPLETE · **Binding spec:** `docs/product/ONBOARDING_AND_CAPABILITY_MODEL.md` §4, §9, §10, §11

---

## Product problem

`organizations.verificationStatus` has an enum — `pending`, `in_review`, `verified`, `rejected` — and **no process moves a row through it.** Verification is the gate on publishing Impact opportunities, posting jobs and eventually seeing candidates. Right now it is a column that never changes.

Separately, a member who selects `hire` or `represent_organisation` in onboarding is told nothing and given nowhere to go. PDR-0014 is explicit that declaring an intention grants no capability — but it must produce a **path**, and today there is none.

## User journey

Someone who wants to hire creates an organisation or asks to join one. They provide the details Levav needs to match against, and submit for verification. While it is pending, they can see exactly what state they are in and what happens next. Once verified, publishing capability appears — because the row says so, not because they said so.

## In scope

1. **Create an organisation** — the founder becomes an `owner` membership, with the row as the sole source of that capability.
2. **Request to join** an existing organisation; owners and admins approve or decline. Membership lifecycle uses `status`, never deletion.
3. **Verification submission and review** — moving `pending → in_review → verified | rejected`, with documents (SEC-007), a reviewer, a decision reason, and a resubmission path after rejection.
4. **Organisation profile fields required for matching** — model §10: operating locations, hiring markets, work modes offered, sector mapped to the WP-0101 taxonomy, size band.
5. **Hiring-needs capture** — model §11: role, seniority, skills, location and work mode, engagement type, timeline, number of people, outcomes. Stored per requirement, not per organisation.
6. **The create-or-join path** from Personal Home's eligibility-gated module (WP-0105).
7. **Organisation context permissions** — every action authorised server-side against membership and `orgRole`.
8. **Audit** of every membership and verification transition.

## Out of scope

- **Candidate search, matching results, or any view of a person's WRI or evidence.** Sprint 6, and it requires entitlement (EMP-004) which does not exist. §43 forbids premium WRI UI without server-side entitlement design.
- Job posting and the hiring pipeline — Sprint 6.
- Subscriptions, billing, entitlement — Sprint 6.
- Impact opportunity publication — Sprint 8, which consumes the verified status this packet delivers.
- Organisation public pages and posting — Sprint 8.
- Automated verification against a registry. Manual review only; a registry adapter is a later decision (API-004).

## Existing behaviour to preserve

- `organizations` and `organization_members` schema and RLS. Membership uses `status`, and there is **no DELETE grant** — do not add one.
- The existing `organizationRouter` registration; `server/router.test.ts` must pass unmodified unless the packet deliberately extends the allowlist, in which case update the test in the same commit.
- `users` gains **no role column** (PDR-0014). Capability stays a join.
- Auth and identity unchanged.

## Acceptance criteria

1. Creating an organisation creates an `owner` membership for the creator, and grants capability **only** through that row.
2. Join requests can be approved or declined by `owner`/`admin` only. Enforced server-side; negative test with a `member` role.
3. Verification transitions are server-side, restricted, audited, and follow `pending → in_review → verified | rejected`. Illegal transitions rejected.
4. **Verified status is never self-assignable.** A direct API call from an organisation owner attempting to set `verified` is rejected. Negative test required.
5. Rejection records a reason and permits resubmission without creating a duplicate organisation.
6. Verification documents are type-restricted, size-limited and validated by content, not extension (SEC-007). Negative test with a disguised file.
7. Matching fields from model §10 are captured, with sector mapped to the taxonomy rather than free text.
8. Hiring needs are captured per model §11, and **criteria that are or proxy for protected characteristics are rejected at capture** — not filtered later (§48). Negative test.
9. Every organisation action is authorised against membership and `orgRole` server-side. A member switching context gains only what their role permits.
10. **No endpoint in this packet returns any person's WRI, evidence, readiness or opportunity posture** (model §2, AUTH-003). Negative tests.
11. The create-or-join path is reachable from Personal Home's gated module, and reveals nothing about organisations the member has no membership in.
12. Membership and verification transitions write audit records.
13. All states per model §12, including a clear pending-verification state that does not imply a timeline Levav cannot honour.
14. Usable at 360 px; typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Additive migrations. `organizations` gains the matching fields; a new table holds hiring requirements; verification submissions are their own records with documents, reviewer, decision and timestamps, retaining history across resubmission.

No DELETE grants. Membership removal sets `status = 'removed'`.

## Privacy requirements

- An organisation sees its own members and its own submissions. Nothing about a member beyond what their profile makes visible (AUTH-003).
- **Opportunity posture is never reachable from an organisation context** (PDR-0014 §2). This is the single most important negative test in the packet — a member's employer may hold an account, and people are dismissed for looking for work.
- Verification documents are organisation data, restricted to `owner`/`admin` and reviewers.
- Membership is visible to the organisation always; public only if the member publishes it.

## Security considerations

- Verification is a **privilege escalation boundary** — verified status unlocks publication. Treat the review path accordingly: privileged, audited, and never reachable by the organisation being reviewed.
- SEC-006 requires stronger authentication for privileged administration. The reviewer path is admin-level; record what this packet implements and what remains for Sprint 10.
- Document upload: validate by magic bytes, cap size, store outside the application origin, scan where available.
- Rate-limit organisation creation — it is a cheap way to create verification-queue load.
- Audit store does not exist yet (PDR-0009). Write structured logs with correlation ids and record the migration requirement in `docs/implementation/`. **Do not build an audit table as a side effect of this packet.**

## Analytics and event requirements

`org.created`, `org.join.requested`, `org.join.decided`, `org.verification.submitted`, `org.verification.decided` with the outcome, `org.hiring_need.created`. Organisation identity, never member identity. Time-in-verification is an operational metric worth emitting from the start — a queue nobody measures is a queue that stalls.

## UI states

| State | Requirement |
|---|---|
| No organisation | Create-or-join path; nothing about other organisations disclosed |
| Join requested | Pending, with who decides |
| Membership active | Context available in the switcher |
| Verification not submitted | What is needed and why it matters |
| Verification pending | Honest: submitted, under review, **no promised timeline** |
| Verification rejected | Reason and the resubmission route |
| Verified | Which capabilities this unlocks, and which still require Sprint 6 work — using the PDR-0009 not-yet-available pattern |
| Insufficient role | The condition and who can grant it |
| Loading / error / offline / 360 px | All present |

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Create organisation | Owner membership created; capability follows the row |
| 2 | `member` role approves a join request | Rejected |
| 3 | Owner sets `verified` via direct API | **Rejected** |
| 4 | Full verification cycle including rejection and resubmission | History retained; no duplicate organisation |
| 5 | Upload a script renamed `.pdf` | Rejected |
| 6 | Hiring need with a protected characteristic as a criterion | Rejected at capture |
| 7 | Organisation context requests a member's WRI or evidence | Rejected |
| 8 | Organisation context requests opportunity posture | **Rejected** |
| 9 | Member with no membership probes an organisation endpoint | Nothing disclosed |
| 10 | Every transition | Audit record written |
| 11 | Onboarding `hire` selected | Path shown; **no membership or entitlement created** |
| 12 | 360 px | Usable |

## Dependencies

**WP-0101** (taxonomy, for sector mapping) and **WP-0103** (profile shape) must be ACCEPTED. Coordinate with **WP-0105** on the switcher and the gated entry point.

## Open product decisions

1. **Who performs verification review** in the near term. Levav staff via an admin path is assumed; a self-serve registry check is a later adapter decision (API-004). The operational owner is a **human decision** — verification is a trust commitment, and an unstaffed queue is worse than an honest "not yet available".
2. **Whether a member may hold `owner` on multiple organisations.** Recommend yes — consultants and group operators are common — with no cap in v1.
3. **What happens to an organisation when its last owner leaves.** Recommend blocking the last owner's departure until another owner is appointed, rather than orphaning the record.
