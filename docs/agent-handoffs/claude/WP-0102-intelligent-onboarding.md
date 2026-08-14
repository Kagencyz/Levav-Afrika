# WP-0102 — Intelligent onboarding on real taxonomy

**Status:** READY_FOR_BUILD · **Sprint:** 1 · **Owner after handoff:** Codex
**Requirement IDs:** ONB-001, ONB-002, ONB-003, AUTH-001, LANG-002, LANG-003, AFR-001, AFR-002
**Audit classification:** COMPLETE (extends real, working onboarding) · **Related decisions:** PDR-0003, PDR-0011

---

## Product problem

Onboarding today captures three things: goals, a primary goal and a personal status. That is a preference survey. ONB-002 requires Levav to understand career family, role, target role, seniority and industry, because every downstream system — Levav 28 personalisation, Role Fit, matching, Workforce Graph — is meaningless without them.

ONB-001's constraint is the interesting part: **no silent career classification.** The user confirms; the system does not decide. And ONB-003 requires value to appear early, which rules out a fifteen-screen form before anything useful happens.

There is also a live copy defect. `src/lib/onboardingRouting.ts` ships `'Find QuickWork™ or freelance gigs'` and `'Post a quick job or gig'`. PDR-0003 prohibits "gig" in user-facing copy, and the Master PRD opens §14 with "QuickWork is not a side-gig board". This is the packet that owns those strings.

## User journey

A new user finishes signup, states what they want to do and where they are, then tells Levav what work they do — choosing a career family, then a role, or typing their own title if the list does not fit. They confirm their seniority and industry. Levav shows what it understood, they correct anything wrong, and they land on the surface that matches their primary goal with one clear next action.

Someone who only wants QuickWork can declare capacity without completing career detail they do not need yet (ONB-003).

## In scope

1. **Extend `user_onboarding`** with career context: career family, canonical role, the user's own title verbatim, target role (optional), seniority band, industry, work mode. All nullable — partial onboarding is a legitimate state, not an error.
2. **Career step**, consuming WP-0101: pick family → pick role, or enter your own title and pick from resolved candidates. **The user's own words are always stored**, alongside whatever canonical role they confirm.
3. **A confirmation step** showing what Levav understood, every field editable before it becomes authoritative (ONB-001).
4. **Progressive, resumable, skippable.** Career detail is not required to finish onboarding. A user may skip and be prompted later from Personal Home. Progress survives a dropped connection (AFR-002/004).
5. **Route to the goal-appropriate destination**, extending the existing `onboardingRouting.ts` logic rather than replacing it. Where a destination does not exist yet, route to the nearest real surface and say so honestly — never a screen that pretends a workspace exists.
6. **Fix the two prohibited strings** in `SIGNUP_GOALS`, and move all onboarding copy to the approved keys in `COPY_DICTIONARY.md` §1 and §12.

## Out of scope

- **CV upload and extraction, and any AI inference (PDR-0011).** No model, no auto-classification, no "we think you are a…". The user chooses.
- Skills capture beyond the existing `skills` array. WP-0103 owns profile depth.
- Compensation expectations and QuickWork capacity detail — Sprint 5.
- Employer or organisation onboarding — WP-0106.
- Any evidence or readiness value. Sprint 1 creates claims, not evidence.

## Existing behaviour to preserve

- `onboardingRouter.complete` and `.get` keep working for existing records. A user who completed the old onboarding must not be forced through it again — new fields are null, and that is a valid state.
- `onboardingRouting.test.ts` keeps passing; the goal and status slugs stay in sync between `src/` and `server/`, which that test enforces.
- Auth, session and the registered router set unchanged.

## Acceptance criteria

1. New columns exist via a reversible migration, all nullable, with RLS and grants matching the existing `user_onboarding` pattern.
2. A user can complete onboarding **without** career detail and reach a working destination. Partial state persists and is resumable.
3. A user who enters an unlisted title keeps that exact string on their record, and it is displayed back to them unchanged. Assert with a non-English and a locally-specific title.
4. No field becomes authoritative without explicit user confirmation. Demonstrate that no code path writes a career field the user did not select or confirm.
5. Every onboarding string resolves from the copy dictionary. `grep -rn "gig" src/lib/onboardingRouting.ts` returns nothing.
6. Existing completed-onboarding records still load and route correctly. Test with a record having all new fields null.
7. Onboarding is usable at 360 px and survives a connection drop mid-flow without losing entered data.
8. Server-side validation rejects a career role that does not belong to the submitted family, and an inactive taxonomy version. Negative tests for both.
9. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

Additive migration on `user_onboarding`, reversible. Store both `career_role_id` (FK to the versioned taxonomy) **and** `self_described_title` (text). Storing only the canonical id erases the person's own language, which ONB-002 forbids; storing only free text rebuilds the problem WP-0101 solves.

Record the taxonomy version used at capture, so a later taxonomy change does not silently reinterpret what someone said.

## Privacy requirements

- Career context is personal data on the person's own record, readable only by them and by server-side paths that need it. No public exposure in this packet.
- Nothing captured here is published to any feed or profile surface without an explicit visibility decision, which is WP-0103's scope.
- The `taxonomy.title.unresolved` event from WP-0101 must not carry a user identifier.

