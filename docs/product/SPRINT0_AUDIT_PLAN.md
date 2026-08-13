# Sprint 0 — Audit Plan and Verified Repository Truth

**Status:** Complete for the Claude side. Codex side is issued as WP-0001 … WP-0004.
**Date of verification:** 2026-08-12
**Verified against:** `levav-talent/` @ `main` = `0366f0d` (working tree clean apart from untracked `.tools/`)

---

> ## Corrections from the 2026-08-13 re-measurement
>
> This document remains the Sprint 0 record and its figures are **not** rewritten — a dated audit that silently changes its numbers is no longer evidence of anything. The corrections below were measured under `npm ci` with the pinned TypeScript 5.9.3 and are recorded in `GROUND_TRUTH_AUDIT_2026-08-13.md`. **Where they disagree with the text beneath, the corrections win.**
>
> - **C-1 — "server only" is too generous.** `tsconfig.server.json` includes a hand-maintained allowlist of 12 named files, so `npm run typecheck` covers **15 of the 25 files** in `server/` and `api/`. Ten are never checked. Coverage decays silently: any new server file sits outside the gate until someone edits the include list. Closed by WP-0002 item 7.
> - **C-2 — the frontend figure is 136, not 156.** `tsconfig.app.json` is not a frontend project; its include is `["src", "api", "server", "db", "contracts"]`, so it re-checks the whole server on looser settings with tests included. The 156 is **136 in `src/`**, 18 in dead routers WP-0001 deletes, and 2 in test files. The frontend baseline WP-0002 commits is 136.
> - **C-3 — no gate typechecks any test file.** `tsconfig.server.json` excludes `**/*.test.ts` and Vitest does not typecheck. `server/routes/auth.test.ts` and `server/lib/vercelRequest.test.ts` carry type errors while passing green, and `server/router.test.ts` — the control PDR-0006 preserves — sits in the same blind spot. Closed by WP-0002 item 8.
> - **C-4 — the tRPC caller count depends on its definition.** §4's "12 files call tRPC" holds only as *files referencing the client*. Ten actually invoke a procedure, and **eight invoke one that is registered**; three call sites target unregistered routers. Of those three, only `NotificationBell` is mounted — see FINDING-10.
> - **C-5 — never measure in an uninstalled tree.** A fresh clone has no `node_modules`, so `npx tsc` resolves TypeScript **6.0.2** instead of the pinned `~5.9`, rejects `baseUrl` as a config error, and exits **before checking a single file** — indistinguishable from a clean pass if you only look for file-level errors. The row above using bare `npx tsc` is exactly the invocation that fails this way. Run `npm ci` first and confirm `npx tsc --version` reports 5.9.
> - **C-6 — `db/migrations/` is not the schema of record.** It describes a history that has never been applied. Production was built by a Supabase history that is almost entirely absent from this repository. See FINDING-08 and PDR-0014.

## 1. How this audit was conducted

Nothing in this document is taken from a repository document. Every claim below was produced by running commands or reading source. Where an existing document disagrees, the document is listed in `STALE_INSTRUCTIONS_REGISTER.md`, not repeated here.

Commands run and results:

| Command | Result |
|---|---|
| `git log --oneline -1` | `0366f0d Merge pull request #13 … employer-email-confirmation` |
| `npm run typecheck` | **Exit 0.** Runs `tsc -p tsconfig.server.json --noEmit` — **server only** ⚠️ see correction C-1 |
| `npx tsc --noEmit -p tsconfig.app.json` | **156 errors.** The frontend is not covered by any gate ⚠️ see correction C-2 |
| `npm test` | **56 tests, 8 files, all passing** (7.4s) |
| `npm run build` | **Succeeds** in 2m55s. Output: single `index-*.js` at **2,523.74 kB** (638 kB gzip) |

## 2. Verified stack (matches Master PRD §31 — no migration required)

React 19 · Vite 6 · TypeScript 5.9 · React Router 7 · TanStack Query 5 · Tailwind 3 · shadcn/ui + Radix · framer-motion 12 · Hono 4 · tRPC 11 · Drizzle ORM 0.45 · Postgres/Supabase · Vitest 2 · Vercel.

