# Backend Readiness Review — 2026-07-30

This supersedes the backend-readiness claims in `docs/CURRENT_STATE.md`, `docs/ARCHITECTURE.md`,
`docs/DEPENDENCY_AUDIT.md`, and parts of `docs/SECURITY_AUDIT.md` and `docs/NEXT_MILESTONE.md`.
Those docs were written 2026-07-23 against a **prior architecture generation** — a MySQL schema
under `api/`, zero backend dependencies installed, and a backend that had genuinely never run.
Two commits since then (`bcfeb83` "establish secure backend runtime foundation" and `9d85318`
"wire real signup") rebuilt the backend on Postgres/Supabase under `server/`, made it actually
deployable, and wired real auth. This document is the current, verified ground truth as of today.
Those five docs are not rewritten here — see "What's now stale" at the bottom for what still
needs correcting in each.

## What's real and running today

- **Dependencies are genuinely installed**, not just present in source: `hono`, `@hono/node-server`,
  `@trpc/server`, `drizzle-orm`, `pg`, `jose`, `bcryptjs`, `zod`, `superjson` are all in
  `package.json`'s `dependencies` (not `devDependencies`), confirmed present in `node_modules/`.
- **It's deployed.** `api/index.ts` is a single Hono/tRPC handler (`hono/vercel`) — deliberately
  consolidated to one file because Vercel's Hobby plan caps serverless functions at 12, and the
  prior `api/` layout used ~19. `vercel.json` rewrites `/api/(.*)` → `/api/index`. In production
  this is a real serverless function talking to a real database, not a mock.
- **The database is real.** `.env` has a live `DATABASE_URL` against Supabase's pooler
  (`*.pooler.supabase.com`), not a placeholder. `db/schema.ts` currently defines **5 tables**:
  `users`, `talents`, `userOnboarding`, `organizations`, `organizationMembers` (plus 6 enums).
  Two migrations exist under `db/migrations/` and match `schema.ts` column-for-column. Local
  evidence (schema/migration parity, a live pooler URL, working end-to-end auth) is consistent
  with both being applied — see "What's now stale" below for how `docs/DECISIONS.md` undersells
  this.
- **The runtime path-alias problem documented in `docs/ARCHITECTURE.md` is resolved** for the
  code that matters: `tsup.config.ts` defines esbuild aliases for `@db`/`@api`/`@contracts`, and
  the three actually-registered route files use plain relative imports anyway.
- **Tests exist and pass.** `npx vitest run` → 5 files, 33 tests, all green — including
  `server/router.test.ts`, which asserts an explicit allowlist of exactly which procedures may
  appear on `appRouter` and fails loudly if anything else is added. That test is doing real work:
  see "Quarantine, not accident" below.

## What's registered and real vs. what's dead code

Only **3 of 10** route files in `server/routes/` are registered in `server/router.ts`:

| Route | Registered | State |
|---|---|---|
| `auth.ts` | Yes | Real — bcrypt, normalized email, `jose` JWT, proper `TRPCError` codes |
| `onboarding.ts` | Yes | Real — upserts against `userOnboarding`, zod-validated |
| `talent.ts` | Partial (3/6 procedures) | Real, includes an ownership check on `update`. `list`/`getById`/`delete` are written but not registered |
| `employer.ts` | No | Still has the `ctx.user.id` bug from `docs/SECURITY_AUDIT.md`, and references an `employers` table that **no longer exists** in `db/schema.ts` — wouldn't typecheck if wired in |
| `application.ts` | No | `updateStatus` still has no ownership/auth check; references a nonexistent `applications`/`jobs` table |
| `notification.ts` | No | `create` still lets any authed user target any arbitrary `userId`; references a nonexistent table |
| `upload.ts` | No | `getPresignedUrl` is still `publicProcedure` — unauthenticated |
| `job.ts`, `message.ts`, `review.ts` | No | Reference tables dropped from the current schema entirely — orphaned pre-migration code |
| `wri.ts` | No | Stub; `get` unconditionally returns `null` |

**Quarantine, not accident:** every bug `docs/SECURITY_AUDIT.md` flagged is still present in these
files — but they're not merely "unreachable because the backend never ran" (the old framing).
They're excluded from `appRouter` by an explicit comment in `router.ts` *and* by a test that fails
the build if that changes. That's a meaningfully safer state than the audit describes, and worth
keeping: don't register any of these seven files without fixing their underlying bug first, and
don't delete the `router.test.ts` allowlist assertion to "make it easier" to add a route.

