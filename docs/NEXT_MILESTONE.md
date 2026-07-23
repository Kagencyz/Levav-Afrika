# Next Milestone (Accepted — implementation not yet started)

**Status:** Planning approved, with amendments, on 2026-07-23. No application code has been modified, no database infrastructure has been provisioned, no migrations have been generated, and nothing has been pushed. **A separate implementation-approval checkpoint is still required before any code is written** — see §9's checkpoints. This document, `docs/adr/001-database-platform.md`, `docs/AUTHENTICATION_ARCHITECTURE.md`, and `docs/DOMAIN_MODEL.md` are the complete, approved planning package.

**Amendments incorporated from approval:**
1. Business logic must remain platform-agnostic, not tightly coupled to Supabase-specific SDKs/products — see the updated "Platform-agnostic data access" section in `docs/adr/001-database-platform.md`.
2. `docs/DOMAIN_MODEL.md` was produced as the authoritative entity/relationship definition, to exist before implementation begins.
3. Runtime module strategy (§5, below) now compares three options before selecting one, rather than jumping straight to a single recommendation.

## Milestone

**Backend runtime foundation + real authentication + one talent-profile vertical slice.**

## 1. Database decision

See `docs/adr/001-database-platform.md` for the full comparison. **Decided: migrate now to PostgreSQL, hosted on Supabase** (Drizzle ORM is retained either way — this is a dialect/hosting decision, not an ORM decision). Rejected: staying on MySQL long-term, and "restore MySQL now, migrate later" (strictly dominated — pays full setup cost twice for zero data-continuity benefit, since no MySQL instance has ever actually run and no data exists to preserve). **Amendment:** business logic connects via a standard Postgres driver + Drizzle, not `@supabase/supabase-js` — Supabase is the hosting choice, not an application-level dependency. Full detail in the ADR's "Platform-agnostic data access" section.

## 2. Authentication architecture

See `docs/AUTHENTICATION_ARCHITECTURE.md` for the complete flow. **Verdict: retain the existing JWT design (`jose` + `bcryptjs`, both already correct), change token transport from `localStorage` to an `httpOnly`/`Secure`/`SameSite=Lax` cookie.** Enumeration protections, dummy-hash timing mitigation on login, and server-authoritative identity (client cache is a rendering hint only, never an authorization source) are specified there in full.

## 3. Tenant and role foundation

**An employer is an organization, not a user role.** Today's schema conflates the two (`employers.userId` is a 1:1 link, meaning a company can only ever have exactly one login — not how real companies work). Full entity definitions, fields, and invariants are now in **`docs/DOMAIN_MODEL.md`** (produced per the approval amendment) — the summary below is a pointer, not a duplicate source of truth.

| Concept | What it is | Modeled as |
|---|---|---|
| **Talent** | An individual jobseeker/professional | Derived from the existence of a `talents` row (1:1 via `userId`) — not a stored role. See `docs/DOMAIN_MODEL.md`'s "Business capability derivation." |
| **Employer** | A company/business — an organization, not a person | New `organizations` table (the old `employers` table, reshaped away from its 1:1 user link), carrying `organizationType` |
| **Employer team member** | A person who logs in on behalf of an employer organization | Derived from an active `organizationMembers` row for that user, linked to one or more organizations, carrying an org-scoped role (`owner`, `admin`, `recruiter`, `member`) |
| **Champion** | An earned status, not a separate account type — still fundamentally a talent | Explicitly deferred (not in the schema); if built later, its own additive field or table, never a value inside `accessLevel` |
| **Administrator** | Levav's own platform admin | `users.accessLevel = 'admin'`, not tied to any organization |
| **Platform staff** | Narrower-permission Levav staff, distinct from full admin | **Not built in this milestone** — no evidence this exists today; explicitly deferred rather than speculatively designed now. `accessLevel` stays a simple enum for now; a finer-grained permissions table is future work if/when real staff-tier needs arise |

**Minimum model needed now, to avoid an immediate rewrite:** `organizations` (id, name, organizationType, industry, size, verificationStatus, businessDocuments, timestamps) + `organization_members` (id, organizationId, userId, orgRole enum, status, invitedByUserId, timestamps), and `users.accessLevel` (`standard | admin`) capturing platform access only — business identity is never stored on `users`. **This has been implemented and a migration generated** (not yet applied) — see `docs/DOMAIN_MODEL.md` for the authoritative shape and `docs/DECISIONS.md` for the amendment history.

## 4. Safe router exposure

