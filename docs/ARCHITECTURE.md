# Architecture

This describes what actually exists and actually runs, verified by reading code and executing commands — not the intended architecture. Where intent and reality diverge, both are stated.

## High-level shape

```
levav-talent/
├── src/            ← RUNS. Vite + React 19 SPA. This is the entire live application.
├── api/            ← DOES NOT RUN. tRPC + Hono server. Never wired up, never executed.
├── db/             ← DOES NOT RUN. Drizzle schema + MySQL connection + seed scripts.
├── contracts/      ← DEAD CODE. Unreferenced anywhere in src/ or api/.
└── dist/           ← Vite build output (gitignored).
```

**The single most important architectural fact:** `src/` and `api/`+`db/` are two disconnected systems that happen to live in the same repository. The frontend was built to run standalone against browser `localStorage` and hardcoded data, with tRPC plumbing present but pointed at a backend that has never been started. A file (`src/lib/superjson-stub.ts`) explicitly documents this: *"Stub for superjson - used for static deployment where tRPC backend doesn't run."*

## Frontend (what actually runs)

- **Build tool:** Vite 6, `npm run dev` / `npm run build` / `npm run preview`.
- **Language:** TypeScript 5.9, `strict: true`, but **the build does not type-check** (esbuild transpile-only) — see `docs/CURRENT_STATE.md` for the ~150 errors that ship anyway.
- **UI:** shadcn/ui (`new-york` style, `components.json`) on top of Radix primitives, Tailwind CSS 3, `lucide-react` icons, `framer-motion` for animation.
- **Routing:** `react-router` v7, all routes declared and mounted in `src/App.tsx`; 34 page components under `src/pages/`.
- **Data fetching layer that exists but is barely used:** `@trpc/client` + `@trpc/react-query` + `@tanstack/react-query`, wired in `src/providers/trpc.tsx` (`httpBatchLink({ url: '/api/trpc' })`, reads `auth_token` from localStorage for the Bearer header). Of ~52 page/component files, only 2 (`NotificationBell.tsx`, `ReviewForm.tsx`) call any tRPC hook at all, and both fall back to mock data if the call fails.
- **State/persistence:** `localStorage`, directly and via small service modules (`src/lib/settingsService.ts`, `src/lib/auditService.ts`). This is the *real* persistence layer for the app as it exists today — not the database.
- **Auth:** `src/hooks/useAuth.ts` attempts a real tRPC call (`trpc.auth.me`) but always falls back to `localUser` derived from localStorage; since the backend never runs, in practice auth state is 100% localStorage-driven. `src/pages/Auth.tsx` accepts any email/password and mints a `demo_token_<timestamp>` with a `Math.random()` user id — see `docs/SECURITY_AUDIT.md`.
- **Bundle:** single output chunk, 2.38MB minified / ~596KB gzipped. No route-based code-splitting configured.

## Backend (written, present, not runnable as committed)

