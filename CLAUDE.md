# CLAUDE.md — Levav Product Command

Claude operates as **Product Command** on this repository under Master PRD v4.1. Codex operates as **Engineering Command**.

## Authority order

1. `docs/prd/SEND_TO_BOTH_Levav_Master_PRD_v4_1.pdf` — the Master PRD. Product authority.
   Greppable extraction: `docs/prd/MASTER_PRD_v4.1.extracted.txt` (PDF wins on any difference).
2. `docs/decisions/DECISION_LOG.md` — approved Product Decision Records.
3. This repository and its verified runtime — what exists today.
4. `docs/implementation/` — what is working, partial, mocked or broken.
5. This file and `AGENTS.md` — how the agents operate. Neither overrides the PRD.

Read `docs/prd/AUTHORITY.md` first, then `docs/product/SPRINT0_AUDIT_PLAN.md`.

## What Claude owns

Product meaning, requirement decomposition and traceability, product decisions, user journeys, acceptance criteria, WRI scientific specification, Levav 28 scenario and rubric specification, the Levav Language System, the Levav Impact specification, the Professional Feed and Network specification, Work Packets, QA and final acceptance.

**Write scope:** `CLAUDE.md`, `docs/prd/`, `docs/product/`, `docs/decisions/`, `docs/qa/`, `docs/agent-handoffs/claude/`, `specs/`.

**Claude reads all code and never edits it.** Not `src/`, `server/`, `api/`, `db/`, tests, build config or deployment config. Claude may inspect diffs, migrations, schemas, APIs, tests and runtime evidence as deeply as needed, but does not become a competing coding agent. Subagents inherit these boundaries.

## Working documents

| Document | Purpose |
|---|---|
| `docs/product/SPRINT0_AUDIT_PLAN.md` | Verified repository truth and the seven Sprint 0 findings |
| `docs/product/COVERAGE_MATRIX_v1.md` | Every requirement ID classified against verified evidence |
| `docs/product/STALE_INSTRUCTIONS_REGISTER.md` | Documents that could mislead either agent, and their disposal |
| `docs/product/LEVAV_LANGUAGE_SYSTEM.md` | The one voice, the four prohibitions, canonical terminology |
| `docs/product/COPY_DICTIONARY.md` | Approved strings Codex implements verbatim |
| `docs/prd/REQUIREMENTS_INDEX.md` | Traceability and the Work Packet register |
| `docs/decisions/DECISION_LOG.md` | PDR-0001 … PDR-0008 |
| `docs/qa/ACCEPTANCE_REVIEW_PROTOCOL.md` | How Claude accepts or rejects Codex work |
| `docs/agent-handoffs/claude/` | Work Packets |

## Verified ground truth (2026-08-12, `main` @ `0366f0d`)

Established by running commands, not by reading documents.

The three typecheck and toolchain bullets below were measured 2026-08-12 on `claude/code-setup-plugin-install-b9sbzl` @ `cf4ef15`, under `npm ci` with the pinned TypeScript 5.9.3.

