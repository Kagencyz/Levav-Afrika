# Ground Truth Audit — 2026-08-13

**Status:** Complete. Five findings, none yet issued as packets.
**Date of verification:** 2026-08-12 / 2026-08-13 UTC
**Verified against:** `main` @ `7b6745d`, under `npm ci` with the pinned TypeScript 5.9.3
**Relationship to Sprint 0:** continues the finding sequence from `SPRINT0_AUDIT_PLAN.md` (FINDING-01 … FINDING-07). Nothing here supersedes that document; FINDING-08 corrects a *provenance* claim it relies on, and FINDING-09 narrows the control FINDING-07 depends on.

---

## 1. How this audit was conducted

This round began as a re-verification of the "Verified ground truth" block in `CLAUDE.md`. That block had already been found wrong in three places (see PR #16), so the remaining claims were treated as unverified rather than sound.

Fifteen claims were checked. Every one was re-derived by running commands or reading source and migrations; no claim was accepted from a repository document. Three read-only agents ran non-overlapping slices (auth/database, frontend metrics, stack/routers) and their output was independently spot-checked before being recorded here — one agent finding was initially contradicted by a too-narrow `grep` on this side and was confirmed correct on re-check.

**Live database checks were read-only** — `list_migrations` and `SELECT`s against `information_schema`. No DDL was run and nothing was changed.

### A toolchain trap that invalidated the first attempt

A fresh clone has no `node_modules`. `npx tsc` then resolves TypeScript **6.0.2** from the registry instead of the pinned `~5.9`, and 6.0 rejects `baseUrl` as a hard config error — so `tsc` exits **before checking a single file**, which reads as a clean pass to anyone grepping for file-level errors. The first measurement in this audit was void for exactly this reason.

**Run `npm ci` and confirm `npx tsc --version` reports 5.9 before trusting any typecheck result.**

## 2. Claims confirmed

| Claim | Result |
|---|---|
| Stack versions (11 packages) | Exact — React 19.2.8, Vite 6.4.3, TS 5.9.3, RR 7.18.1, TanStack 5.101.4, Tailwind 3.4.19, Hono 4.12.31, tRPC 11.18.0, Drizzle 0.45.2, Vitest 2.1.9, framer-motion 12.42.2 |
| framer-motion, not `motion` | Confirmed — `motion` absent from the tree and the lockfile; 79 imports from `framer-motion`, zero from `motion` |
| Five tables | Confirmed in schema and against the live database |
| `users.id` FK, `handle_new_user()` sole writer | Confirmed **structurally** — the live database grants `levav_app` only `SELECT` on `users`, so the application cannot insert |
| RLS on all five, no DELETE grant | Confirmed against the live database — 18 policies, zero DELETE, no DELETE grant on any table |
| Registered routers | Confirmed — `auth`, `dashboard`, `onboarding`, `organization`, partial `talent` (the `delete` adminProcedure is the omitted part) |
| `npm test` | 56 tests, 8 files, passing |
| 37 pages · 41 `localStorage` files · 15 `MOCK_*` files | Confirmed |
| Prototype-only features | Confirmed for Levav 28, WRI, QuickWork, Impact, Feed, Learn — zero backend calls |

## 3. Findings

### FINDING-08 — The production schema is not reproducible from this repository (CRITICAL)

The live database has been built by a migration history that is almost entirely absent from the repository.

| Applied to production | Present in repo? |
|---|---|
| `20260730031229 initial_schema` | No |
| `20260730031558 user_onboarding` | No |
| `20260730031650 rls_hardening_and_app_role` | No |
| `20260811220734 reconcile_supabase_auth` | A file exists, but at version `20260811220321` — a different record |
| `20260812020647 add_organization_registration_profile` | No |

Meanwhile `db/migrations/` contains six Drizzle migrations describing a **parallel history that has never been applied**: the live database has no Drizzle migrations table at all, only `supabase_migrations.schema_migrations`.

Three consequences:

1. **The database cannot be rebuilt from source.** A new environment, a restore, or any disaster-recovery path cannot be reconstructed from this repository.
2. **`db/migrations/` is not the schema of record**, although it is currently read as one. Any reasoning about grants, policies or constraints taken from those files describes a database that does not exist.
3. **`npm run db:migrate` is a live hazard.** It runs `drizzle-kit migrate` against `DATABASE_URL`. Pointed at production it finds no Drizzle migrations table, concludes nothing has been applied, and attempts all six migrations from scratch against a database that already holds those objects — failing partway, after `0000` has already attempted to create a role.

**Note on how this was found.** The audit was chasing an apparent defect: `user_onboarding` is created in the Drizzle chain at `0003` but never granted to `levav_app`, and Postgres checks table GRANT before RLS, which would deny the service role outright and break `onboarding.ts`. Checked against the live database, the grant **is present** (`SELECT, INSERT, UPDATE`) and onboarding works. The gap is real but exists only in a history that never ran — which is what exposed the divergence.

**Classification: MODIFY + BUILD.** Needs a packet. It must decide which tool owns migrations going forward, capture the live schema into the repository, and either remove `db:migrate` or make it safe.

### FINDING-09 — The router allowlist test guards names, not reachability

`server/router.test.ts` is designated by PDR-0006 as the control that keeps the eight quarantined routers unreachable after WP-0001 deletes them, and `CLAUDE.md` says never to weaken it. Its docstring states the routers "must stay unreachable". The assertion is:

```js
const procedures = Object.keys(appRouter._def.procedures).sort();
expect(procedures).toEqual(ALLOWED_PROCEDURES);
```

It is correctly bidirectional — a new router fails, a removed one fails. But it compares **procedure names only**, and three changes alter the reachable surface while leaving it green:

1. **Aliasing.** `_def.procedures` is keyed by the object key as written, never by the procedure's origin. `talent: router({ list: jobRouter.listAll })` produces the allowlisted key `talent.list` and passes. This is not contrived — `router.ts` already uses that idiom three times (`createOwnProfile: talentRouter.create`), so remapping a name onto a different implementation reads as house style.
2. **Lazy registration.** Lazy entries are recorded in `_def.lazy` and never enter `_def.procedures`, yet resolve at call time. A lazily-registered `job` router is fully reachable over HTTP and contributes zero keys to the assertion.
3. **Authorization drift.** The test never inspects procedure type or middleware chain. Downgrading `talent.getOwnProfile` from `authedProcedure` to `publicProcedure` passes unchanged — and authorization is precisely the property the quarantine exists to contain.

Secondary: the allowlist is hand-maintained, so a reviewer can turn a red test green by editing `ALLOWED_PROCEDURES` in the same commit, which is indistinguishable in a diff from a legitimate update.

**This is not an argument for weakening the test.** It is protective against the regression it names. It should not be relied on as a *reachability and authorization* guard, which is the job PDR-0006 currently gives it.

**Classification: ENHANCE.** Needs a packet, sequenced with or after WP-0001.

### FINDING-10 — Three frontend call sites target unregistered routers, and one substitutes mock data silently

`server/router.ts` deliberately omits the `review`, `notification` and `upload` routers. Three frontend call sites invoke them anyway and 404 at runtime:

- `src/components/ReviewForm.tsx` — `trpc.review.create`
- `src/components/NotificationBell.tsx` — four `trpc.notification.*` procedures
- `src/components/FileUpload.tsx` — hand-rolled `fetch('/api/trpc/upload.getPresignedUrl?…')`

`NotificationBell.tsx:138-152` handles the failure by falling back to `MOCK_NOTIFICATIONS` and rendering a hardcoded unread count of `3`. The user is shown fabricated notifications, presented identically to real ones, with no indication anything failed.

That breaches **invariant 9** (nothing is fabricated) and **PDR-0009** (unimplemented controls state their absence). It is also a false signal for reviewers: the component looks functional in any environment.

**Classification: MODIFY.** The dead call sites must either be removed or made to state their absence. This does not wait on the backend.

### FINDING-11 — AUTH-001 is contradicted client-side, latently

Capability is correctly derived from row existence on the server. Two frontend sites reintroduce the role-column model AUTH-001 rejects:

- `src/pages/Projects.tsx:88-102` — `getUserRole()` reads `localStorage.getItem("user").role` and `localStorage.getItem("role")` to choose employer vs talent, driving tab sets, copy and navigation.
- `src/hooks/useAuth.ts:29` — synthesises `role: accessLevel === 'admin' ? 'admin' : 'talent'`, labelling every non-admin a talent regardless of whether a `talents` row exists. This inverts the server's derivation.

Both are currently inert: nothing writes either key, so `getUserRole()` always falls through to `"talent"`. The hazard is that the pattern is present and looks intentional, so a future packet may extend it rather than remove it. Related: `src/components/Navbar.tsx` gates on `role === 'champion'`, a value `useAuth` can never produce — permanently dead UI.

**Classification: REMOVE.** Latent, so it can ride with whichever packet next touches those files.

### FINDING-12 — Residual drift in the documented ground truth (minor)

- **Champions is not `levavData.ts` prototype data.** It has no structure in that file. It is a self-contained `localStorage` store (`champion_applications`) with a working apply → admin-review loop, spanning `ChampionApply.tsx` and `ChampionApplicationsSection.tsx`. The "no backend" conclusion holds; the stated mechanism is wrong, and it is more built out than "prototype data" implies.
- **"12 files call tRPC" depends on the definition.** 14 mention it, 12 reference the client, **10 invoke a procedure**, and 8 invoke one that is registered.
- **"nothing in localStorage" is stated more absolutely than the code supports.** `src/components/FileUpload.tsx:77` reads `localStorage.getItem('auth_token')`. Nothing writes that key, so it always sends an empty bearer token — dead code, not a leak.
- **The auth cookie does not hold a Supabase token.** It holds an app-minted HS256 JWT signed with `JWT_SECRET`; Supabase is used only to verify credentials. `server/context.ts:31-34` also accepts an `Authorization: Bearer` header, so httpOnly is not a complete defence on its own.

**Classification: MODIFY** — documentation only.

## 4. What this changes

| Finding | Needs | Blocked by |
|---|---|---|
| FINDING-08 | A new packet — migration ownership, live schema capture, `db:migrate` made safe | Nothing. Independent of Sprint 0 sequencing |
| FINDING-09 | A packet, or an addition to whichever packet lands the WP-0001 deletions | WP-0001 |
| FINDING-10 | A packet, or inclusion in WP-0003 (it is the same fabrication class) | Nothing |
| FINDING-11 | Ride-along with the next packet touching those files | Nothing |
| FINDING-12 | Edits to `CLAUDE.md` and `SPRINT0_AUDIT_PLAN.md` | Nothing |

## 5. Open decisions

1. **FINDING-08 needs a human decision before a packet can be written:** does Drizzle or the Supabase CLI own migrations going forward? Both are wired into the repository today, only one has ever run against production, and the answer determines whether `db/migrations/` is reconciled or removed.
2. **FINDING-09 touches an approved decision.** PDR-0006 names `server/router.test.ts` as the control preserved when the eight routers are deleted. If that control is narrower than the decision assumes, PDR-0006 may need an amendment rather than a silent packet.