**Classification: KEEP.** ENG-001 is satisfied. No agent may propose Next.js, Prisma or a second UI framework.

## 3. Verified backend reality

**Database — 5 tables** (`db/schema.ts`): `users`, `talents`, `user_onboarding`, `organizations`, `organization_members`. Six Drizzle migrations plus one Supabase auth-reconciliation migration.

Identity architecture is **materially correct against AUTH-001**: `users.id` is a FK to `auth.users.id`, populated only by the `handle_new_user()` trigger. "Is a talent" is derived from a `talents` row; "is on an org team" from an `organization_members` row. `users.access_level` is platform access only. There is no role column to drift, and no duplicate-identity pathway. RLS is enabled on every table with `auth.uid()`-scoped policies for the authenticated role and deliberately permissive service-path policies for `levav_app`, with tRPC as the load-bearing authorisation boundary and **no DELETE grant anywhere**.

**tRPC routers registered** (`server/router.ts`): `auth`, `dashboard`, `onboarding`, `organization`, and a partial `talent` (`createOwnProfile`, `updateOwnProfile`, `getOwnProfile`, `list`, `getById`).

**tRPC routers written but deliberately unreachable:** `employer`, `job`, `application`, `message`, `notification`, `review`, `upload`, `wri`. `server/router.test.ts` is an allowlist guard that fails if any is registered. Several reference tables that no longer exist; `employer.ts` uses `ctx.user.id` where the context supplies `ctx.user.userId`. **This guard is correct and must not be weakened** — see WP-0001 for the disposal decision.

**Auth:** real Supabase Auth. Token is an `httpOnly`, `SameSite=Lax` cookie. No auth token or session flag in `localStorage`. **Classification: KEEP.**

## 4. Verified frontend reality

37 pages under `src/pages/`. **12 files call tRPC. 41 files read or write `localStorage`. 15 files run on hardcoded `MOCK_*` arrays.**

The product surfaces named in the Master PRD as protected core systems — Levav 28, WRI, QuickWork, Impact, Feed, Learn, Champions — exist **only** as `src/lib/levavData.ts` (67 KB of seed constants plus localStorage mutators) and `src/lib/wriService.ts`. There is no server, no schema, no evidence record and no audit trail behind any of them.

## 5. Findings that change product direction

### FINDING-01 — The shipped WRI is a client-side gamification engine that violates the never-do list (CRITICAL)

`src/lib/levavData.ts` exports `awardWriPoints(achievementKey)`, which mutates a `localStorage` score and is called directly from UI actions. `WRI_SCORING_RULES` contains, verbatim:

- `'feed-first-post': { dimension: 'communication', points: 10 }` — **posting to the feed raises WRI.** Direct breach of FEED-008 and Master PRD §48 ("Treat social engagement as readiness").
- `'quickwork-applied': { dimension: 'reliability', points: 5 }` — **applying** to work, not completing it, raises WRI.
- `'impact-volunteer': { dimension: 'leadership', points: 15 }` — **Impact participation automatically inflates WRI.** Direct breach of IMPACT-002.

It also breaches: WRI-001 (no confidence, coverage or trajectory), WRI-003 (score and confidence are the same number), WRI-004 (coefficients hard-coded, unversioned), EVD-001 (no provenance), and §48 ("Let UI requests directly mutate WRI scores").

The dimension set is wrong on its own terms: the code has six — `technical, communication, reliability, leadership, creativity, growth` — against the PRD's ten. `technical` and `creativity` are not PRD dimensions at all; `Critical Thinking`, `Problem Solving`, `Initiative and Ownership`, `Adaptability and Learning Agility`, `Professional Discipline` and `Contribution and Service Orientation` are absent.

**Classification: REMOVE**, not MODIFY. See PDR-0001 and PDR-0002. Issued as **WP-0003**.

### FINDING-02 — Levav 28 in code is a different product

