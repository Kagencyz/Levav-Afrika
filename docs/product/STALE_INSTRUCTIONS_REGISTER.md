# Stale Instructions Register

**Owner:** Claude (Product Command). Verified 2026-08-12 against `main` @ `0366f0d`.

Master PRD §50.1(3) requires Claude to identify documentation that could mislead either agent. Each entry below states the false claim, the verified truth, and the disposal. **Severity** is the risk that an agent acts wrongly on it.

Claude cannot edit Codex-owned files. Every disposal in a Codex-owned file is issued through **WP-0001**.

> **Correction, 2026-08-13.** This register is itself subject to the rule it enforces, and three of its own figures were re-measured under `npm ci` with the pinned TypeScript 5.9.3 (`GROUND_TRUTH_AUDIT_2026-08-13.md`). Where these disagree with the rows below, these win.
>
> - **The `tsconfig.app.json` figure of 156 is not a frontend figure.** That project includes `["src", "api", "server", "db", "contracts"]`. The frontend count is **136 in `src/`**; the remaining 20 are 18 in dead routers and 2 in test files. The row calling 156 "the only claim still roughly true" is therefore true of the wrong quantity.
> - **"Server only" understates the gap.** `tsconfig.server.json` uses a hand-maintained allowlist of 12 named files and checks 15 of the 25 files in `server/` and `api/`. Ten are never checked, and coverage decays silently as files are added.
> - **A new entry belongs in this register: `db/migrations/`.** Six Drizzle migrations that have never been applied to any database, read across the documentation as the schema of record. Production was built by a Supabase history almost entirely absent from this repository. **SEVERITY: CRITICAL** — `npm run db:migrate` against production would attempt all six against a database that already holds those objects. Disposal is PDR-0014 and WP-0005; see FINDING-08.

---

## S-01 — `AGENTS.md` describes an architecture that no longer exists (SEVERITY: CRITICAL)

`AGENTS.md` is the file Codex reads first. It currently states:

| Claim in `AGENTS.md` | Verified truth |
|---|---|
| "Hono + tRPC + Drizzle + **MySQL**" | Postgres/Supabase |
| backend "is **not runnable** as committed"; deps "absent from `package.json`" | Backend is deployed and running; deps are declared and installed |
| "`api/routes/employer.ts` imports via `@db/*`… fails immediately" | Routes live in `server/routes/`; `api/` contains one file, `api/index.ts` |
| "no `lint` or `typecheck` npm script and **no test suite**" | `typecheck` and `test` scripts exist; **56 tests pass** |
| "`npm run build` performs **no type checking**" | `build` = `npm run typecheck && vite build` |
| "`npx tsc -p tsconfig.app.json` reports **~150** errors" | 156 — the only claim still roughly true |
| "The current **fake auth** is a known limitation" | Auth is real Supabase Auth with httpOnly cookies |
| "If you add backend logic, add tests. There are currently **zero**." | 56 |

**Risk:** an agent trusting this will attempt to "fix" a working Postgres backend, reinstall dependencies it already has, or treat real auth as fake and rebuild it — the single most-prohibited action in §48.
**Disposal:** rewritten by Codex under **WP-0001** to point at Master PRD v4.1 authority. Claude supplies the replacement text in that packet.

## S-02 — `CLAUDE.md` carries a superseded role and stale counts (SEVERITY: HIGH)

Claude-owned; **corrected in this same Sprint 0 change**.

| Claim | Truth |
|---|---|
| "33 tests" | 56 |
| "typecheck (no npm script defined yet)" | `npm run typecheck` exists |
| "`npm run build` … does NOT type-check" | It does — server only (see S-07) |
| "backend … `api/boot.ts`" in places | `server/boot.ts` |
| Product purpose lists **SkillSpace** as a core concept | §7.2 defers SkillSpace as a separate surface |
| No mention of Master PRD v4.1, the dual-agent split, or write ownership | The governing model since v4.1 |

The genuinely accurate parts — the unregistered-router allowlist, the httpOnly-cookie rule, the "don't trust that it renders" rule, the git-scope warning — are **preserved**, not discarded.

## S-03 — Five `docs/` files are self-declared stale but still in the required reading order (SEVERITY: HIGH)

