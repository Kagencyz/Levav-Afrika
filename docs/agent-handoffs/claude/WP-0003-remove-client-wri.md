# WP-0003 — Remove the client-side WRI scoring engine

**Status:** READY_FOR_BUILD
**Sprint:** 0 · **Owner after handoff:** Codex
**Priority:** Highest product-integrity priority in Sprint 0
**Requirement IDs:** WRI-001, WRI-003, WRI-004, EVD-001, EVENT-001, FEED-008, IMPACT-002, LEARN-002, §48
**Audit classification:** REMOVE
**Related decisions:** PDR-0001, PDR-0002

---

## Product problem

Levav ships a Workforce Readiness Index today. It is a `localStorage` points system mutated directly by UI actions, and three of its rules break Master PRD invariants outright:

```
'feed-first-post':    { dimension: 'communication', points: 10 }   // posting raises WRI
'quickwork-applied':  { dimension: 'reliability',   points:  5 }   // applying raises WRI
'impact-volunteer':   { dimension: 'leadership',    points: 15 }   // volunteering raises WRI
```

FEED-008 states popularity is never readiness. IMPACT-002 states Impact participation never creates an automatic WRI increase. LEARN-002 states course completion alone never raises WRI. §48 prohibits letting UI requests directly mutate WRI scores, and prohibits hard-coding provisional coefficients as truth.

Beyond the specific rules, the whole mechanism is wrong: no evidence record, no provenance, no confidence, no coverage, no trajectory, no versioning, no audit, no server. It is device-local, so it is also trivially editable by the user whose readiness it claims to describe.

WRI is Levav's central credibility claim. Everything else — employer trust, evidence integrity, the entire commercial thesis — depends on it meaning something. A number that goes up when you post to a feed does not.

This must be removed before Sprint 1, not carried while the real engine is built. Every week it ships, users learn to trust a number Levav cannot stand behind.

## User journey

**Today:** a user completes a Learn lesson, posts to the feed, applies to a QuickWork listing, and watches a "readiness" number rise. Nothing was demonstrated and nothing was verified.

**After this packet:** every WRI surface states plainly that the user has not created evidence yet, and points at the one action that will — Levav 28 Day 1, once Sprint 4 delivers it. Until then it names what is coming without promising a date.

**After Sprint 3:** the same surfaces render a server-derived snapshot with confidence and coverage, from real evidence.

## In scope

1. **Delete the scoring engine.** From `src/lib/levavData.ts`: `WRI_SCORING_RULES`, `awardWriPoints`, `getWriScore`, `saveWriScore`, `isWriInitialized`, `getWriUnlockStatus`, the `WriScore`/`WriDimension` types, and the `wriScore` localStorage key.
2. **Delete `src/lib/wriService.ts`** entirely, including `getWriAnalytics` and every re-export.
3. **Remove every call site.** `awardWriPoints` is called from Levav 28, Learn, QuickWork, Impact and Feed flows. Remove the calls; do not replace them with a no-op that could be re-enabled.
4. **Replace every WRI display with the honest empty state.** Use `wri.confidence.none.label` and `wri.confidence.none.body` from `docs/product/COPY_DICTIONARY.md` §3. Do not render `0`, `—`, a greyed number, a locked badge, an empty progress ring, or a "coming soon" score. A visual that implies a hidden number is the same defect in a different font.
5. **Purge stored values on load.** Clear the `wriScore` localStorage key when the app starts, once, and remove that cleanup in a later sprint. Values are discarded, not migrated (PDR-0001).
6. **Remove `wriUnlock` from the Levav 28 day data** and anything that reads it. Days do not award dimensions.
7. **Delete the tests that assert the removed scoring behaviour**, in `src/lib/levavData.test.ts`. Add a test asserting no module in `src/` exports a WRI-writing function and that `wriScore` is not written — a guard against reintroduction, in the spirit of `server/router.test.ts`.

## Out of scope

- **Building the real WRI engine.** That is Sprint 3, and it depends on the Evidence Graph landing in Sprint 2. Do not scaffold it here.
- Any server route, schema or migration.
- The rest of `levavData.ts` — Levav 28 content, Learn, QuickWork and Feed seed data stay for now. They are retired in their own sprints (PDR-0004).
- Copy rewrites beyond the WRI strings named above.
- Removing WRI *pages* — the surface stays and tells the truth.

## Existing behaviour to preserve

- Every page that currently displays WRI must still render, still navigate and still work. This is a removal, not a page deletion.
- No auth, routing, profile or onboarding behaviour changes.
- `npm test` stays green at ≥56 tests minus the deliberately deleted scoring tests, plus the new guard.

## Acceptance criteria

