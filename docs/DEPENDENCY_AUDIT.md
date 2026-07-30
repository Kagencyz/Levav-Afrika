# Dependency Audit

> **⚠️ STALE on backend claims (as of 2026-07-30).** If this document says backend dependencies
> (`hono`, `@trpc/server`, `drizzle-orm`, `jose`, `bcryptjs`, etc.) are absent from `package.json`,
> that's no longer true — they're real `dependencies` today, installed and running in production.
> See `docs/BACKEND_READINESS_REVIEW.md` for current, verified ground truth. The frontend
> dependency findings below are unaffected and still accurate.

Verified by reading `package.json`, running `npm install`, and cross-checking against actual imports in the code.

## Declared and installed (frontend) — clean

`npm install` completes with 0 vulnerabilities across 278 packages. All 33 `dependencies` and 9 `devDependencies` in `package.json` are frontend-only (React, Radix, Tailwind, tRPC client packages, framer-motion, etc.) and correspond to real imports in `src/`.

One version-compatibility issue found via typecheck, not via `npm install` itself:
- **`react-resizable-panels@^2.1.0`** — `src/components/ui/resizable.tsx` (a shadcn-generated component) calls `.Group` and `.Separator` on the imported module, which don't exist on the installed version's exports. This is a version/API mismatch between the shadcn component template and the pinned dependency version — needs either an upgrade or a corrected import.

## Imported but not declared (backend) — the core dependency gap

Code in `api/` and `db/` imports the following packages, none of which appear anywhere in `package.json`:

| Package | Used in |
|---|---|
| `hono`, `@hono/node-server`, `hono/cors` | `api/boot.ts` |
| `@trpc/server` | `api/router.ts`, `api/boot.ts` |
| `jose` | `api/lib/jwt.ts` |
| `bcryptjs` (+ `@types/bcryptjs`) | `api/lib/password.ts`, `db/seed-rich.ts` |
| `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | `api/lib/s3.ts` |
| `zod` | every file in `api/routes/*.ts` |
| `drizzle-orm`, `drizzle-orm/mysql-core`, `drizzle-orm/mysql2` | `db/schema.ts`, `db/connection.ts`, every `api/routes/*.ts` |
| `mysql2/promise` | `db/connection.ts` |
| `superjson` | `api/router.ts` (the real package — the frontend uses a hand-rolled stub instead, see below) |

`drizzle-kit` (needed to actually generate/run migrations) is also absent, and no migrations have ever been generated — `db/migrations/` doesn't exist.

This was confirmed directly: temporarily adding all of the above to `package.json` and running `npx tsc --noEmit` eliminated every "Cannot find module" error, surfacing the *real* type errors underneath (see `docs/CURRENT_STATE.md`). Those temporary additions were reverted after the diagnostic — see `docs/DECISIONS.md`.

## Lint tooling declared in config but not installed

`eslint.config.js` imports `@eslint/js`, `globals`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, and `typescript-eslint` — **none of these are in `package.json`**, and there's no `lint` script. Running `npx eslint .` fails immediately with `Cannot find package '@eslint/js'`. The lint configuration is well-formed (flat config, sensible plugin choices) but has never actually been run in this project as committed.

## Dead code / unused

- **`contracts/index.ts`** — plain TypeScript interfaces mirroring an older version of the DB schema. Zero imports reference `@contracts/*` or `from '.../contracts'` anywhere in `src/`, `api/`, or `db/`. It's also stale (missing `employers`, `jobs`, `applications`, `messages`, `notifications`, `reviews`, `wriScores` entirely, and its `User.role` type doesn't match the frontend's actual roles). Safe to delete once confirmed nothing external depends on it, or to formally supersede with tRPC's inferred `AppRouter` types.
- **`src/lib/superjson-stub.ts`** — a 5-line hand-rolled `JSON.stringify`/`parse` stand-in for the real `superjson` package, explicitly commented as being for "static deployment where tRPC backend doesn't run." This is a deliberate design choice (see `docs/ARCHITECTURE.md`), not leftover debris — keep it in mind but don't "clean it up" without understanding it's load-bearing for the current no-backend deployment mode.

## Stale artifacts on disk (not committed, gitignored)

- **`node_modules.bak.1417/`** (41MB) — a leftover backup directory from a prior dependency reinstall, sitting alongside where `node_modules/` normally goes. Excluded from git via the new `.gitignore`'s `node_modules.bak*/` pattern. Safe to delete manually; not touched during this audit since it's outside the scope of "don't delete without explaining."
- **`dist/`** (2.4MB) — Vite build output, present on disk from a prior build, correctly gitignored, not committed.

## Recommendation

Don't add the backend dependencies back to `package.json` casually. That decision belongs to the milestone in `docs/NEXT_MILESTONE.md`, where it should come with: a provisioned MySQL instance, a runtime path-alias resolution strategy, migrations actually generated and run, and the confirmed backend bugs (`docs/SECURITY_AUDIT.md`) fixed — not as a standalone dependency bump.
