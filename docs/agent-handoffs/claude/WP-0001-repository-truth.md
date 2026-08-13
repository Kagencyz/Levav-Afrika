# WP-0001 — Repository truth and authority reset

**Status:** READY_FOR_BUILD
**Sprint:** 0 · **Owner after handoff:** Codex
**Requirement IDs:** ENG-003, ENG-004, ENG-005, §1 (authority order), §46 Sprint 0, §50.2
**Audit classification of affected code:** MODIFY (`AGENTS.md`, stale docs) · REMOVE (dead routers, `contracts/index.ts`, localStorage audit service)
**Related decisions:** PDR-0006

---

## Product problem

Two agents are about to build against a repository whose own instruction files describe a different system. `AGENTS.md` — the first file Codex reads — states the backend is MySQL, unrunnable, dependency-less, has zero tests, and that authentication is fake. Every one of those claims is false today: the backend is Postgres/Supabase, deployed, with 56 passing tests and real Supabase Auth on httpOnly cookies.

An agent that trusts `AGENTS.md` will try to repair a working system. Rebuilding working authentication is the first entry on the Master PRD's never-do list. This packet closes that gap before any feature work starts.

Alongside it, eight unreachable tRPC routers sit in `server/routes/` looking nearly finished while referencing tables that no longer exist and carrying known authorisation defects. They are a standing invitation to a future agent to "just register one".

## User journey

None directly. This packet protects every later journey by removing the instructions that would corrupt them.

## In scope

1. **Rewrite `AGENTS.md`** to Master PRD v4.1 authority (text supplied below — apply it, do not paraphrase).
2. **Archive superseded documents.** Create `docs/archive/` and `git mv` into it, preserving history:
   `docs/CURRENT_STATE.md`, `docs/ARCHITECTURE.md`, `docs/NEXT_MILESTONE.md`, `docs/DEPENDENCY_AUDIT.md`, `docs/SECURITY_AUDIT.md`, `docs/ROADMAP.md`, `docs/PRODUCT_SYSTEM_MAP.md`, `docs/UPGRADE_BRIEF.md`, `docs/UPGRADE_GAP_REPORT.md`, `plan.md`, `SECURITY_AUDIT_REPORT.md`.
   Add `docs/archive/README.md`: "Superseded by Master PRD v4.1 and `docs/product/`. Retained for history. Do not treat any statement here as current."
3. **Correct `docs/DOMAIN_MODEL.md`'s status header** — the schema is applied, not "not yet applied"; remove `WRIScore` from the entity list (no such table, and PDR-0001 changes what it would mean).
4. **Delete the eight unreachable routers** (PDR-0006): `server/routes/employer.ts`, `job.ts`, `application.ts`, `message.ts`, `notification.ts`, `review.ts`, `upload.ts`, `wri.ts`.
5. **Keep and adapt `server/router.test.ts`.** The allowlist guard stays; update it to assert the registered set exactly, so both an unexpected registration and a silent removal fail.
6. **Delete `contracts/index.ts`** and the `@contracts` path alias if nothing else uses it.
7. **Delete `src/lib/auditService.ts`** and its call sites, and replace the Admin Audit Logs tab per **Amendment A1 below**. A localStorage "audit log" implies a control that does not exist (SEC-005).
8. **Retain `CREATIVE_BRIEF.md`** — its visual direction is still governing. Add one line at its top: "Visual direction only. Product claims in this document are superseded by Master PRD v4.1."

## Out of scope

- Any change to `src/lib/levavData.ts` WRI code — that is WP-0003.
- Any change to the typecheck or CI configuration — that is WP-0002.
- Any copy rewrite — that is WP-0004 and later.
- Any schema change, migration or new route.
- Editing anything under `docs/prd/`, `docs/product/`, `docs/decisions/`, `docs/qa/`, `docs/agent-handoffs/claude/`, `specs/` — Claude-owned (§41).

## Existing behaviour to preserve

- Supabase Auth, the httpOnly cookie session, and every registered route must behave identically after this packet.
- All 56 tests keep passing; the count may only rise.
- `npm run build` keeps succeeding, and the deployed Vercel function keeps working within the 12-function Hobby cap.
- The `app/` sibling-folder warning and the git-scope warning survive the `AGENTS.md` rewrite — both are accurate and load-bearing.

