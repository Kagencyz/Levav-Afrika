# Security Audit

Consolidates the pre-existing `SECURITY_AUDIT_REPORT.md` (client-auth findings, verified still accurate) with new findings from this audit's code reading and diagnostic runs. All findings below were confirmed by reading the actual code, not inferred from filenames.

## Carried forward from the pre-existing `SECURITY_AUDIT_REPORT.md` (verified still true)

- **CRIT-001/002 (auth bypass via arbitrary localStorage token) — fixed.** `isValidToken()`/`isValidUser()` guards present and confirmed in `src/hooks/useAuth.ts:16-31` and `src/components/ProtectedRoute.tsx:10-13`.
- **HIGH-001 (no rate limiting) — fixed.** `src/pages/Auth.tsx:12-14,42-75` implements a 5-attempts/30-second cooldown.
- **HIGH-002 (incomplete logout cleanup) — fixed.** `useAuth.ts:58-68` removes 8 localStorage keys on logout.
- **HIGH-003 (no input validation) — fixed.** `Auth.tsx` uses `sanitizeInput`/`isValidEmail` from `src/lib/safeJSON.ts`.
- **LOW-001 — still true and important:** *the entire authentication system is client-side only.* `Auth.tsx` accepts any email/password combination, generates a `Math.random()` user id, and mints a `demo_token_<timestamp>` string — there is no password check, no backend call, no credential verification of any kind. This was already self-documented as an "acknowledged demo/static deployment limitation," and remains true today.
- **MED-004 — still true:** real-looking hardcoded employer data (e.g. `hr@bongohive.co.zm`, an actual company) appears in `Admin.tsx`'s mock arrays and is duplicated in `db/seed-rich.ts`. Using a real company's name/domain in placeholder data is worth reconsidering before any public demo.

## New findings from this audit

### Backend authorization gaps (in code that doesn't currently run, but would matter immediately if wired up)

- **`api/routes/employer.ts` — broken, not just insecure.** Three call sites (lines ~30, 75, 138) read `ctx.user.id`, but the JWT context (`api/context.ts` + `api/lib/jwt.ts`) only ever produces `{ userId, email, role }` — there is no `.id` field. `employer.register`, `employer.myProfile`, and `employer.verify` would all operate with `userId: undefined`, either violating the `employers.userId` NOT NULL constraint or silently querying the wrong (or no) rows. This must be fixed before this route is ever deployed, not worked around.
- **`api/routes/application.ts#updateStatus`** — authenticated but has **no ownership/authorization check at all**. Any logged-in user (of any role) can change the status of any application, not just their own or one for a job they own.
- **`api/routes/application.ts#byJob`** — authenticated but does not verify the requesting user actually owns the job in question before returning its applicant list.
- **`api/routes/notification.ts#create`** — any authenticated user can create a notification targeted at any other arbitrary `userId`, with no restriction that only the system or an admin should be able to do this (spam/social-engineering vector).
- **`api/routes/upload.ts#getPresignedUrl`** — this procedure is **public** (no auth required at all). Any unauthenticated visitor can request a presigned S3 upload URL for an arbitrary key. This is the most serious of the backend findings — it would allow anonymous arbitrary file uploads to the bucket if the backend were deployed as-is.
- **`api/routes/review.ts#create`** — no check that the reviewer actually had a completed booking with the reviewee before allowing a review to be posted.

*(All of the above are currently unreachable since the backend doesn't run — see `docs/ARCHITECTURE.md` — but they must be fixed as part of wiring it up, not discovered later in production.)*

### Configuration/infra findings

- **CORS is wide open** in `api/boot.ts` (`origin: '*'`) alongside credentialed-looking Bearer auth. Fine for early local dev, not acceptable as shipped configuration — should be scoped to known origins before any real deployment.
- **`JWT_SECRET` has a hardcoded fallback** (`'levav-dev-secret-change-in-production'` in `api/lib/jwt.ts`) if the env var is unset. Reasonable as a dev convenience, but a real risk if the backend is ever deployed without explicitly setting `JWT_SECRET` — consider making the app refuse to boot without it in a production-like environment.
- **`VITE_S3_*` naming smell** — the S3 credentials in `.env.example` are prefixed `VITE_`, which conventionally denotes variables Vite bundles into the client-side build. They are, in fact, only read server-side via `process.env` in `api/lib/s3.ts`, so there's no actual client exposure today — but the naming invites a future mistake (e.g., someone referencing `import.meta.env.VITE_S3_SECRET_KEY` from frontend code by habit). Recommend renaming to a non-`VITE_`-prefixed set of names once the backend is wired up.
- **No `.env` file exists in the repo** — correctly gitignored. `.env.example` contains only placeholder values, no real secrets. Confirmed by direct inspection.
- **Inconsistent error types:** most tRPC procedures throw plain `Error('UNAUTHORIZED'/'FORBIDDEN')` (in `api/router.ts`'s middleware) rather than `TRPCError`, which won't map to correct tRPC error codes or HTTP status codes on the wire. `auth.ts` correctly uses `TRPCError`; the rest do not. Minor but worth fixing for consistent client-side error handling once connected.

## What this means practically, right now

Because the backend does not run, none of the backend-side findings above are currently exploitable — there is no live endpoint to attack. The **live, practical exposure today is entirely the fake client-side auth** (already documented, already acknowledged as a demo limitation). The backend findings are pre-emptive: they must be fixed as part of the migration described in `docs/NEXT_MILESTONE.md`, before any real user data or credentials touch this code.
