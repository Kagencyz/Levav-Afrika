# CLAUDE.md

Read this first. For deeper context read, in order: `docs/BACKEND_READINESS_REVIEW.md`, `docs/CURRENT_STATE.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_SYSTEM_MAP.md`, `docs/SECURITY_AUDIT.md`, then the rest of `docs/`.

## Product purpose

Levav Talent is an early-stage prototype for "Africa's Workforce Intelligence Ecosystem," starting in Zambia. The intended journey is Potential → Capability → Contribution → Opportunity → Prosperity → Development, expressed through concepts like Levav ID, Workforce Readiness Index (WRI), Levav 28, Levav Learn, QuickWork, SkillSpace, Levav Impact, and Levav Champions.

**As of 2026-07-30, auth, onboarding, and talent profiles (own-profile create/update/view) are backed by a real database and API.** Levav 28, Learn, QuickWork, Levav Impact, the Feed, WRI, and Levav Champions are still frontend-only, localStorage-and-mock-data — a deliberate choice, matching this prototype's existing pattern, not an oversight. See `docs/BACKEND_READINESS_REVIEW.md` for the current, verified backend split, and `docs/CURRENT_STATE.md` for page-by-page frontend detail (its own backend claims are stale — see the banner at its top).

## Technology stack

- **Frontend:** Vite 6, React 19, TypeScript 5.9 (strict), Tailwind CSS 3, shadcn/ui (`new-york` style) + Radix primitives, React Router 7, TanStack Query 5, framer-motion 12.
- **Backend — real and deployed, but only partially wired:** Hono server (`server/app.ts`, `server/boot.ts`), tRPC v11 (`server/router.ts`), Drizzle ORM against **Postgres/Supabase** (`db/schema.ts`, 5 tables today: `users`, `talents`, `userOnboarding`, `organizations`, `organizationMembers`), JWT via `jose`, password hashing via `bcryptjs`. Deployed as a single Vercel serverless function (`api/index.ts`, consolidated from ~19 files to stay under the Hobby-plan 12-function cap). **Only `auth`, `onboarding`, and part of `talent` are registered on `appRouter`** — `employer.ts`, `application.ts`, `notification.ts`, `upload.ts`, `job.ts`, `message.ts`, `review.ts`, `wri.ts` are written but deliberately unregistered (several reference tables that no longer exist in the current schema), enforced by an allowlist test in `server/router.test.ts`. Don't register any of them without fixing the underlying issue first — see `docs/BACKEND_READINESS_REVIEW.md`.
- **Backend dependencies ARE declared** in `package.json`'s `dependencies` (not just present in source) and actually installed.

## Important commands

```bash
npm install       # installs both frontend and backend deps — both are real dependencies now
npm run dev       # Vite dev server, http://localhost:5173 (frontend only — talks to whatever API base URL is configured; see below)
npm run build     # production build (does NOT type-check — see below)
npm run preview   # preview the production build
npm test          # vitest — 33 tests across server/ and src/, all passing
npx tsc --noEmit -p tsconfig.app.json   # typecheck (no npm script defined yet) — currently ~160 errors, see docs/CURRENT_STATE.md

npm run dev:server    # tsup --watch + node dist-server/boot.js — standalone local backend (Hono on Node, not Vercel's handler)
npm run build:server  # tsup build of server/ to dist-server/
npm run start:server  # run the built server (dist-server/boot.js)
npm run db:generate   # drizzle-kit generate — regenerate a migration from db/schema.ts changes
npm run db:migrate    # drizzle-kit migrate — apply pending migrations to DATABASE_URL
```

To exercise the real backend locally (not just localStorage-backed pages), run `npm run dev:server` alongside `npm run dev` against a local Postgres instance — that's the setup used to verify the auth/onboarding/talent-profile work end-to-end (see `docs/DECISIONS.md`).

There is no `lint` script. `eslint.config.js` exists but its dependencies (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) are not installed.

A single test run (not the whole suite) is `npx vitest run <path>`, e.g. `npx vitest run server/router.test.ts`.

