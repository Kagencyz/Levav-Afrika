# WP-0004 — Copy architecture foundation

**Status:** READY_FOR_BUILD
**Sprint:** 0 · **Owner after handoff:** Codex
**Requirement IDs:** LANG-002, LANG-003, LANG-004, LANG-005, AFR-007, AFR-008
**Audit classification:** BUILD
**Related specs:** `docs/product/LEVAV_LANGUAGE_SYSTEM.md`, `docs/product/COPY_DICTIONARY.md`

---

## Product problem

Levav must sound like one product from the landing page to the deepest authenticated workflow. It does not. Terminology has already drifted in ways that change meaning: `gig` appears 157 times against `QuickWork` 65, in a product whose PRD opens "QuickWork is not a side-gig board". `unlock` appears 121 times as a gamification verb in a product built on evidence. `Levav 28` and `Levav28` are both in use.

The structural cause is that **there is no copy module**. No `i18n`, no `copy`, no `strings`, no `messages` anywhere in `src/`. Every string is inline in a component, so there is nowhere to put an approved word, no way to review copy as a unit, and no path to additional African languages (AFR-008).

This packet builds the container. It does not rewrite the product's copy — that happens surface by surface as each feature packet lands, so that review stays tractable and no screen is rewritten twice.

## User journey

Indirect but real: a user who reads "gig" on one screen, "assignment" on the next and "task" on a third is being told the product does not know what it is. Consistent language is how a professional product earns the trust its evidence claims require.

## In scope

1. **A copy module** under `src/copy/` (or an equivalent Codex justifies) exporting a typed lookup — `t('wri.confidence.provisional.label')` or equivalent — with:
   - Namespaced keys matching `COPY_DICTIONARY.md` (`surface.element.state`).
   - `{name}` interpolation. **No sentence-fragment concatenation** — it breaks plurals and other languages.
   - Compile-time safety: an unknown key must be a TypeScript error, not a runtime fallback.
   - One locale, `en-ZM`, structured so adding a locale needs no call-site change.
2. **Seed it with the approved dictionary.** Every string in `COPY_DICTIONARY.md` §0–§9, verbatim. Verbatim means verbatim, including capitalisation and the absence of exclamation marks.
3. **Migrate three surfaces only**, as proof the architecture works end to end:
   - **Global error and empty states** (`global.*`) — highest reuse.
   - **Signup and onboarding** (`auth.*`, `onboarding.*`) — real, backed, and the first thing a user reads.
   - **WRI empty states** (`wri.confidence.none.*`) — coordinates with WP-0003, which needs these keys.
4. **A drift guard test.** Fails when a prohibited term appears in `src/` outside the copy module: `gig`, `Levav28` (as user-facing text), `SkillSpace`, and the §2.4 banned-phrase list from the Language System. Keep it narrow enough to avoid false positives on identifiers being removed in later sprints — scope it to JSX text and copy values, and document the scope.
5. **A short `docs/implementation/COPY_ARCHITECTURE.md`** (Codex-owned) recording how to add a key, how to add a locale, and the rule that new user-facing strings require a dictionary key or a `BLOCKED_PRODUCT_DECISION`.

## Out of scope

- **Rewriting existing copy across the app.** Only the three named surfaces migrate. Everything else migrates with its own feature packet.
- Adding a second locale or translating anything.
- The landing-page copy rewrite (STALE-S10) — it needs approved replacement text from Claude first.
- Pulling in an i18n library. If Codex believes one is warranted, propose it in the report with a bundle-size figure (FINDING-06 and AFR-002 make that cost real); do not add it unilaterally.
- Any product behaviour change.

## Existing behaviour to preserve

- The three migrated surfaces render identically **in meaning**. Where the dictionary changes wording, that is the intended change; list every wording difference in the report so Claude can review it as copy, not as a diff.
- Auth and onboarding flows keep working, tests included.
- Bundle size must not grow materially. Report before and after.

## Acceptance criteria

1. The copy module exists, is typed, and an unknown key fails `npm run typecheck`. Demonstrated.
2. Every string in `COPY_DICTIONARY.md` §0–§9 is present and byte-identical to the dictionary.
3. The three named surfaces resolve **all** user-facing strings through the module. No inline user-facing string remains in those files.
4. Interpolation works and is tested — at minimum `auth.verify.body` with an email and `wri.summary` with three values.
5. The drift guard fails on a deliberately added prohibited term and passes on `main`. Both demonstrated.
6. `docs/implementation/COPY_ARCHITECTURE.md` exists and covers adding a key, adding a locale, and the no-invented-copy rule.
7. Adding a locale requires no change to any call site. Demonstrate with a throwaway stub locale, not committed.
8. Typecheck, tests and build pass; the frontend baseline does not grow.

