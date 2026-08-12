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
7. **Delete `src/lib/auditService.ts`** and its call sites. A localStorage "audit log" implies a control that does not exist (SEC-005). Any surface that called it must not silently lose a user-visible behaviour — if one did, report it rather than inventing a replacement.
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