## Replacement text for `AGENTS.md`

Apply verbatim.

```markdown
# AGENTS.md

Instructions for Codex (Engineering Command) in this repository.

## Authority

1. `docs/prd/SEND_TO_BOTH_Levav_Master_PRD_v4_1.pdf` — the Master PRD. Product authority.
2. `docs/decisions/DECISION_LOG.md` — approved Product Decision Records.
3. This repository and its verified runtime — what exists today.
4. `docs/implementation/` — what is working, partial, mocked or broken.
5. This file and `CLAUDE.md` — how the agents operate. They never override the PRD.

Codex owns executable implementation. Claude owns product meaning, requirements, the Levav
Language System, acceptance and final sign-off. Codex must not edit `CLAUDE.md`,
`docs/prd/`, `docs/product/`, `docs/decisions/`, `docs/qa/`,
`docs/agent-handoffs/claude/` or `specs/`.

Work arrives as a Claude Work Packet in `docs/agent-handoffs/claude/`. Implement the
approved scope, return READY_FOR_REVIEW with evidence, fix numbered defects until Claude
marks it ACCEPTED. If a requirement is genuinely ambiguous or unsafe, return
BLOCKED_PRODUCT_DECISION with the exact decision needed — do not invent product rules,
WRI coefficients, paywall rules or evidence policy.

## Verified ground truth (2026-08-12, `main` @ 0366f0d)

- Stack: React 19, Vite 6, TypeScript 5.9, React Router 7, TanStack Query 5, Tailwind 3,
  shadcn/ui + Radix, framer-motion 12, Hono 4, tRPC 11, Drizzle 0.45, Postgres/Supabase,
  Vitest 2, Vercel. Do not migrate to Next.js, Prisma or a second UI framework (ENG-001).
- Auth is real: Supabase Auth, httpOnly `SameSite=Lax` cookie, no token in localStorage.
  Do not weaken or rebuild it.
- Database: five tables — `users`, `talents`, `user_onboarding`, `organizations`,
  `organization_members`. `users.id` FKs `auth.users.id`, written only by the
  `handle_new_user()` trigger. RLS enabled on all five; no DELETE grant anywhere.
- Registered tRPC routers: `auth`, `dashboard`, `onboarding`, `organization`, and a partial
  `talent`. `server/router.test.ts` asserts this set exactly — do not weaken that test.
- `npm test` — 56 tests, 8 files, passing.
- `npm run typecheck`, `npm run build` — see `package.json`; the gate covers both the server
  and app projects with a committed frontend error baseline that may only shrink.
- Deployed as a single Vercel serverless function (`api/index.ts`) to stay under the
  Hobby-plan 12-function cap.

## Rules

1. Never describe a page, component or system as working because a file exists or a page
   renders. Verify by reading the data source and running the code.
2. Never weaken authentication or authorisation to make a feature work. Protected data is
   enforced server-side; UI hiding is not security.
3. No client code computes, awards or persists a WRI value (PDR-0001). WRI is a server-side
   snapshot derived from evidence through the controlled event pipeline.
4. Social activity — posts, likes, follows, saves — never affects WRI, Role Fit or employer
   ranking (FEED-008). Impact participation never auto-inflates WRI (IMPACT-002).
5. One UI system: shadcn/ui, Radix, Tailwind, framer-motion, TanStack Query. Do not add a
   second UI, animation or state library.
6. User-facing copy comes from the copy module and `docs/product/COPY_DICTIONARY.md`. Do not
   invent or casually rewrite product copy inside components (LANG-005).
7. New business logic — auth, permissions, evidence, WRI, matching, transitions, payments —
   ships with tests, including negative security tests.
8. `Levav Afrika  (1)/app/` sits outside this repository and is a dead earlier generation.
   Ignore it. `levav-talent/` is canonical.
9. This repository has its own git history, separate from the larger repository once rooted
   at `Downloads/`. Never run git commands from outside this folder assuming they are scoped
   here. Never `git add -A` from outside `levav-talent/`. Commit only when asked. Never
   force-push. Never `--no-verify`.
10. Keep `docs/implementation/IMPLEMENTATION_STATE.md` factually current after accepted work.
```