## Architectural rules

1. **The backend runs, but most of it isn't wired in.** `auth`, `onboarding`, and part of `talent` are real, registered, and deployed. Everything else in `server/routes/` is either unregistered-and-broken (fix before registering) or simply doesn't exist yet for QuickWork/Impact/Feed/Levav 28/Learn/WRI/Champions. Wiring any of those up is a deliberate schema-plus-migration-plus-route project, not a quick fix — see `docs/BACKEND_READINESS_REVIEW.md`'s "Open decision points" before starting one.
2. **Don't trust page-level "it renders" as "it works."** Most of `src/pages/*.tsx` and `src/components/admin/*.tsx` run on hardcoded `MOCK_*` arrays and/or localStorage, not the API — this remains true even where the backend itself is real, because most pages simply don't call it yet. Check `docs/CURRENT_STATE.md` before describing any page as functional.
3. **`contracts/index.ts` is dead code** — unreferenced anywhere, stale relative to the current DB schema. Don't extend it; don't assume it's the source of truth for shared types.
4. **Path aliases (`@/`, `@db/`, `@api/`, `@contracts/`) resolve inside Vite/tsc, and also at runtime for backend code** via `tsup.config.ts`'s esbuild alias config — but the three currently-registered route files use plain relative imports anyway, sidestepping the question. If you add a new backend file that needs `@db`/`@api`/`@contracts` at runtime, confirm it's covered by `tsup.config.ts` rather than assuming.
5. **One canonical app.** A sibling `app/` folder (outside this git repo) exists from an earlier generation and should not be treated as a second source of truth. `levav-talent/` (this folder) is canonical.

## Production deployment: hard-won constraints

Between 2026-08-02 and 2026-08-10, five separate production-only bugs took the live API down (each fixed in its own commit — `a7f2555`, `7b0c69e`, `ee59e31`, `7cf2cb8`, `dbbcd07`; full postmortems in `docs/DECISIONS.md` up to 2026-07-31 only — the five commits above post-date that log and are **not yet backfilled into `docs/`**, only in git history). None of these reproduced locally under `dev:server`/`tsup`, because local dev bundles everything and hides them. The resulting constraints, still load-bearing:

1. **Relative imports under `server/`/`db`/`api/` must use explicit `.js` extensions** (e.g. `from './schema.js'`, not `'./schema'`). Vercel's Node.js function builder compiles files individually rather than bundling; Node's ESM loader requires explicit extensions on relative imports at runtime. `tsup` and Vite silently tolerate the extensionless form, so this only breaks in production.
2. **`api/index.ts` must use `@hono/node-server/vercel`'s `handle()`, not `hono/vercel`'s.** This project runs on Vercel's Node.js runtime (required for `pg`'s raw TCP sockets — Edge Runtime can't do them), where the function receives a raw `(IncomingMessage, ServerResponse)` pair, not a Fetch `Request`. `hono/vercel` assumes the latter and crashes every request with `this.raw.headers.get is not a function`.
3. **`db/connection.ts`'s SSL decision is keyed on the `DATABASE_URL` hostname (local/loopback vs. not), never on `NODE_ENV`.** Vercel sets `NODE_ENV=production` at build time but doesn't reliably propagate it into the deployed function's runtime `process.env`; a wrong SSL decision means a plaintext connection to Supabase's TLS-only pooler, which hangs rather than fails cleanly. `connectionTimeoutMillis: 8000` is also set deliberately, so a bad connection surfaces as a clear error instead of an infinite spinner until Vercel force-kills the function.
4. **`server/lib/password.ts` hashes at bcrypt cost 10, not a higher cost.** `bcryptjs` is pure-JS (no native bindings, meaningfully slower than native bcrypt) and this project is a single Vercel Hobby-plan function with a hard, non-configurable 10s execution limit — a higher cost risks `register`/`login` timing out under CPU throttling. This is bcrypt's own recommended default, not a security downgrade.
5. **`server/routes/auth.ts`'s `register`/`login` currently have temporary per-step timing `console.log`s** (`mark()` calls tagged `[auth.register]`/`[auth.login]`), added while the cost-10 fix above was still unconfirmed as the real cause. Remove once production timing is confirmed healthy — don't treat this as a logging pattern to extend elsewhere.