**Enabled this milestone**, and registered in `api/router.ts`:
- **`auth`** — full (`register`, `login`, `me`, `logout` to be added per `docs/AUTHENTICATION_ARCHITECTURE.md`).
- **`talent`** — scoped to self-service only: create own profile, update own profile, get own profile. Public browsing/listing of all talents, `delete`, and `toggleFeatured` (admin-only today) stay out of this milestone's registered surface.

**Explicitly excluded — must remain disabled/unregistered from `appRouter` entirely, not merely unused by the frontend:**
- **`upload`** — public, unauthenticated presigned-URL signing (arbitrary anonymous S3 upload risk, per `docs/SECURITY_AUDIT.md`).
- **`application`** — `updateStatus`/`byJob` have no ownership checks.
- **`notification`** — `create` lets any user notify any other arbitrary user.
- **`employer`** — broken (`ctx.user.id` bug) and depends on the organization/membership model in §3, which doesn't exist yet.
- **`job`, `message`, `review`** — unverified marketplace operations with no product requirement in this milestone's narrow vertical slice.
- **`wri`** — stub, no reason to enable.

Recommendation for the implementation phase: remove these from the `router({...})` call in `api/router.ts` (not merely leave them unimported/uncalled by the frontend) so they don't exist on the wire at all while unreviewed.

## 5. Runtime module strategy

**One consistent mechanism, reused everywhere — not scattered relative-import fixes.** Three options were compared before selecting one.

| Option | Dev execution | Tests | Production build | Server deployment | Verdict |
|---|---|---|---|---|---|
| **A — `tsx` + `tsconfig-paths`** | `tsx` runs TS directly, fast iteration, no separate build step | Doesn't help — Vitest resolves via Vite's own resolver, independent of `tsconfig-paths` entirely | Would need a *different* mechanism for prod (either run `tsx` in production too, or introduce a separate build step) | Same problem as production build | **Rejected.** `tsconfig-paths` is fundamentally a CommonJS `require`-hook tool; this project is full ESM (`"type": "module"`, `verbatimModuleSyntax`). Its ESM support requires an experimental loader, and stacking that under `tsx`'s own esbuild-based module hooks is a known source of resolution-order conflicts. Worse, it only ever solves *dev* — tests and production still need a separate answer, which is exactly the "scattered fixes" outcome this decision is meant to avoid. |
| **B — hand-rolled esbuild script** | Bundle `api/boot.ts` with a custom `scripts/build-server.mjs` using the `esbuild` package (already a transitive Vite dependency), watch mode for dev | Unaffected — Vitest still uses Vite's resolver independently | Same script, one-shot instead of watch | Ship the bundled output; no runtime resolution needed | **Viable, but not preferred.** Reuses tooling already present, but esbuild's default bundling behavior pulls `node_modules` into the bundle unless every native/binary dependency (`bcryptjs`, a Postgres driver) is manually marked `external` — a real, easy-to-get-wrong footgun that has to be hand-maintained as dependencies change. |
| **C — `tsup`** | `tsup --watch` (built on esbuild, purpose-built for bundling Node backends/packages) | Unaffected — same as B | `tsup` (no watch) — same artifact-producing mechanism as dev | Ship the bundled output — same as B | **Recommended.** Same underlying engine as B (esbuild) — so it's the same "family" of tooling Vite already uses — but with a maintained, purpose-built config surface: it reads `tsconfig.json` `paths` natively, and by default treats `package.json` dependencies as external rather than bundling them, which directly avoids B's native-module footgun without hand-maintained external-list upkeep. |

**Recommendation: `tsup`.** One `tsup.config.ts`, reused identically for dev (`--watch`) and production build; Vitest (already the test-framework choice, see §8) resolves `@/`, `@db/`, `@api/`, `@contracts/` independently via Vite's own resolver, so tests were never actually a separate problem to solve — they already share Vite's mechanism. This gives exactly one alias-resolution answer for the backend (`tsup`/esbuild) and one for the frontend+tests (Vite/Vitest), rather than three different, independently-maintained mechanisms.