## Acceptance criteria

1. `AGENTS.md` contains the text above and no remaining reference to MySQL, "fake auth", "zero tests", "no typecheck script", or `api/routes/`.
2. Every file listed in §2 is under `docs/archive/` with git history preserved (`git log --follow` resolves), and `docs/archive/README.md` exists with the stated warning.
3. No file outside `docs/archive/` instructs a reader to treat an archived document as current.
4. The eight named router files no longer exist. `grep -r "employers\b" server/` returns no reference to the dropped table.
5. `server/router.test.ts` asserts the exact registered set and fails on both addition and removal. Demonstrate by showing the test failing on a deliberate local change, then reverted.
6. `contracts/index.ts` and `src/lib/auditService.ts` no longer exist, and nothing imports them.
7. `npm test` passes with **≥56** tests. `npm run build` succeeds.
8. Auth still works end to end: register, confirm, sign in, `me`, sign out — evidenced by test output or a manual run log.
9. `docs/DOMAIN_MODEL.md` no longer claims the schema is unapplied and no longer lists `WRIScore`.

## Data requirements

None. No schema change, no migration, no data movement.

## Privacy requirements

Deleting `src/lib/auditService.ts` removes localStorage-held records. Confirm the keys it wrote are also cleared or left orphaned harmlessly, and state which in the report. No user data is transmitted anywhere by this packet.

## Security considerations

- The router allowlist test is a security control. It is strengthened here, never weakened.
- Deleting `upload.ts` removes an unauthorised presigned-URL endpoint from the codebase. Confirm nothing in `src/` still points at an upload route.
- No change to auth, session handling, cookie flags, RLS policies or grants.

## Analytics and event requirements

None.

## UI states

None — this packet must produce no visible user-facing change. Any UI difference is a defect. If deleting `auditService.ts` would change a visible behaviour, stop and report it.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Register, confirm, sign in, read `me`, sign out | Unchanged from before the packet |
| 2 | Add a router to `appRouter` locally | `server/router.test.ts` fails |
| 3 | Remove a registered router locally | `server/router.test.ts` fails |
| 4 | `grep -rn "@contracts\|auditService" src server api` | No results |
| 5 | `npm run build` | Succeeds; bundle size not materially changed |
| 6 | Full app smoke on mobile viewport | No visual or behavioural change |

## Dependencies

None. This packet blocks WP-0002 and every later packet.

## Open product decisions

None. Everything here is settled by PDR-0006 and the Master PRD authority order.

## Report back

Use the §42.2 format: packet ID, audit classification, implementation summary, files changed, migrations (none expected), API changes, tests added or changed, commands run with results, security and permission checks, performance notes, known limitations, and status.

---

# Amendment A1 — Audit service disposition

**Raised by:** Codex, `BLOCKED_PRODUCT_DECISION` on WP-0001, 2026-08-12
**Resolved by:** Claude. **Decision recorded as:** PDR-0009
**Packet status:** returns to **READY_FOR_BUILD**. Codex was correct to stop.

## What Codex reported, verified

Confirmed accurate: `src/components/admin/AuditSection.tsx` imports `getAuditLog`, `getAuditStats`, `AuditEntry` and `AuditStatus`; `src/pages/Admin.tsx:1226` registers the `Audit Logs` tab and renders the component at line 1323; `logWithCurrentUser` is imported by `src/pages/Auth.tsx:8`, `src/hooks/useAuth.ts:3` and `src/pages/Onboarding.tsx:6`.

## Two facts that change the disposition

**A1.1 — The audit log is already inert at runtime.** `logWithCurrentUser` (`auditService.ts:127`) resolves the actor from `localStorage.getItem('user')`. **Nothing in `src/` writes that key.** It was removed when the session moved to an httpOnly cookie, which `useAuth.ts` itself documents. Every call therefore returns `null` at line 129 without writing an entry.

Consequence: deleting the module breaks a **compile-time** import, not a live behaviour. The Admin Audit Logs tab already displays an empty log for every admin, on every device, and has since the auth migration. There is no working feature here to preserve — only the appearance of one.