## Testing requirements

`npm test` (vitest) runs 33 passing tests across `server/lib/`, `server/router.test.ts` (an allowlist guard — see above), and `src/lib/`. Any new business-logic code (auth, matching, WRI scoring, payments, and the localStorage-backed logic in `src/lib/levavData.ts`) must ship with tests — the bar is "ships with tests," not "the codebase has zero coverage so one more untested thing doesn't matter."

## Security rules

- Auth is real for `register`/`login`/`me`/`logout` (bcrypt, normalized email, JWT via `jose`), and as of 2026-07-30 the token is carried as an `httpOnly`, `SameSite=Lax` cookie (`server/context.ts` + `server/app.ts`'s `responseMeta`), matching `docs/AUTHENTICATION_ARCHITECTURE.md`'s original spec — not readable or writable from JS. No auth token or session flag lives in `localStorage` anywhere in the app; don't reintroduce one.
- `server/routes/employer.ts`'s `ctx.user.id` bug (should be `ctx.user.userId`) is still present, and it also references an `employers` table that no longer exists in the current schema — needs real rework, not a one-line fix, before registering. `application.ts#updateStatus`, `notification.ts#create`, and `upload.ts#getPresignedUrl` still have missing or insufficient authorization checks. None of these four are registered on `appRouter` today, and `server/router.test.ts` enforces that — don't register any of them without fixing the underlying bug first, and don't weaken or remove that test to make registering one "easier."
- Never weaken auth/authorization to make a feature "work." Never commit `.env` (it's gitignored — keep it that way).

## Design-system rules

- One component system: shadcn/ui + Radix + Tailwind. Don't introduce a second UI library.
- `framer-motion` is already in use (not `motion`); don't add both.
- Visual direction (per `CREATIVE_BRIEF.md`): premium, minimal, black-and-white foundation with controlled lime-green accents, strong typography, sparing glass/liquid effects. Don't add decorative flourishes at the expense of product flows.
- The production bundle is currently a single 2.38MB JS file — any new heavy dependency should consider code-splitting (`React.lazy` + dynamic import), not add to the monolith.

## Git rules

- This repo (`levav-talent/`) has its own clean git history, separate from a much larger, messier repo that used to be accidentally rooted at the parent `Downloads/` folder. Do not run git commands from outside this folder assuming they're scoped to this project.
- Never `git add -A` from outside `levav-talent/`.
- Commit only when asked. Never force-push. Never `--no-verify`.

## Required reading order

`docs/DECISIONS.md` (#10 below) is current only through 2026-07-31. Five production-incident commits between 2026-08-02 and 2026-08-10 (see "Production deployment: hard-won constraints" above) are not logged there or anywhere else in `docs/` — `git log` is the only record. Backfilling that log is an open task, not something to assume already done.

1. `docs/BACKEND_READINESS_REVIEW.md` — current, verified backend truth (2026-07-30). Read this before trusting any backend claim in #2–#4 below.
2. `docs/CURRENT_STATE.md` — what's real vs. mock, page by page (backend claims stale, see banner; frontend claims still accurate).
3. `docs/ARCHITECTURE.md` — actual vs. intended architecture (stale on backend, see banner).
4. `docs/PRODUCT_SYSTEM_MAP.md` — Levav concept → code/schema reality.
5. `docs/SECURITY_AUDIT.md` (partially stale, see banner)
6. `docs/DEPENDENCY_AUDIT.md` (stale on backend deps, see banner)
7. `docs/UI_UX_AUDIT.md`
8. `docs/REPOSITORY_AUDIT.md` — how the repo got here.
9. `docs/ROADMAP.md` and `docs/NEXT_MILESTONE.md` (stale, see banner) — where to go next.
10. `docs/DECISIONS.md` — log of decisions made during this audit and since.