1. `grep -rn "awardWriPoints\|WRI_SCORING_RULES\|wriService\|saveWriScore\|getWriUnlockStatus" src server` returns **no results**.
2. No module in `src/` writes any WRI value to `localStorage`, to a server, or to any store. Evidenced by the new guard test.
3. Every **authenticated** surface that previously displayed a WRI number now shows the `wri.confidence.none` empty state with its next action, verbatim from the copy dictionary.
4. **No surface renders a numeric WRI, a zero, a placeholder, a locked score, or a progress indicator implying a hidden value — public and marketing surfaces included.** "Surface" means anything the application renders, not only signed-in product screens. List every changed surface in the report.
5. Completing a Learn lesson, posting to the feed, applying to a QuickWork listing and applying to an Impact opportunity produce **no readiness change of any kind**. Demonstrate each of the four.
6. `wriScore` is cleared from `localStorage` on app load, and the clearing code carries a comment naming this packet and a removal condition.
7. `npm run typecheck` and `npm run build` pass; the frontend baseline (WP-0002) does not grow.
8. All other tests still pass.

## Data requirements

No database change. `localStorage.wriScore` is destroyed, deliberately and irreversibly — PDR-0001 records why: values with no provenance cannot be reconstructed as evidence, and importing them would seed the real engine with fiction.

## Privacy requirements

Removal only; nothing new is collected, stored or transmitted. Confirm no WRI value is sent anywhere as part of the cleanup — no analytics event, no "migration" call, no logging of the discarded object.

## Security considerations

- Removing a client-side score removes a trivially forgeable claim. That is the point.
- Confirm no server route consumes a client-supplied WRI value. The `wri.ts` router is deleted by WP-0001; verify nothing else reads one from a request body.
- The new guard test is a control. It must fail if a WRI-writing export is reintroduced.

## Analytics and event requirements

If an analytics event fires on WRI change, remove it. Do not add replacement events — the Sprint 2 event pipeline (EVENT-001) defines the real ones, and a placeholder now would prejudge that design.

## UI states

| Surface | Required state |
|---|---|
| Personal Home / Dashboard WRI panel | Empty state, `wri.confidence.none.*`, single next action |
| Talent analytics | Empty state; no chart with zero values, no axis implying a scale |
| Levav 28 day view | No dimension award, no "unlocks communication" language |
| Learn lesson completion | Completion confirmation only; no readiness change |
| QuickWork apply | Application confirmation only |
| Impact apply | Application confirmation, plus `impact.wri.notice` |
| Feed post published | Post confirmation only |
| Employer-facing candidate views | No WRI element at all until entitlement exists (EMP-004) |
| **Landing page and every marketing section** (`src/sections/home/`, `src/pages/Home.tsx`, footer) | **No score, no dimension bars, no fabricated evidence strings.** A marketing section may illustrate the *concept* — Levav ID, verified evidence, professional identity — but may not render a readiness figure for a real or fictional person |

**Amendment A1 (2026-08-12), after WP-0003 review round 1.** The row above was added because the original table enumerated authenticated surfaces only, while acceptance criterion 4 was unqualified. `src/sections/home/ProfilePreviewSection.tsx` shipped a "74" WRI with four dimension bars and the strings `'QuickWork™ · 12 gigs completed, 4.9★'` and `'Levav Impact™ · 40 verified service hours'`, rendered publicly from `Home.tsx:43`. The ambiguity was Claude's; the defect is still S1, because a fabricated readiness score on a public page is precisely the harm this packet removes.

The rule this establishes for every later packet: **a product invariant binds on marketing surfaces too.** Anywhere Levav renders a capability it does not have — a score, a benchmark, a verification badge, a match strength — the invariant applies, whether or not the viewer is signed in. Illustrative mockups are not exempt, because a visitor cannot tell an illustration from a screenshot.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | New user, complete a Learn lesson | No readiness value appears anywhere |
| 2 | Post to the feed | No readiness change; no communication increase |
| 3 | Apply to a QuickWork listing | No reliability change |
| 4 | Apply to an Impact opportunity | No leadership change; `impact.wri.notice` shown |
| 5 | Existing user with a stored `wriScore` opens the app | Key cleared; empty state shown; no error and no flash of a number |
| 6 | Reintroduce a WRI-writing export locally | Guard test fails |
| 7 | Every WRI-bearing page on a 360 px viewport | Empty state legible, action reachable |
| 8 | Offline load | Empty state renders; no crash from the missing key |

## Dependencies

None — may run in parallel with WP-0001 (disjoint files). Blocks Sprint 2 and Sprint 3, because the Evidence Graph and the real WRI engine must not be built alongside a competing client implementation.

## Open product decisions

None for removal. Two are recorded and deliberately **not** answered here:

- The final WRI scale, weights and confidence thresholds are Master PRD §49 human decisions.
- The Day 15 evidence-sufficiency threshold is PDR-0007, ESCALATED.

Neither blocks this packet. Removal does not require knowing what replaces it.

## Report back

§42.2 format. The report must list **every** surface changed and state, for each, exactly what the user now sees where a number used to be. Claude will check these individually — an implementation summary is not evidence.