- **Server:** Hono (`api/boot.ts`) — CORS wide open (`origin: '*'`), health check at `/health`, tRPC mounted at `/api/trpc/*`, and a SPA-fallback static file server for `dist/`. Intended to serve both API and built frontend from one process.
- **API layer:** tRPC v11 (`api/router.ts`), combining 9 sub-routers (auth, talent, upload, employer, job, application, message, notification, review, wri) plus a stubbed `wri` router that always returns `null`. `authedProcedure`/`adminProcedure` middleware exist and are used correctly in most routes.
- **Data layer:** Drizzle ORM, MySQL dialect (`drizzle.config.ts`, `db/schema.ts`, `db/connection.ts` via `mysql2/promise`). 11 tables — see `docs/PRODUCT_SYSTEM_MAP.md` for what they cover (a generic talent-marketplace model; no Levav-specific tables). No migrations have ever been generated (`db/migrations` doesn't exist).
- **Auth primitives:** `jose` for JWT (7-day expiry, hardcoded dev-fallback secret if `JWT_SECRET` unset), `bcryptjs` for password hashing (cost 12) — both implemented correctly in isolation.
- **Uploads:** AWS S3 presigned URLs (`api/lib/s3.ts`), config read from `VITE_S3_*` env vars server-side only (the `VITE_` prefix is a naming smell but not an actual client-exposure risk since it's read via `process.env`, not bundled).

**Why it doesn't run today (verified, not assumed):**
1. `package.json` declares **zero** of the backend's actual dependencies — `hono`, `@hono/node-server`, `@trpc/server`, `drizzle-orm`, `drizzle-kit`, `mysql2`, `jose`, `bcryptjs`, `zod`, `superjson`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` are all imported by code in `api/`/`db/` but absent from `dependencies`/`devDependencies`. `npm install` never fetches them.
2. No npm script starts `api/boot.ts` (`dev`, `build`, `preview` only run Vite).
3. Even after temporarily installing all the missing packages (done for this audit, then reverted — see `docs/DECISIONS.md`), running `tsx api/boot.ts` **fails on its very first import**: `api/routes/employer.ts` imports `@db/connection` using a path alias (`@db/*`) that is only configured in `tsconfig.app.json` for Vite/tsc's bundler resolution — there is no runtime alias resolver (e.g. `tsconfig-paths`) wired into `tsx`/Node. This means the backend, as committed, has almost certainly never been executed even once against a real database.
4. Typechecking the backend (once deps are present) surfaces real bugs independent of the module-resolution issue — see `docs/CURRENT_STATE.md` and `docs/SECURITY_AUDIT.md` (the `ctx.user.id` bug in `employer.ts`, a Drizzle enum-comparison bug in `job.ts`).

## Path aliases

Declared consistently in both `vite.config.ts` and `tsconfig.app.json`:
- `@/*` → `src/*`
- `@db/*` → `db/*`
- `@api/*` → `api/*`
- `@contracts/*` → `contracts/*`

These work for anything Vite or `tsc` processes. They do **not** work under plain `node`/`tsx` execution of `api/boot.ts` without an additional runtime resolver — this is the direct cause of finding #3 above.

## What "wiring up the backend" would actually require

Not a small fix. At minimum: (a) add the real dependency list to `package.json`, (b) add a runtime path-alias resolver or convert `api`/`db` imports to relative paths, (c) provision a real database and run migrations (none exist yet — `drizzle-kit generate` has never been run), (d) fix the confirmed bugs in `employer.ts` and `job.ts`, (e) decide what to do about the "router type collision" TypeScript error currently affecting `trpc.auth`/`trpc.notification`/`trpc.review` client usage (most likely a cascading symptom of (d), not yet fully isolated), (f) rewrite every page currently reading from `MOCK_*`/localStorage to read from the real API, one by one. **(b) and (c) now have a proposed answer** — see the planned target architecture below — but nothing in this section has been implemented; the facts above (MySQL dialect in code, `tsx` failing on import) remain accurate descriptions of the repository as it exists today.

## Planned target architecture (accepted, not yet implemented)

The following changes are **accepted** (approved with amendments, 2026-07-23) in `docs/NEXT_MILESTONE.md`, `docs/adr/001-database-platform.md`, `docs/AUTHENTICATION_ARCHITECTURE.md`, and `docs/DOMAIN_MODEL.md`, and are recorded here only so this document doesn't go stale. **None of this exists in the codebase yet — implementation itself still requires a separate approval checkpoint.**

- **Database:** migrate `db/schema.ts`/`db/connection.ts`/`drizzle.config.ts` from MySQL to PostgreSQL (Drizzle ORM retained), hosted on Supabase, accessed via a standard Postgres driver rather than `@supabase/supabase-js` (business logic stays platform-agnostic — Supabase is a hosting choice, not an application dependency). Full rationale in the ADR.
- **Tenant/role model:** introduce `organizations` and `organization_members` tables so "employer" is modeled as an organization with multiple member-users, not a 1:1 user role; `users.accessLevel` (`standard | admin`) captures platform-level access only — business identity (talent, organization member) is derived from the existence of related rows (`talents`, active `organizationMembers`), never a stored role value. Champion status remains an explicitly deferred, separate concept. Full entity definitions in `docs/DOMAIN_MODEL.md`.
- **Runtime module strategy:** stop running `api/boot.ts` directly via `tsx` (the confirmed cause of finding #3 above). After comparing `tsx`+`tsconfig-paths`, a hand-rolled esbuild script, and `tsup`, **`tsup`** was selected — same underlying esbuild engine as Vite, purpose-built for bundling a Node backend, native `tsconfig.json` path support, and sensible default external-dependency handling. Used identically for dev (`--watch`) and production builds; Vitest (adopted as the test framework) already resolves aliases independently via Vite's own resolver. Full comparison in `docs/NEXT_MILESTONE.md` §5.
- **Auth transport:** move the JWT from a `localStorage`-read Bearer header to an `httpOnly`/`Secure`/`SameSite=Lax` cookie; the JWT/bcrypt design itself is retained. Full detail in `docs/AUTHENTICATION_ARCHITECTURE.md`.
- **Router exposure:** only `auth` (full) and `talent` (scoped to self-service profile CRUD) become reachable; `upload`, `employer`, `job`, `application`, `message`, `notification`, `review`, `wri` stay unregistered from `appRouter` until each is reviewed on its own merits. Full detail in `docs/NEXT_MILESTONE.md` §4.