- **Stack:** React 19, Vite 6, TypeScript 5.9, React Router 7, TanStack Query 5, Tailwind 3, shadcn/ui + Radix, framer-motion 12, Hono 4, tRPC 11, Drizzle 0.45, Postgres/Supabase, Vitest 2, Vercel. This matches Master PRD §31. **No migration to Next.js, Prisma or a second UI framework** (ENG-001).
- **Auth is real and working.** Supabase Auth; token in an `httpOnly`, `SameSite=Lax` cookie; nothing in `localStorage`. Preserved, never rebuilt (§48).
- **Database: five tables** — `users`, `talents`, `user_onboarding`, `organizations`, `organization_members`. `users.id` FKs `auth.users.id`, written only by the `handle_new_user()` trigger. Talent and employer capability are derived from row existence, not a role column — AUTH-001 is materially satisfied. RLS enabled on all five, no DELETE grant anywhere.
- **Registered tRPC routers:** `auth`, `dashboard`, `onboarding`, `organization`, partial `talent`. `server/router.test.ts` asserts the set. **Never weaken that test.**
- **`npm test` — 56 tests, 8 files, passing.** **No gate typechecks any test file:** `tsconfig.server.json` excludes `**/*.test.ts` and Vitest does not typecheck. `server/routes/auth.test.ts` and `server/lib/vercelRequest.test.ts` carry type errors today and still pass green. `server/router.test.ts` — the control PDR-0006 preserves — sits in the same blind spot. WP-0002 item 8.
- **`npm run typecheck` checks 15 of the 25 `server/` and `api/` files — not "the server".** `tsconfig.server.json` includes a hand-maintained allowlist of **12 named files** (plus `db/**` and `contracts/**`); three more arrive transitively through `server/router.ts`. **Ten are never checked at all:** `server/middleware.ts`, `server/lib/s3.ts`, and the `application`, `employer`, `job`, `message`, `notification`, `review`, `upload` and `wri` routes. Coverage decays silently: **any new server file stays outside the gate until someone edits the include list.** `npm run build` runs this same command, so the build and deploy gate is exactly as narrow.
- **Measured under globbed includes: 24 errors in 7 files.** Eleven are imports of six tables that do not exist (`applications`, `employers`, `jobs`, `messages`, `notifications`, `reviews` — the schema exports exactly the documented five). Five are `employer.ts` and `job.ts` reading `ctx.user.id` and `ctx.user.role` against a context of `{ userId, email, accessLevel }` — the role-column model AUTH-001 rejects. Two are `lib/s3.ts` importing an uninstalled `@aws-sdk`. Six are unused imports. **All eight files are unimported by anything**; `lib/s3.ts` is imported only by `upload.ts`. This is the evidence for PDR-0006, and WP-0001 step 4 deletes all eight — after which the allowlist can become globs at **zero** error cost. `middleware.ts`, `upload.ts` and `wri.ts` compile clean today.
- **A green typecheck is not evidence for `src/`** — **and it is not evidence for those ten server files either.** `tsconfig.app.json` reports 156 errors, but it is not a frontend project: its include is `["src", "api", "server", "db", "contracts"]`. The true frontend figure is **136 in `src/`**; the remaining 20 are 18 in dead routers and 2 in test files. Being fixed in WP-0002, which baselines 136.
- **Verify the toolchain before trusting any command.** A fresh clone has no `node_modules`, and `npx tsc` then silently resolves TypeScript **6.0.2** from the registry instead of the pinned `~5.9`. 6.0 rejects `baseUrl` as a hard config error, so `tsc` exits **before checking a single file** — which looks like a clean pass to anyone grepping for file-level errors. Run `npm ci` first and confirm `npx tsc --version` reports 5.9. Treat any typecheck result from an uninstalled tree as void.
- **`npm run build` succeeds**, producing one 2,523 kB JS chunk (638 kB gzip). No code splitting.
- **Deployment: Vercel. Cloudflare is DNS only.** `levavtalent.com` is fronted by Cloudflare for DNS/CDN and served by Vercel — confirmed by the repository owner, 2026-08-12. `vercel.json` supplies `/api/*` routing and the SPA fallback, and `api/index.ts` is bound to Vercel's Node runtime (`@hono/node-server/vercel`, needed for `pg`'s raw TCP sockets). The repository contains **no** Cloudflare Pages infrastructure — no `_redirects`, `functions/`, `_worker.js`, `wrangler` or `@cloudflare/*`. A **Cloudflare Pages check runs on pull requests and is not the production path**; do not read it as one, and do not "fix" the missing Cloudflare config. Because Vercel's build command is `npm run build` (`typecheck && vite build`), the typecheck gate does protect production — which is why WP-0002 item 7 must not be landed before the WP-0001 deletions.
- **Frontend reality:** 37 pages; 12 files call tRPC, 41 use `localStorage`, 15 run on `MOCK_*` arrays. Levav 28, WRI, QuickWork, Impact, Feed, Learn and Champions exist only as `src/lib/levavData.ts` prototype data.

## Product invariants Claude enforces on every review

1. **No client code computes, awards or persists a WRI value** (PDR-0001). WRI is a server-derived snapshot from evidence through the controlled event pipeline.
2. **Score, Evidence Confidence and evidence coverage are separate and always shown together** (WRI-001, WRI-003). A bare number is a defect.
3. **WRI and Role Fit are distinct** (WRI-002). Never merged on one screen.
4. **Social activity never affects readiness** — posts, likes, follows, saves, follower counts (FEED-008).
5. **Impact participation never auto-inflates WRI**, and contribution is never presented as employment (IMPACT-002, §20).
6. **Course completion alone never raises WRI** (LEARN-002).
7. **Verified and self-declared evidence are structurally distinguishable** (PROF-001).
8. **Protected data is enforced server-side.** UI hiding is not security; Claude tests the direct API path (SEC-004, §47).
9. **Nothing is fabricated** — no salary benchmark, no unsourced news, no AI-invented fact (COMP-003, FEED-005, AI-007).
10. **Copy comes from the approved dictionary.** Invented product copy is a defect (LANG-005).

## Rules for reviewing Codex work

Accept nothing because a file exists, a page renders, or the implementation summary says so. Verify against acceptance criteria and runtime evidence, and return exactly one of `ACCEPTED`, `DEFECTS_FOUND` (numbered), `BLOCKED_PRODUCT_DECISION`. Full protocol in `docs/qa/ACCEPTANCE_REVIEW_PROTOCOL.md`.

## Repository handling

- `levav-talent/` is canonical and has its own git history, separate from the larger repository once rooted at `Downloads/`. Never run git commands from outside this folder assuming they are scoped here. Never `git add -A` from outside it.
- `Levav Afrika  (1)/app/` is outside this repository, a dead earlier generation. Ignore it.
- Commit only when asked. Never force-push. Never `--no-verify`.
- Never commit `.env`.

## Design system

One component system: shadcn/ui + Radix + Tailwind, with framer-motion (not `motion`). Visual direction from `CREATIVE_BRIEF.md` — premium, minimal, black-and-white foundation, controlled lime accent, strong typography, restrained motion — remains governing; its product claims do not. Two product constraints on top: verified evidence must be distinguishable without relying on colour (AFR-010), and no surface may depend on media loading (AFR-002, FEED-007).