**A1.2 — The record shape is partly fabricated.** `auditService.ts:55` hard-codes `ipAddress: 'client-side'` with the comment "Would be server IP in production". Any entry written before the auth migration carries a fabricated IP field. An audit trail with an invented provenance column is worse than no audit trail: it is a record that cannot be relied on but looks as though it can.

## Disposition — Option 2, with a binding constraint on the copy

**Retain the Audit Logs tab. Replace its contents with an explicit statement that Levav is not recording an audit trail.**

Option 1 (remove the tab) was rejected: silently dropping a security surface from an admin console leaves an administrator with no signal, and SEC-005 is a real requirement scheduled for Sprint 10. The tab should mark the gap, not hide it.

Option 2 is only safe under one condition, which is the reason this needed a product decision rather than an engineering one:

> The empty state must state that audit logging **is not in place**. It must never read as "no entries found", "no activity yet", "0 events" or any equivalent.

"No entries" tells an administrator that nothing happened. For a security control, silence reads as assurance, and that false assurance is exactly the defect being removed. The copy must affirmatively deny the control's existence.

### Exact file dispositions

| File | Disposition |
|---|---|
| `src/lib/auditService.ts` | **Delete.** |
| `src/components/admin/AuditSection.tsx` | **Rewrite** as a static unavailable state. No import from `auditService`. No stats cards, no filters, no search, no table, no columns, no date pickers, no export control. |
| `src/pages/Admin.tsx` | **Keep** the tab registration at line 1226 and the render at line 1323 unchanged. |
| `src/pages/Auth.tsx:8` | Remove the import and both `logWithCurrentUser` calls (register, login). |
| `src/hooks/useAuth.ts:3` | Remove the import and the `logout` call at the top of the `logout` callback. Everything else in that callback — the `auth.logout` mutation and the prototype-state cleanup — is unchanged. |
| `src/pages/Onboarding.tsx:6` | Remove the import and the onboarding-completion call. |

Removing the three call sites is behaviour-neutral, because all three already return `null` (A1.1). Confirm this in the report rather than assuming it.

### Approved copy

Added to `docs/product/COPY_DICTIONARY.md` §11. Use these keys; do not paraphrase.

| Key | Value |
|---|---|
| `admin.audit.unavailable.title` | Levav is not recording an audit trail yet |
| `admin.audit.unavailable.body` | Audit logging is not in place. No record is being kept of sign-ins, privileged actions or protected-data access, and none exists for any earlier period. Treat the absence of records here as "not measured", never as "nothing happened". |
| `admin.audit.unavailable.planned` | Server-side audit logging is specified in the Master PRD (SEC-005) and is scheduled for production hardening. |

If WP-0004 has not yet landed the copy module when Codex reaches this, inline the strings **exactly as written** and add a `TODO(WP-0004)` comment naming the three keys. Do not reword them to fit the layout.

## A1.3 — `levav_audit_log` must be actively cleared

**Answer: clear it once on application load. It may not remain as orphaned local data.**

The key holds `userId` and `userEmail` for up to 500 entries. That is personal data, sitting in browser storage, with no purpose, no retention rule and no lawful basis once the feature is gone (SEC-010, PRIV-001). "Harmless orphaned data" is not a privacy position — orphaned personal data with no owner and no expiry is precisely what those requirements exist to prevent. It is also unreachable by any Levav deletion or export request, since no server knows it exists.

Implementation constraint: **one cleanup path, not two.** WP-0003 clears `wriScore` on load. Do not build a second, competing cleanup. Whichever packet lands first creates a single module — suggested `src/lib/retiredLocalState.ts` — that clears a named list of retired keys once per load, with a comment naming the packets that added each key and the condition for removing the module. The second packet adds its key to that list.

Removal condition for the module: once no supported client can still be carrying the retired keys. Not a date — a decision, recorded when it is taken.

## Additional acceptance criteria for A1

