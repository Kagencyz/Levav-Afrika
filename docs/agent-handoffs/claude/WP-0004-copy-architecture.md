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