## Feature-area matrix (what has a backend counterpart at all)

| Area | Status |
|---|---|
| Auth, Onboarding | Real backend, registered, tested |
| Talent profile (create/update/view own) | Real backend, registered |
| Employer/org verification | Written, broken, unregistered |
| Jobs, Applications, Messaging, Reviews, Notifications, Upload | Written, insecure and/or referencing dropped tables, unregistered |
| WRI | Stub only |
| QuickWork, Levav Impact, Feed, Levav 28, Learn | **Frontend-only localStorage, zero backend counterpart** — by deliberate design this session, matching the existing prototype pattern |
| Payments/Subscriptions | Not implemented anywhere |

## One undocumented security deviation from the original plan

`docs/AUTHENTICATION_ARCHITECTURE.md` specifies `httpOnly` cookie transport for the auth token.
What's actually implemented (`src/providers/trpc.tsx`, `server/context.ts`) is a Bearer token read
from `localStorage.getItem('auth_token')` — real and working, but not what was planned, and it
reintroduces the XSS-exposed-token risk the cookie plan existed to avoid. This was never logged as
a decision anywhere. Flagging it here; see "Open decision points" below.

## What's now stale in the older docs

- **`CLAUDE.md`** (last touched 2026-07-23) is wrong on: backend deps not in `package.json`
  (they are), backend running on MySQL (it's Postgres/Supabase now), path aliases unresolvable at
  runtime (resolved for registered routes), auth 100% fake (real for register/login/me), "no test
  files anywhere" (33 passing tests exist). **Corrected directly in this pass** — see the git diff
  on `CLAUDE.md` alongside this doc.
- **`docs/ARCHITECTURE.md`, `docs/CURRENT_STATE.md`, `docs/DEPENDENCY_AUDIT.md`** describe a MySQL
  schema, an `api/`-only layout, zero installed deps, and a backend that's never run — all
  describing the pre-`bcfeb83` generation. Not rewritten in this pass (each is a substantial
  document); flagged with a staleness banner pointing here instead. A full rewrite of these three
  is the natural next documentation task.
- **`docs/SECURITY_AUDIT.md`**'s four flagged bugs (`employer.ts`, `application.ts`,
  `notification.ts`, `upload.ts`) are still accurate on the bugs themselves, but its framing that
  these are dangerous *because the backend doesn't run* is outdated — they're dangerous *if
  registered*, and currently aren't. Banner added; not fully rewritten.
- **`docs/NEXT_MILESTONE.md`** checkpoint 5 ("Implementation approval — still required") is stale;
  implementation clearly happened. Banner added.
- **`docs/DECISIONS.md`** has no entries for: re-adding backend deps to `package.json`
  permanently, applying the two migrations, the `api/` → `server/` + single-Vercel-function
  consolidation, or the 2026-07-30 onboarding wiring. The decision log stops effectively at the
  planning stage even though implementation moved well past it. A new entry logging *this review*
  is added to `docs/DECISIONS.md`; backfilling the missing entries above is a smaller follow-up.

## Open decision points (need a human call before any code changes)

None of these were implemented in this pass — this is a review, not a migration. Per this repo's
own precedent (`docs/DECISIONS.md`'s "Approved... with amendments" pattern), each of the following
is a real fork that should be decided explicitly, not assumed:

1. **Cookie vs. Bearer-token auth transport.** Ship the originally-planned `httpOnly` cookie (more
   work, closes the XSS gap), or formally accept Bearer-in-localStorage as the real design and
   update `docs/AUTHENTICATION_ARCHITECTURE.md` to match reality.
2. **Which quarantined route gets fixed and registered first**, if any — `employer.ts`'s
   `ctx.user.id` bug plus its reference to a dropped `employers` table means it needs real rework,
   not a one-line fix, before it could be safely registered.
3. **Which frontend-only feature (QuickWork, Impact, Feed, Levav 28, Learn) gets a real schema and
   backend next**, and in what order — each is its own schema-design-plus-migration-plus-route
   project, same shape as the original auth/talent milestone.
4. **Documentation debt**: full rewrite of `ARCHITECTURE.md`/`CURRENT_STATE.md`/`DEPENDENCY_AUDIT.md`
   for the Postgres/Vercel generation, vs. leaving the staleness banners in place for now.