10. `grep -rn "auditService\|logWithCurrentUser\|getAuditLog\|getAuditStats" src` returns no results.
11. The Admin Audit Logs tab still exists and is reachable, and renders the three approved strings and nothing else.
12. The tab contains no number, no count, no zero, no empty table, no filter control and no fabricated column.
13. Register, sign in, complete onboarding and sign out all behave exactly as before. Confirm in the report that all three removed calls were already returning `null`.
14. `levav_audit_log` is cleared on load through a single retired-key cleanup module, and that module carries the comment described in A1.3.
15. No new `localStorage` key is introduced by this change.

## Additional test scenarios for A1

| # | Scenario | Expected |
|---|---|---|
| 7 | Admin opens Audit Logs | Three approved strings; no table, no counts, no controls |
| 8 | Seed `levav_audit_log` with entries, reload | Key cleared; tab still shows the unavailable state; no error |
| 9 | Register, sign in, complete onboarding, sign out | Unchanged behaviour end to end |
| 10 | Audit tab at 360 px | Copy legible, not truncated |
| 11 | `grep` for the removed symbols | No results |

## Noted, deliberately out of scope

`src/components/SmartMatchWidget.tsx:260` and `src/pages/Projects.tsx:90` also read `localStorage.getItem('user')` — the same key nothing writes. Both are therefore dead paths reading a permanently absent value, and both may contain unreachable branches or silent failures. **Do not fix them in this packet.** Claude has recorded them; they are dispositioned when those surfaces are rebuilt. Report anything further you notice about them without acting.

---

# Amendment A2 (2026-08-13) — the router allowlist test must guard reachability, not names

**Raised by:** FINDING-09, `docs/product/GROUND_TRUTH_AUDIT_2026-08-13.md` · **Authority:** PDR-0006 Amendment A1

In-scope item 5 requires the allowlist guard to "assert the registered set exactly, so both an unexpected registration and a silent removal fail". That is necessary and remains required. It is not sufficient.

The assertion compares `Object.keys(appRouter._def.procedures)` against a hand-maintained allowlist — **procedure names only**. Two changes alter the reachable surface while leaving the test green:

1. **Aliasing.** `_def.procedures` is keyed by the object key as written, never by the procedure's origin. `talent: router({ list: someOtherRouter.listAll })` yields the allowlisted key `talent.list` and passes. `server/router.ts` already uses this idiom three times, so it reads as house style, not as a bypass.
2. **Lazy registration.** Lazily-registered entries land in `_def.lazy`, never enter `_def.procedures`, and still resolve at call time — reachable over HTTP, invisible to the assertion.

## Additional scope for A2

16. **Strengthen `server/router.test.ts` so it fails when the reachable procedure set changes**, not merely when the registered name set changes. It must detect (a) any lazily-registered procedure, and (b) a procedure whose implementation originates outside the allowed route modules, including when registered under an allowlisted name. **The mechanism is yours to choose** — asserting `_def.lazy` is empty and constraining `server/router.ts`'s import surface is one workable combination, but any approach that provably closes both gaps is acceptable. Explain the approach in the report.

This does not license weakening anything. The existing exact-set assertion stays; A2 adds to it.

## Additional acceptance criteria for A2

16. A deliberate lazily-registered router fails the test. Show the failure, then revert.
17. A deliberate alias registering a non-route-module procedure under an allowlisted name fails the test. Show the failure, then revert.
18. The existing addition and removal scenarios (criterion 5, scenarios 2 and 3) still fail as before — A2 must not regress them.
19. The report states the chosen mechanism and what it does **not** cover.

## Additional test scenarios for A2

| # | Scenario | Expected |
|---|---|---|
| 12 | Register a router lazily via `lazy(() => import(...))` | `server/router.test.ts` fails |
| 13 | Alias a procedure from a non-route module under an existing allowlisted key | `server/router.test.ts` fails |
| 14 | Normal registered set, unchanged | Passes |

## Explicitly not in scope for A2

**Authorisation coverage.** The test ignores procedure type and middleware chain, so downgrading `authedProcedure` to `publicProcedure` passes. That is a real property of the test and it is recorded, but PDR-0006 scoped this control to the registration surface and never claimed otherwise. Do not extend the test to assert authorisation in this packet, and do not treat its absence as a defect here — entitlement checking belongs with the Evidence Graph and entitlement work, not with a name-set guard.
