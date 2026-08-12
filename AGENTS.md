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