This replaces directly running `tsx api/boot.ts` (which has no alias resolver and is the confirmed cause of today's boot failure) with a build step that resolves aliases once, consistently, the same way the frontend already does via Vite.

## 6. Talent-profile vertical slice

**The journey:** register → log in → create/update a basic profile → refresh the page or start a new session → the same profile comes back from the database.

**Fields included** (the minimum that makes a profile meaningfully a profile): `name`, `bio`, `category`, `skills` (array), `location`.

**Fields excluded from this milestone:** `portfolio` (depends on the excluded `upload` router), `avatar` (same dependency), `rate` (a commercial/pricing concept, not needed to prove persistence), `featured` (an admin/curation concept, irrelevant here and admin-only regardless).

## 7. Security baseline

Full detail in `docs/AUTHENTICATION_ARCHITECTURE.md`. Summary of what this milestone must include:
- **Environment validation** — a zod-validated env schema at server boot (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`); refuse to boot without `JWT_SECRET` outside local dev, closing the currently-hardcoded fallback.
- **Secure secret handling** — `.env` stays gitignored (already true); updated `.env.example` documents every required var.
- **Configured CORS origins** — explicit allow-list (e.g. `http://localhost:5173`), never `'*'`; required regardless, and mandatory once cookie-based auth is adopted (credentialed CORS cannot use `'*'`).
- **Authentication middleware** — keep `authedProcedure`/`adminProcedure`; add an explicit ownership check for the talent-profile mutations.
- **Authorisation rules** — a talent may only create/update/view their own profile in this milestone; no cross-user access; admin override is out of scope here.
- **Password requirements** — minimum 8 characters, enforced server-side via zod, never trusting the client-side check alone.
- **Rate-limiting strategy** — real server-side rate limiting on `register`/`login` (in-memory limiter acceptable for a single-instance MVP; explicitly flagged as needing a real distributed limiter before any multi-instance deployment). The existing client-side 5-attempts/30s cooldown in `Auth.tsx` is trivially bypassable and is not a substitute.
- **Safe error responses** — convert the plain `Error('UNAUTHORIZED'/'FORBIDDEN')` throws (`api/router.ts`) to proper `TRPCError`s with correct codes; never leak stack traces to the client.
- **Secure session/token handling** — `httpOnly`/`Secure`/`SameSite=Lax` cookie, per §2.
- **Account enumeration protection** — generic login errors + dummy-hash timing mitigation, per `docs/AUTHENTICATION_ARCHITECTURE.md`; registration intentionally reveals existence (standard practice), login does not.

## 8. Test strategy

**Framework: Vitest** (per §5 — shares Vite's resolver, no test framework exists today). Required tests:
- Registration: success; duplicate email.
- Login: valid credentials; invalid credentials; missing credentials.
- Session: expired/invalid token/cookie rejected; `me` returns the correct current user for a valid session.
- Authorization: protected route/procedure rejects an unauthenticated caller; role validation rejects a disallowed self-assigned role at registration.
- Profile: creation succeeds and persists; update succeeds and persists; a second session/page load retrieves the same persisted data (the vertical slice's actual acceptance test).

## 9. Implementation plan

### Ordered phases

1. **Runtime foundation** — adopt `tsup` (§5) for the backend; confirm `api/boot.ts` actually starts (even against a not-yet-real database, to isolate "does the server start" from "does the database work").
2. **Database** — provision Postgres per the ADR, rewrite `db/schema.ts` to `pgTable`/`pgEnum` syntax including `users.accessLevel` and the new `organizations`/`organization_members` tables from §3, generate first migrations, apply them. **Done** (schema written, migration generated) — not yet applied.
3. **Auth** — implement the cookie-transport change and the register/login/me/logout flow exactly as specified in `docs/AUTHENTICATION_ARCHITECTURE.md`, including the environment validation and rate-limiting from §7.
4. **Router exposure** — register only `auth` (full) and `talent` (scoped) in `api/router.ts`; explicitly remove/leave unregistered everything listed in §4.
5. **Talent profile slice** — wire `ProfileCreate.tsx` (fixing its already-confirmed `never`-typed state bug as part of this work, since it's directly in this slice's path) and the relevant read path to the real `talent` router, for exactly the fields in §6.
6. **Tests** — Vitest suite per §8, written alongside each phase above, not bolted on at the end.

### Files likely to change

`package.json` (real backend deps + `tsup`/Vitest tooling this time, not a diagnostic revert), `db/schema.ts`, `db/connection.ts`, `drizzle.config.ts`, `api/boot.ts`, `api/context.ts`, `api/router.ts`, `api/routes/auth.ts` (add `logout`, cookie handling), `api/lib/jwt.ts` (cookie helpers), `src/providers/trpc.tsx`, `src/hooks/useAuth.ts`, `src/components/ProtectedRoute.tsx`, `src/pages/Auth.tsx`, `src/pages/ProfileCreate.tsx`, `.env.example`.

### New files likely to be created

`tsup.config.ts` (§5's runtime module strategy), `vitest.config.ts`, test files alongside each changed backend module (e.g. `api/routes/auth.test.ts`, `api/routes/talent.test.ts`), `db/migrations/*` (generated, not hand-written), possibly a small `api/lib/env.ts` schema-validation module (a version already exists — confirm whether it can be extended rather than replaced).

### Dependencies proposed

Real (not diagnostic-temporary) additions: `hono`, `@hono/node-server`, `@trpc/server`, `drizzle-orm` (Postgres dialect), `postgres` or `pg` (driver, connecting via a standard connection string — not `@supabase/supabase-js`, per the platform-agnostic amendment), `drizzle-kit`, `jose`, `bcryptjs` + `@types/bcryptjs`, `zod`, `tsup`, `vitest`. **Explicitly not added yet:** `@supabase/supabase-js` (not needed — data access stays platform-agnostic), AWS SDK packages (`upload` router stays disabled), `superjson` (only needed once more of the router surface is enabled).

### Migration strategy

First-ever migrations, generated via `drizzle-kit generate` against the Postgres schema once §3's tables are written into `db/schema.ts`. No existing data to migrate. No `.env`/production database is touched by this planning pass — provisioning happens only after approval, per the user's explicit instruction not to install infrastructure yet.

### Rollback strategy

Each phase is independently revertible: the runtime/bundle change doesn't touch application logic; the schema/migration work happens against a fresh database with no prior data at stake; the auth changes are contained to the files listed above and can be reverted to the current (fake/localStorage) behavior without affecting anything else, since nothing else in this milestone's scope depends on the backend being up (mirrors the rollback framing already used in the prior version of this document).

### Acceptance criteria

- The backend boots via the new bundle-based dev/build process against a real Postgres instance, with no path-alias errors.
- Registering a new account creates a real `users` row; duplicate email is rejected with the specified message.
- Logging in with correct credentials succeeds and sets the `httpOnly` cookie; incorrect credentials are rejected with the generic message.
- Refreshing the page, or starting an entirely new browser session, retrieves the same authenticated identity via `me` and the same persisted talent-profile fields from the database — not from `localStorage`.
- Only `auth` and the scoped `talent` procedures are reachable; every router listed as excluded in §4 returns "not found" (i.e., is genuinely unregistered, not just unused).
- The Vitest suite in §8 passes.

### Risks

- The `users.accessLevel`/organization schema is a real design decision with implications for every later role-gated feature — confirmed with the user on the exact org-role vocabulary (`owner/admin/recruiter/member`) and the access-level model before the migration was generated, not assumed unilaterally.
- Keeping business logic platform-agnostic (standard Postgres driver + Drizzle, not `@supabase/supabase-js`) takes slightly more discipline than using Supabase's client SDK directly — worth a reminder during implementation review, since it would be easy to reach for the SDK out of convenience.
- Scope discipline: it will be tempting to also fix `employer.ts` or wire one more page while touching this code — resist it; this milestone is intentionally narrow so it can be verified cleanly.
- Cookie-based auth requires getting CORS/`credentials` configuration right in both dev and any deployed environment — worth explicit testing in both, not just assumed to work.

### Exclusions (explicitly out of scope for this milestone)

Employer verification flow, job/application/message/review/notification wiring, the `employer.ts` bug fix itself (tracked, not fixed here since `employer` stays unregistered), WRI/Levav 28/Learn/QuickWork/SkillSpace/Impact/Champions backend work, portfolio/avatar upload (depends on the excluded `upload` router), any visual redesign, any production deployment/hosting decisions beyond the database platform choice itself, refresh-token rotation, and a distinct "platform staff" permission tier.

### Checkpoints — status

1. ✅ **This planning package** (this document + the ADR + `docs/AUTHENTICATION_ARCHITECTURE.md` + `docs/DOMAIN_MODEL.md`) — **approved with amendments, 2026-07-23.**
2. ✅ **Database platform choice** — Supabase, confirmed. No longer unresolved.
3. ✅ **The `organizations`/`organization_members` shape in §3 / `docs/DOMAIN_MODEL.md`** — approved, then amended: `users.role` replaced with `users.accessLevel` (`standard`/`admin`), `organizations.organizationType` added, `organization_members.invitedByUserId` added. Org-role vocabulary (`owner`/`admin`/`recruiter`/`member`) unchanged. See `docs/DECISIONS.md` for the amendment round.
4. ✅ **The cookie-transport change to auth** — approved, no objection raised.
5. ⏳ **Implementation approval** — **still required.** Nothing in §9's ordered phases begins until this is explicitly given, per the instruction that approving this planning package is not the same as approving implementation.
6. ⏳ **A final review pass** once the vertical slice is implemented, before it's considered "done" and before any further milestone begins.