## Security considerations

- All writes go through `authedProcedure` and write only to the calling user's own record. Negative test: user A cannot write user B's onboarding.
- Validate the family/role relationship server-side; a client sending a mismatched pair is rejected, not accommodated.
- Do not trust a client-supplied taxonomy version.

## Analytics and event requirements

- `onboarding.step.completed` with the step name — no field values.
- `onboarding.completed` with whether career detail was provided.
- `onboarding.career.skipped` — this is a product signal, not a failure; it tells us whether the step earns its place.

## UI states

| State | Requirement |
|---|---|
| Fresh start | First step, no prior data |
| Resumed | Returns to the furthest incomplete step with prior answers intact |
| Own-title entry | Candidates listed; "None of these match" is always available and keeps the typed title |
| No candidates | Honest message; user proceeds with their own title. Never a wrong guess |
| Skipped career step | Completes successfully; Personal Home shows the prompt to finish later |
| Offline / dropped connection | Entered data preserved; `global.error.network.*` copy |
| Loading, error, permission | Present on every step |
| 360 px | Usable throughout; no horizontal overflow |

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | New user, full path with a listed role | All fields stored; correct destination |
| 2 | New user, own title "Bursar" | Candidates shown, choice confirmed, "Bursar" stored verbatim |
| 3 | Own title with no candidates | Proceeds, own title stored, nothing guessed |
| 4 | Skip the career step | Completes; routes correctly; prompt appears on Personal Home |
| 5 | Existing pre-WP-0102 record | Loads, routes, no forced re-onboarding |
| 6 | Direct API call with a role from a different family | Rejected server-side |
| 7 | Direct API call writing another user's onboarding | Rejected |
| 8 | Connection drops mid-flow, user returns | Data intact, resumes at the right step |
| 9 | Whole flow at 360 px | No overflow, all actions reachable |

## Dependencies

**WP-0101 must be ACCEPTED first.** This packet consumes the taxonomy read API.

## Open product decisions

1. **Whether target role is asked during onboarding or deferred to Personal Home.** Proposed: ask, but make it plainly optional — it drives Levav 28 personalisation and Role Fit later, and asking once is cheaper than chasing it. If it measurably hurts completion, we move it.
2. **Whether work mode belongs here or in the QuickWork capacity profile.** Proposed: capture a simple preference here, with the detailed capacity model staying in Sprint 5.

Implement the proposals and note them in the report.


---

# Amendment A1 — Four-axis model (supersedes the situation and preference scope above)

**Issued:** 2026-08-12 · **Authority:** PDR-0014 · **Binding spec:** `docs/product/ONBOARDING_AND_CAPABILITY_MODEL.md`

The product owner has broadened this packet's scope. The original text proposed capturing a personal status, an optional target role and a simple work preference. That is now insufficient, and Codex must not infer the rest.

**What changes**

1. **Employment situation** replaces `personalStatus`, with the seven-value vocabulary in the model §1, and the migration in that section. Migrated values are marked inferred and confirmed by the member before use — no silent reclassification (ONB-001).
2. **Opportunity posture** is a new, separate, single-select axis (model §2). It is **private**, and `actively_seeking` must have no employer read path whatsoever. Implement it as private-by-construction, not private-by-default-setting.
3. **Platform intentions** stay multi-select and are corrected for PDR-0003: the shipped strings "Find QuickWork™ or freelance gigs" and "Post a quick job or gig" are replaced by the model §3 labels.
4. **Declaring an intention grants no capability** (model §4). Selecting `hire` or `represent_organisation` routes to the create-or-join-organisation path; it never writes a membership, a role or an entitlement.
5. **Situation, posture and intentions are each independently skippable.** `unspecified` is valid throughout and blocks nothing (ONB-003).
6. **Editing later** is a single settings surface (model §6), and changing any axis never alters capability, evidence or access.

**Additional acceptance criteria**

10. Situation, posture and intentions are three separate columns. No combined enum, and no role column added to `users`.
11. A member can complete onboarding having answered none of the three; routing still works.
12. No employer-reachable endpoint returns opportunity posture. Negative test required.
13. Selecting `hire` creates no membership row, no `orgRole`, no entitlement. Negative test required.
14. Migrated `volunteering` / `changing_careers` / `returning_to_work` values are marked inferred and are not used for ordering until confirmed.
15. `grep -rn "gig" src/lib/onboardingRouting.ts` returns nothing.
16. Analytics events per model §13, with no values in payloads.

**Additional test scenarios**

| # | Scenario | Expected |
|---|---|---|
| 10 | Employed + open to opportunities | Both stored separately; posture private |
| 11 | Employed + not seeking + intention `develop` | Distinguishable from #10 in the data, not only in the UI |
| 12 | Not working + actively seeking | Stored; no employer read path exists |
| 13 | Five intentions selected | All stored; primary retained; routing works |
| 14 | Select `hire` | No membership, role or entitlement created |
| 15 | Skip all three axes | Onboarding completes; member reaches a working destination |
| 16 | Pre-existing record with `volunteering` | Migrated, marked inferred, member asked to confirm |

**Dependencies unchanged:** WP-0101 must be ACCEPTED first.