`CURRENT_STATE.md`, `ARCHITECTURE.md`, `NEXT_MILESTONE.md`, `DEPENDENCY_AUDIT.md`, `SECURITY_AUDIT.md` each open with a "⚠️ STALE" banner and describe the pre-`bcfeb83` MySQL generation — yet `CLAUDE.md`'s reading order still lists them as items 2, 3, 5, 6.

A banner is not a disposal. An agent reading item 2 of a numbered reading list absorbs the content.
**Disposal:** moved to `docs/archive/` by Codex under WP-0001, retaining git history. `BACKEND_READINESS_REVIEW.md` (2026-07-30, accurate) stays, superseded on scope by `docs/product/SPRINT0_AUDIT_PLAN.md`.

## S-04 — `docs/ROADMAP.md` and `docs/NEXT_MILESTONE.md` conflict with the Master PRD build sequence (SEVERITY: HIGH)

They define their own phase ordering. Master PRD §46 defines Sprint 0 → Sprint 10 and is authority level 1; a repository roadmap is not. Two competing sequences means two agents can each cite a document and be "right".
**Disposal:** archived. `docs/product/SPRINT0_AUDIT_PLAN.md` plus the Work Packet queue is the only live sequence.

## S-05 — `docs/PRODUCT_SYSTEM_MAP.md` maps to paths that no longer exist (SEVERITY: MEDIUM)

Header claims verification "by reading `db/schema.ts`, `api/routes/*.ts`". `api/routes/` does not exist. The concept→reality intent is sound and worth keeping; the evidence base is stale.
**Disposal:** superseded by `docs/product/COVERAGE_MATRIX_v1.md`, which is requirement-ID-indexed and re-verified. Archive the old map.

## S-06 — `docs/DOMAIN_MODEL.md` describes entities as "not yet applied" that are applied (SEVERITY: MEDIUM)

States the schema is "amended and migration-generated (not yet applied)". Six migrations are applied and the tables are live. It also lists `WRIScore` as an entity "left unchanged from today's schema" — there is no WRI table.
**Disposal:** Codex corrects the status header under WP-0001; the entity definitions themselves survive.

## S-07 — The `typecheck` script is itself a stale instruction (SEVERITY: HIGH)

Not prose — an executable claim. `npm run typecheck` targets `tsconfig.server.json` only and exits 0 while `tsconfig.app.json` reports 156 errors. Every agent, CI job and Definition-of-Done check that runs the documented gate receives a false pass.
**Disposal:** **WP-0002.**

## S-08 — `CREATIVE_BRIEF.md`, `README.md`, `plan.md`, `SECURITY_AUDIT_REPORT.md`, `docs/UPGRADE_BRIEF.md`, `docs/UPGRADE_GAP_REPORT.md` predate the Master PRD (SEVERITY: MEDIUM)

They describe a pre-v4.1 product with different scope and different language. `CREATIVE_BRIEF.md`'s visual direction (black/white foundation, controlled lime accent, restrained motion) is still useful and is **retained** as the visual reference underneath the Language System; its product claims are not.
**Disposal:** archive all except the retained visual direction, which the Language System now cites.

## S-09 — The sibling `app/` folder outside this repository (SEVERITY: MEDIUM)

`Levav Afrika  (1)/app/` is an earlier generation, outside this git repository, and is not canonical. Both `CLAUDE.md` and `AGENTS.md` already warn about it — that warning is accurate and is **preserved verbatim** in the v4.1 rewrite.

## S-10 — Marketing copy on the landing page makes claims the product cannot support (SEVERITY: MEDIUM — product, not documentation)

Live strings include "Every talent activated. Every capability developed." and a "six-step transformation pathway that turns raw talent into workforce-ready capability." Levav currently has no readiness measurement of any kind. LANG-001 forbids exaggerated promises; §48 forbids overclaiming.
**Disposal:** governed by `LEVAV_LANGUAGE_SYSTEM.md` and rewritten through the Language work packets, not Sprint 0.

---

## Standing rule for both agents

> A document is evidence of intent, never evidence of behaviour. When a document and the running code disagree, the code is what exists and the Master PRD is what should exist. Neither is the document.