`LEVAV28_DAYS` is a 33-entry motivational programme with phases named `CONFRONT`, per-day inspirational quotes, and tasks of type `reflection` / `external` (e.g. "Share one gap with the community", "Write your 'before' statement"). The Master PRD §13 specifies a personalised adaptive **work simulation** with persistent personas, multiple modalities, rubric-based evaluation, and a Day-15 evidence-sufficiency gate.

These are not the same product, and the existing content is not a migration source. **Classification: REMOVE (content) + BUILD (engine).** See PDR-0004. Not a Sprint 0 packet — Sprint 4.

### FINDING-03 — The typecheck gate is misleading

`npm run typecheck` passes while the frontend carries 156 real TypeScript errors, because the script points only at `tsconfig.server.json`. `npm run build` inherits the same blind spot. Any agent that runs the documented gate will conclude the repository is type-clean. **Classification: MODIFY.** Issued as **WP-0002**.

**Corrected 2026-08-13 (C-1, C-2, C-3):** the finding is right and is worse than stated. The gate is not merely "server only" — it covers 15 of 25 server files via a hand-maintained allowlist, and decays silently as files are added. The frontend figure is 136, not 156. And no gate typechecks any test file, including the router allowlist control. WP-0002 items 7 and 8 close the additional gaps.

### FINDING-04 — "Gig" is the dominant QuickWork vocabulary in code

`gig` appears 157 times across `src/` against 65 for `QuickWork`. The domain type is `QuickWorkGig`; the functions are `applyToGig`, `getMyGigs`, `postGig`, `updateGigStatus`. Master PRD §14 opens "QuickWork is not a side-gig board" and §48 forbids turning it into one. Vocabulary this dominant becomes the data model. **Classification: MODIFY.** See PDR-0003; enforced through the Language System and applied as each QuickWork packet lands.

### FINDING-05 — No copy architecture exists (LANG-004 unmet)

There is no `i18n`, `copy`, `strings` or `messages` module anywhere in `src/`. Every user-facing string is inline in a component. "Unlock" appears 121 times as a gamification verb. There is nothing for Codex to implement the Language System *into*. **Classification: BUILD.** Issued as **WP-0004**.

### FINDING-06 — A 2.5 MB single bundle contradicts the Africa-first requirements

One 2,523 kB JS chunk (638 kB gzip), no route-level code splitting, with `three` and `framer-motion` in the main graph. AFR-001/AFR-002 and FEED-007 are product requirements, not polish. **Classification: MODIFY**, scheduled to Sprint 10 (§46) unless a Feed packet lands sooner — the Feed cannot ship onto this bundle.

### FINDING-07 — Eight unreachable routers are a standing hazard

They read as "nearly done" and carry known authorisation defects (`application.updateStatus`, `notification.create`, `upload.getPresignedUrl` have missing or insufficient checks). Keeping broken code that references dropped tables invites a future agent to "just register it". **Classification: REMOVE.** Issued as **WP-0001**.

## 6. Sprint 0 exit gate (Master PRD §46)

| Gate | Status |
|---|---|
| Both agents agree on current implementation truth | **Pending** — requires WP-0001 accepted |
| No stale document can override the Master PRD | **Pending** — requires WP-0001 accepted |
| Auth remains working | **Met** — verified, and preserved by every Sprint 0 packet |
| Typecheck, tests and build have known verified states | **Met for measurement** (§1 above); **pending for enforcement** — WP-0002 |

## 7. Sprint 0 work packet sequence

| ID | Title | Blocks |
|---|---|---|
| WP-0001 | Repository truth and authority reset | Everything |
| WP-0002 | Real verification gates and CI | Every later acceptance |
| WP-0003 | Remove the client-side WRI scoring engine | Sprint 2, Sprint 3 |
| WP-0004 | Copy architecture foundation | Every feature packet with UI copy |

WP-0001 and WP-0003 may proceed in parallel (disjoint files). WP-0002 depends on WP-0001. WP-0004 depends on nothing but should land before Sprint 1.
