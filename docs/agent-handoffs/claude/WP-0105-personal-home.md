# WP-0105 — Personal Home on real services

**Status:** READY_FOR_BUILD · **Sprint:** 1 · **Owner after handoff:** Codex
**Requirement IDs:** ONB-003, AUTH-001, AUTH-002, PROF-002, SEC-004, PRIV-001, LANG-003, AFR-001/002/004/010, PDR-0001, PDR-0012
**Audit classification:** MODIFY · **Binding spec:** `docs/product/ONBOARDING_AND_CAPABILITY_MODEL.md` §7, §8, §12, §13

---

## Product problem

Personal Home is the surface a member lands on every time they sign in, and it currently runs on mock data. It shows the same thing to everyone, which means it is useless to all of them: a senior accountant seeking growth, a graduate actively looking for work, and an SME owner posting assignments are given identical screens.

PDR-0014 supplies the model. This packet makes Personal Home read real state and order itself from what the member actually told Levav.

## User journey

A member signs in and sees, first, the thing that matches why they came. Someone building readiness sees Levav 28 and their next task. Someone looking for work sees opportunities and what their profile is missing. Someone running an organisation sees their workspace. Everything else Levav offers is still visible below, so nobody discovers six months later that a capability existed.

## In scope

1. **Replace mock content with real state** — profile, onboarding axes, organisation memberships, all from registered tRPC procedures.
2. **Module ordering** per model §7: intentions first, situation second, deterministic and explainable. Never ordered by readiness, engagement or login recency.
3. **Three presentation tiers** per model §8 — primary, secondary, eligibility-gated. **Nothing is hidden.**
4. **Member override** — reorder or pin modules; the member's order always wins over the computed one, and persists.
5. **The workspace switcher** (model §9) where the member has at least one active organisation membership. Personal is always the sign-in default.
6. **Impact card** with the six states from `LEVAV_IMPACT_SPEC.md` §3.1.
7. **All required states** per model §12, including the eligibility-gated and not-yet-available patterns.
8. **Analytics** per model §13 — particularly `home.module.eligibility_shown`.

## Out of scope

- **Any WRI value.** The WRI area shows `wri.confidence.none.*` until Sprint 3 delivers snapshots and WP-0305 delivers display (PDR-0001).
- Any readiness figure, completeness percentage or profile-strength score. A completeness percentage is a readiness signal in disguise (PDR-0012, copy dictionary §12).
- Organisation workspace internals — WP-0106. This packet renders the entry point and the switcher only.
- Employer-facing surfaces, entitlement, matching — Sprint 6.
- Feed, Learn, QuickWork and Impact internals. Personal Home links to them; it does not implement them.
- Notification centre — Sprint 8.

## Existing behaviour to preserve

- `onboardingRouting.ts` first-run destination logic keeps working and stays test-covered.
- Auth, session and identity unchanged. Registered tRPC surface unchanged — `server/router.test.ts` must still pass unmodified.
- Members with incomplete onboarding still reach a working home. Missing axes are a valid state, not an error.

## Acceptance criteria

1. No `MOCK_*` array and no `localStorage` read supplies Personal Home content. Every module renders from a real service or an honest empty state.
2. Ordering is computed per model §7 and is **deterministic** — same inputs, same order. A test asserts this.
3. Ordering never reads a readiness value, engagement metric or login recency. Assert by absence.
4. All three tiers render. An eligibility-gated module states the condition **and** the action that satisfies it; it is never disabled without explanation and never silently removed.
5. Member reordering persists and overrides the computed order.
6. The switcher lists Personal plus every `status='active'` membership; Personal is the default on every sign-in; an organisation context is unmistakable.
7. Switching context changes navigation and permissions only. **Personal evidence, WRI and profile are not reachable from an organisation context** (AUTH-003). Negative test.
8. A member with no membership sees no switcher and instead sees the eligibility-gated path.
9. **No WRI number, zero, placeholder or progress ring anywhere.** No completeness percentage.
10. Every state in model §12 exists, including offline.
11. Analytics events fire per §13, with no values in payloads.
12. Usable at 360 px with images unloaded.
13. Typecheck, tests and build pass; frontend baseline does not grow.

## Data requirements

No new tables. Reads existing profile, onboarding and membership data. Module order preference is member state — a small per-user record, not a new subsystem.

## Privacy requirements

- Personal Home may display the member's own situation, posture and intentions. **None of it is exposed to any other member, organisation or public surface.**
- Opportunity posture must not appear in any payload reachable by an organisation context (model §2). Negative test.
- Nothing on this surface is evidence, and nothing here creates any.

## Security considerations

- Every read is scoped server-side to the calling user. Cross-user negative test.
- Organisation modules are authorised against membership and `orgRole` server-side; the switcher is navigation, not permission. A member who switches context must still fail authorisation for anything their `orgRole` does not permit.
- Eligibility-gated modules must not leak what they are gating — showing that an organisation exists, or its name, to someone with no membership is a disclosure.

## UI states

| Module state | Requirement |
|---|---|
| Primary | Top, expanded, one clear next action |
| Secondary | Present, collapsed, discoverable |
| Eligibility-gated | Condition plus satisfying action |
| Not yet available | PDR-0009 pattern — states that the capability does not exist yet |
| Loading | Skeleton matching final layout |
| Error | Plain cause plus next safe step; other modules keep working |
| Offline | Last known state with an honest staleness note |
| New member, nothing declared | Works; invites completion without blocking |

A single failing module must never take down the page.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | `develop` + `employed` + `not_seeking` | Levav 28 and Learn primary; Jobs secondary, not removed |
| 2 | `find_work` + `not_working` + `actively_seeking` | Jobs and QuickWork primary |
| 3 | Five intentions | Deterministic order; all modules reachable |
| 4 | No axes declared | Sensible default order; nothing broken |
| 5 | Member reorders, signs out and in | Their order persists and wins |
| 6 | No organisation membership | No switcher; eligibility-gated org path shown |
| 7 | Active membership | Switcher lists it; Personal still default |
| 8 | In organisation context, request personal evidence | Rejected |
| 9 | Organisation context with a limited `orgRole` | Actions outside that role rejected server-side |
| 10 | Search the rendered page for a WRI number or percentage | None |
| 11 | One module's service fails | That module errors; page works |
| 12 | 360 px, images blocked | Fully usable |

## Dependencies

**WP-0102** and **WP-0103** must be ACCEPTED — this packet consumes the axes and the profile shape. Coordinate with **WP-0106** on the switcher and the organisation entry point; whichever lands second uses what the first established.

## Open product decisions

1. **Persisting module order** — a small `user_preferences` row is recommended over adding columns to `users`, since more UI preferences will follow.
2. **Whether secondary modules are collapsed or simply lower.** Recommend collapsed on mobile, lower on desktop — the constraint differs by screen, the discoverability requirement does not.
