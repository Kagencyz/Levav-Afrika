# Frontend–Backend Connection Matrix

**Status:** Evidence-based, current `main` only (`bda184c`). This is the connection-level detail underneath `PRODUCT_SURFACE_INVENTORY.md`'s maturity ratings.

## The headline fact

Grepping all of `src/` for `trpc.*` call sites returns **6 call sites in 3 files, total**. The frontend tRPC client is untyped (`createTRPCReact<any>()` — no `AppRouter` import), so nothing catches a mismatch at compile time. Of the two registered, working procedure groups (`auth`, `talent`), **zero pages call them**. Of the components that do call `trpc.*`, most call procedures that don't exist on the registered router at all.

## Registered vs. called

| Namespace | Registered in `appRouter`? | Procedures | Called from frontend? |
|---|---|---|---|
| `auth` | Yes | `register`, `login`, `me` | `me` — yes (`useAuth.ts:35`). `register`/`login` — **no**, `Auth.tsx` bypasses the network entirely |
| `talent` | Yes (partial: 3 of 6 written procedures) | `createOwnProfile`, `updateOwnProfile`, `getOwnProfile` reachable; `list`, `getById`, `delete` written but not exposed | **No page calls any of the three reachable procedures** |
| `notification` | **No** | n/a | `NotificationBell.tsx` calls `trpc.notification.unreadCount/list/markRead/markAllRead` anyway — **these calls will fail at runtime** with a procedure-not-found error every time the component mounts |
| `review` | **No** | n/a | `ReviewForm.tsx` calls `trpc.review.create` — same failure mode, but the component is dead code (never imported), so the failure is latent, not live |
| `employer`, `job`, `application`, `message`, `upload`, `wri` | No (written, deliberately unregistered — "Stage A" exclusion) | See below | Not called from anywhere — consistent, since nothing to call |

## Why `auth.me` never resolves to anything real

`useAuth.ts` treats `trpc.auth.me` as a fallback (`serverUser || localUser`). But the `Authorization` header sent by the tRPC client is read from `localStorage.getItem('auth_token')` — which is always a client-fabricated `demo_token_<timestamp>` string, never a real JWT, because `Auth.tsx`'s login/register handlers never call the real `auth.login`/`auth.register` mutations that would produce one. So `trpc.auth.me` always fails JWT verification server-side and returns `null`. The one live trpc call in the app is structurally guaranteed to always come back empty until `Auth.tsx` is rewired.

## Why the "Stage A" routers stay unregistered, and what's actually wrong with them

These aren't just unfinished — several import tables (`employers`, `jobs`, `applications`, `messages`, `notifications`, `reviews`) that **don't exist in `db/schema.ts`** at all (schema.ts only has `users`, `talents`, `organizations`, `organizationMembers`), and use MySQL-style insert patterns incompatible with the current Postgres driver. They are leftovers from a pre-rework iteration, not code that's one flag-flip away from working. Specific bugs found, beyond the missing tables:

| File | Bug | Consequence if ever registered as-is |
|---|---|---|
| `server/routes/employer.ts` | Uses `ctx.user.id` throughout; JWT payload only has `userId` | Every procedure using it (`register`, `myProfile`, `verify`) breaks — `ctx.user.id` is always `undefined` |
| `server/routes/job.ts` | Admin-bypass check uses `ctx.user.role`, which doesn't exist (`accessLevel` is the real field) | Admin override silently never works; non-admin ownership check still functions |
| `server/routes/application.ts` | `byJob`/`updateStatus` have no ownership check | Any authenticated user could list applicants for any job or change any application's status |
| `server/routes/notification.ts` | `create` takes an arbitrary `userId` with no relationship check | Any authenticated user could create a notification addressed to any other user |
| `server/routes/upload.ts` | `getPresignedUrl` is `publicProcedure` — fully unauthenticated | Anyone, logged in or not, could obtain a presigned S3 PUT URL |
| `server/routes/message.ts` | Correctly scoped | No issue found |
| `server/routes/review.ts` | `create` doesn't verify the caller was actually part of the referenced booking | Fabricated reviews possible |
| `server/routes/wri.ts` | Single `get` procedure, unconditional `null` stub | No real logic exists yet regardless of auth |

These are documented in `docs/NEXT_MILESTONE.md` as known, deliberate exclusions — this matrix confirms them against the actual code and adds the specific bug locations for whoever picks this work up.

## The Admin panel data bug (already flagged in `PRODUCT_SURFACE_INVENTORY.md`, detailed here)

`src/lib/safeJSON.ts`'s `safeJSONParse(key, fallback)` expects a **storage key string** — it calls `localStorage.getItem(key)` internally. Five admin Section components instead pass the *already-dereferenced value*:

- `src/components/admin/JobsSection.tsx:146`
- `src/components/admin/EmployersSection.tsx:136`
- `src/components/admin/UsersSection.tsx:55-56`
- `src/components/admin/CandidatesSection.tsx:62`
- `src/components/admin/ApplicationsSection.tsx:204-205`

Each does `safeJSONParse(localStorage.getItem("some_key"), fallback)`. Internally this becomes `localStorage.getItem(<a JSON string>)`, which never matches a real key, so the function always returns `fallback` — the hardcoded `MOCK_*` array. Net effect: these five Admin sections **permanently and silently display only mock data**, never anything a real user did (a job posted, an application submitted, a profile created), even though the underlying `localStorage` data these pages are trying to read genuinely exists and is written correctly elsewhere (`EmployerJobs.tsx`, `JobApply.tsx`, `Onboarding.tsx`). This is a one-line fix per file, but it's exactly the "rendered page is not a completed feature" failure mode the product mandate calls out, and should be treated as a real bug, not stylistic debt.

## Empty/error/loading state audit (spot findings)

- `NotificationBell.tsx`'s footer "View all notifications" link points to `/notifications`, a route that **does not exist** in `App.tsx` — a guaranteed dead end/404 on every click.
- `ProfileCreate.tsx` explicitly punts image upload to a raw-URL paste field with "S3 upload support coming soon," despite `FileUpload.tsx` being a complete, working, never-wired component in the same tree.
- `Levav28.tsx`'s certificate download is a bare `alert("Certificate download coming soon!")` — a genuine dead-end button, not a placeholder state with a clear next step.
- Footer social icons (`Footer.tsx:147-169`) are `href="/"` with `preventDefault()` — deliberately inert, at least honestly so (no fake destination).

## What "complete" requires going forward

Per the product mandate, a rendered page is not a completed feature. Every new connection built during Phase One implementation must be checked against: interface works → data validated → permissions enforced → data stored → the right user can retrieve it → the wrong user cannot → errors are handled → evidence is auditable → the user receives real value. This matrix should be extended (not rewritten) as each `INTEGRATION_ROADMAP.md` slice lands, so it stays the living source of truth for "what's actually connected" rather than going stale the way `CLAUDE.md`/`docs/CURRENT_STATE.md` already have.