## Data requirements

None. Copy is static, in the bundle. Do not put governed copy in the database — that would move product language out of review and into runtime data.

## Privacy requirements

None. Confirm no user data reaches a copy key at build time, and that interpolated values are escaped by React's normal rendering, with no `dangerouslySetInnerHTML` introduced.

## Security considerations

- No `dangerouslySetInnerHTML` in the copy module. If a string needs markup, use a component-slot pattern, not raw HTML.
- Interpolation must not evaluate expressions from the value being interpolated.

## Analytics and event requirements

None.

## UI states

The three migrated surfaces keep every state they have today — loading, empty, error, permission — now sourced from `global.*`, `auth.*`, `onboarding.*` and `wri.confidence.none.*`. Any state that loses its copy is a defect.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | `t('does.not.exist')` | TypeScript error at compile time |
| 2 | `auth.verify.body` with `{email}` | Address interpolated correctly |
| 3 | Trigger a network error on a migrated surface | `global.error.network.*` renders |
| 4 | Complete signup and onboarding | Flow works; every string comes from the module |
| 5 | Add "gig" to a migrated component's JSX text | Drift guard fails |
| 6 | Add a stub second locale | Resolves without touching a call site |
| 7 | Migrated surfaces at 360 px | Copy does not overflow or truncate meaning |
| 8 | Bundle size before vs after | No material increase |

## Dependencies

None hard. Coordinate with **WP-0003**, which consumes `wri.confidence.none.*` — whichever lands second uses the keys the other established. Land both before Sprint 1.

## Open product decisions

1. **Locale code.** `en-ZM` is specified as the base. If Codex has a technical reason to prefer `en` with a Zambian override, propose it — this is a mechanism question, not a product one.
2. **Library vs hand-rolled.** Codex's call, subject to the bundle-size constraint above.

Neither blocks the packet.

## Report back

§42.2 format, plus a table of every string whose **wording** changed on the three migrated surfaces — old text, new key, new text. Claude reviews that table as product copy, separately from the code.

---

# Amendment A1 — Binding scope and complete approved copy

**Status: WP-0004 AMENDMENT READY_FOR_BUILD** · Issued 2026-08-12 · Authored against the actual files on `main` @ `d5134e4`

Codex correctly refused to invent governed copy. The original packet said "three surfaces" without naming files, and the dictionary lacked keys for strings those files actually contain. Both gaps are closed here. **Every string in scope now has an approved key. Codex invents nothing.**

Approved copy: **`docs/product/COPY_DICTIONARY_S17_AUTH_WELCOME.md`** (§17), plus §0, §3 and §16 of the main dictionary.

## A1.1 — The three migration groups, by exact file

**Group A — global states (2 files)**

| File | Keys |
|---|---|
| `src/pages/NotFound.tsx` | §17.9 `notfound.*` |
| `src/components/OfflineBanner.tsx` | §17.10 `global.offline.banner` |

**Group B — signup and first-run (3 files)**

| File | Keys |
|---|---|
| `src/pages/Auth.tsx` | §17.1–17.5, plus existing §1 `auth.*` |
| `src/pages/Welcome.tsx` | §17.6, plus §16 `onboarding.intentions.*` and `onboarding.situation.*` |
| `src/lib/onboardingRouting.ts` | §17.7, §17.8, §16 `intent.*` and `situation.*` |

**Group C — WRI empty states (1 file)**

| File | Keys |
|---|---|
| `src/pages/SkillGap.tsx` | §3 `wri.confidence.none.*` |

`src/pages/Onboarding.tsx` also renders the WRI empty state and is **excluded** — see A1.3.

**Total: six files.** Nothing else migrates in WP-0004.

## A1.2 — Inline strings that may remain

Explicitly permitted to stay inline, so their presence is not a defect:

- Everything in `src/pages/Onboarding.tsx`, including its WRI empty state (A1.3).
- `aria-label`, `alt` text and visually-hidden text in the six files. Accessibility strings are governed by WP-0103's accessibility pass; migrating them now doubles the work with no benefit.
- Developer-facing strings never rendered to a user: console messages, test fixtures, code comments.
- Brand marks rendered as part of a logo asset rather than as text.

Everything else user-facing in the six files must resolve through the copy module.

