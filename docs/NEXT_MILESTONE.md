# Next Milestone (Proposed — awaiting approval)

## Recommendation

**Make the backend genuinely runnable and replace fake client-side auth with real, database-backed authentication — end to end, for exactly one vertical slice (auth + talent profile), nothing else.**

Rationale: every other Levav concept (WRI, matching, employer verification, roles, tenant isolation) depends on knowing who a user actually is. Right now nobody does — `Auth.tsx` accepts any credentials and mints a fake token. Fixing this first, narrowly, gives every subsequent milestone (Phases 3–11 in `docs/ROADMAP.md`) a real foundation to build on instead of another layer over localStorage. This is deliberately the *smallest* slice that proves the backend can run at all, rather than attempting the whole backend wiring in one pass.

## Objective

A user can register and log in for real: credentials are checked against a MySQL-backed `users` table, a real JWT is issued and verified server-side, and `ProtectedRoute`/`useAuth` reflect genuine server state instead of localStorage alone.

## Business value

Removes the single most consequential gap between "looks like a product" and "is a product." Nothing else in the roadmap — employer verification, matching, WRI, admin tooling — can be real while identity itself is fake. This also de-risks every later milestone's estimate, since it forces resolution of the runtime/module issues that would otherwise resurface (and compound) in every subsequent phase.

## Dependencies

- A real MySQL instance (local via Docker, or a managed dev instance) — none exists today; `DATABASE_URL` currently defaults to a localhost placeholder.
- Decision on runtime path-alias resolution for `api`/`db` (`tsconfig-paths` package, or converting `@db/*`/`@api/*` imports to relative paths) — see `docs/ARCHITECTURE.md`.
- The missing backend npm dependencies (`docs/DEPENDENCY_AUDIT.md`) added back deliberately this time, with a real npm script to run the server.

## Exact scope

1. Add backend dependencies to `package.json` for real (not a diagnostic revert this time), plus a `dev:server`/`start:server` npm script.
2. Resolve the `@db/*`/`@api/*` runtime import problem so `api/boot.ts` actually starts.
3. Provision a MySQL instance for local dev; run `drizzle-kit generate` for the first time to create real migrations from `db/schema.ts`; apply them.
4. Fix the `users.role` enum to include `'employer'` and `'champion'` (currently only `'talent' | 'client' | 'admin'`), since the frontend already assumes these roles exist.
5. Wire `src/pages/Auth.tsx` to call the real `trpc.auth.register`/`trpc.auth.login`/`trpc.auth.me` procedures instead of generating a fake token.
6. Update `src/hooks/useAuth.ts` so server auth state is authoritative (remove the localStorage-first fallback logic, or make it strictly a cache of server state, not a substitute for it).
7. Fix the one bug directly in this slice's path if touched (none currently block auth specifically — `employer.ts`'s bug is out of scope, see below).

## Excluded scope (explicitly not in this milestone)

- Employer verification flow, job/application/message/review/notification wiring — stays mocked for now.
- Fixing `employer.ts`'s `ctx.user.id` bug, `job.ts`'s Drizzle enum bug, or the `application.ts`/`notification.ts`/`upload.ts` authorization gaps — real, but out of scope for an auth-only slice. Tracked in `docs/SECURITY_AUDIT.md` for the milestone that touches those routers.
- WRI, Levav 28, Learn, QuickWork, SkillSpace, Impact, Champions — none of these get schema or backend work in this milestone.
- Any UI/visual redesign — this is a plumbing milestone, not a design one.
- Production deployment/hosting decisions.

## Data changes

- `db/migrations/` created for the first time (currently doesn't exist).
- `users.role` enum extended: `['talent', 'client', 'admin']` → `['talent', 'employer', 'admin', 'champion']` (or however the team decides to reconcile `'client'` vs. `'employer'` naming — worth a quick product decision, not just a mechanical add).

## API changes

- No new endpoints — `api/routes/auth.ts` already implements `register`/`login`/`me` correctly. The change is making it reachable at all (server actually running) and having the frontend call it for real.

## UI changes

- `src/pages/Auth.tsx` — replace fake token generation with real tRPC mutation calls; add real error handling for actual failure modes (wrong password, duplicate email) instead of the current always-succeeds path.
- `src/hooks/useAuth.ts`, `src/components/ProtectedRoute.tsx` — adjust to trust server session state as authoritative.

## Security requirements

- Confirm `JWT_SECRET` is set in local `.env` (not relying on the hardcoded dev fallback) for this work.
- Confirm CORS is scoped appropriately for local dev (wide-open `origin: '*'` is acceptable for local-only testing, but should be flagged again before any shared/deployed environment).
- No changes to password hashing (`bcryptjs`, cost 12) — already correct.

## Tests

- Add tests for: register (success, duplicate email), login (success, wrong password), `me` (valid token, expired token, missing token), and the role-enum migration. This codebase currently has zero tests — this milestone should not add more untested logic to that pile.

## Acceptance criteria

- `npm run dev:server` (new script) boots the Hono/tRPC server against a real local MySQL instance without errors.
- Registering a new account in the UI creates a real row in `users`.
- Logging in with correct credentials succeeds; incorrect credentials are rejected (not silently accepted like today).
- Refreshing the page preserves a real session (via the real JWT, not a localStorage-only simulation).
- `npx tsc --noEmit` no longer reports the `employer.ts`/`job.ts`-adjacent "router collision" errors for `useAuth.ts`/`trpc.tsx` (confirms whether that was in fact a cascading symptom, per the open question in `docs/CURRENT_STATE.md`).

## Risks

- The `users.role` enum change is a real schema migration decision with implications for every other role-gated feature (champion gating, employer-only pages) — worth a short product conversation before writing the migration, not just picking a resolution unilaterally.
- Local MySQL provisioning is new infrastructure for this project; if the team doesn't already have a preferred way to run it (Docker Compose, a cloud dev DB), that choice itself needs a quick decision.
- Scope discipline: it will be tempting to "just also fix" `employer.ts` or wire one more page while in this code — resist it; this milestone is intentionally narrow so it can be verified cleanly.

## Estimated complexity

Medium. Most of the hard backend logic (auth.ts, jwt.ts, password.ts) already exists correctly — the work is plumbing (runtime resolution, real DB, migrations) plus one schema decision, not writing new business logic from scratch.

## Rollback strategy

This milestone is additive at the infrastructure level (new deps, new script, new migrations) and swaps one page's internals (`Auth.tsx`) rather than restructuring the app. If it doesn't work out: revert `Auth.tsx`/`useAuth.ts` to the current localStorage-based behavior (both are small, self-contained files), and the added backend dependencies/scripts can simply sit unused (as they do today) without affecting the rest of the app, since nothing else in this milestone's scope depends on the backend being up.