## A1.3 — Legacy `src/pages/Onboarding.tsx`: EXCLUDED

**Decision: excluded from WP-0004 entirely. Do not migrate a single string.**

It is 1,570 lines of identity fields, contact fields, career fields, education, skill selection, a Levav 28 questionnaire and a completion summary. **WP-0102 replaces it.** PDR-0014 changes the model it implements — from goals plus personal status to four independent axes — so the screen is not being edited, it is being rebuilt.

Authoring approved copy for a hundred-plus strings on a screen scheduled for replacement would waste the effort twice: once writing it, once deleting it. Worse, it would bake vocabulary into the dictionary that PDR-0014 has already superseded.

Its route stays live and its behaviour is untouched until WP-0102 lands.

## A1.4 — `src/lib/onboardingRouting.ts`: MIGRATE NOW, labels only

**Decision: yes, it migrates in WP-0004 — but labels only, never slugs.**

Two reasons it cannot wait. It carries live PDR-0003 violations — `'Find QuickWork™ or freelance gigs'` and `'Post a quick job or gig'` — and it carries the only user-facing vocabulary that Welcome renders, so migrating Welcome without it leaves half a screen inline.

**Strictly in scope:** replace the `label` and `desc` strings with the §16 and §17.7/17.8 keys, via the mapping tables in those sections.

**Strictly out of scope:** the `slug` values, the `GoalSlug` and `StatusSlug` types, `FIRST_DESTINATION` routing, and anything the server shares. Slugs are data; changing them is a migration and belongs to WP-0102. `onboardingRouting.test.ts` must pass **unmodified** — it enforces slug parity with `server/routes/onboarding.ts`, and that parity must not move in this packet.

The `desc` field is retired (§17.7). Render the label alone.

## A1.5 — Global error and empty-state files: exactly two

`src/pages/NotFound.tsx` and `src/components/OfflineBanner.tsx`. Nothing else.

`src/components/ProtectedRoute.tsx` was considered and **excluded** — it redirects rather than rendering user-facing copy.

## A1.6 — Replacement acceptance criteria

These supersede criteria 1–8 in the original packet.

1. The copy module exists and is typed. An unknown key is a **TypeScript error**, not a runtime fallback. Demonstrated.
2. Every key in main-dictionary §0, §3, §12, §13, §14, §15, §16 **and** §17 is present and byte-identical to the dictionary.
3. All six files in A1.1 resolve **every** user-facing string through the module, except those permitted in A1.2.
4. `grep -rn "gig" src/lib/onboardingRouting.ts` returns nothing.
5. `onboardingRouting.test.ts` passes **unmodified**. Slugs, types and routing are unchanged.
6. `src/pages/Onboarding.tsx` is **not modified**. `git diff --stat` shows no change to it.
7. Interpolation works and is tested: `auth.verify.sentto` with an email, `welcome.step` with two numbers, `notfound.path` with a path.
8. The drift guard fails on a deliberately added prohibited term and passes on `main`. Both demonstrated.
9. A stub second locale resolves with no call-site change. Demonstrated, not committed.
10. `docs/implementation/COPY_ARCHITECTURE.md` exists and covers adding a key, adding a locale, and the no-invented-copy rule.
11. Typecheck, tests and build pass. **The frontend baseline may shrink but must not grow.**
12. Bundle size not materially increased. Report before and after.
13. The implementation report lists every string whose **wording changed**, as old text → key → new text. Claude reviews that as copy, separately from the code.

## A1.7 — Expect wording to change

Most of these strings change wording, deliberately. `"Account created!"` becomes `"Your Levav ID is created. Confirm your email to continue."`; `"First name is required"` becomes `"Enter your first name."`; `"Page Not Found"` becomes `"This page does not exist"`. Exclamation marks go. Sentence case arrives.

That is the packet working, not a regression. Criterion 13 exists so Claude reviews those changes as product copy rather than as a diff.

## A1.8 — Superseded keys

Two pairs in the main dictionary are superseded by §17 and must be **removed** as part of this packet, so no key has two definitions:

- §0 `global.error.notfound.title` and `global.error.notfound.body` → replaced by §17.9 `notfound.*`
- §1 `onboarding.goals.title`, `onboarding.goals.subtitle`, `onboarding.status.title` → replaced by §16 `onboarding.intentions.*` and `onboarding.situation.*`

Claude will apply these removals to the dictionary. Codex seeds from the dictionary as it stands when the work starts; if both definitions are present, **§17 and §16 win** and Codex reports the collision rather than choosing.
