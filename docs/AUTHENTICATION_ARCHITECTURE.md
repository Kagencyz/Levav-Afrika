# Authentication Architecture

**Status:** Accepted (approved with amendments, 2026-07-23). Not yet implemented. No application code changed as part of writing this document — implementation requires a separate approval checkpoint, per `docs/NEXT_MILESTONE.md`.

## Verdict: retain the existing JWT design, change its transport

`api/lib/jwt.ts` (`jose`, 7-day expiry, `clockTolerance: 60s`) and `api/lib/password.ts` (`bcryptjs`, cost 12) are already correct in isolation — confirmed by direct code review in `docs/SECURITY_AUDIT.md`. **Retain both as-is.** The one deliberate change recommended: **move the token from client-readable `localStorage` to an `httpOnly`, `Secure`, `SameSite=Lax` cookie**, set by the server on register/login and read server-side from the request — not attached manually by client JS reading `localStorage`.

Why: today's design has the frontend read `auth_token` out of `localStorage` and attach it as a `Bearer` header (`src/providers/trpc.tsx`). Any XSS on the page can read that token directly. An `httpOnly` cookie is invisible to page JavaScript, closing that specific theft vector, at the cost of needing scoped CORS (`origin` must be an explicit allow-list, not `'*'`, and requests need `credentials: 'include'`) — which the security baseline already requires fixing regardless (see `docs/SECURITY_AUDIT.md`). This is a contained change: `api/context.ts` reads the cookie instead of an `Authorization` header, `api/boot.ts`'s CORS config gets scoped origins + `credentials: true`, and `src/providers/trpc.tsx`'s link config passes `credentials: 'include'` instead of manually building a Bearer header. No new session store, no new token format — the JWT itself is unchanged.

**Explicitly not adopted:** a database-backed session table, or delegating authentication to Supabase Auth. Both are legitimate alternatives in general, but out of scope here — the existing JWT code is already correct, and replacing it wholesale would be a larger, riskier change than this milestone calls for. (Choosing Postgres/Supabase as the *database*, per `docs/adr/001-database-platform.md`, does not imply adopting Supabase's *auth* product.)

## Flows

### Registration

1. Client submits `{ email, password, role }` where `role` is restricted to `'talent' | 'employer_member'` only — **the registration endpoint must reject or ignore any attempt to set `role: 'admin'`**, enforced server-side in the zod input schema (an enum of exactly those two values), not just in the UI. Champion status is never set at registration (see Role assignment, below).
2. Server checks for an existing user with that email.
   - If found: return a clear `409`-style error, **"email already in use."** (Registration is the one endpoint where revealing existence is normal and expected — nearly every production system does this. Enumeration hardening applies to login, not registration — see Security baseline.)
   - If not found: hash the password with `bcryptjs` (cost 12, unchanged), insert the `users` row, issue a JWT, set it as the `httpOnly` cookie, and return the created user's public fields (never the password hash).
3. Password policy (new, not previously enforced anywhere): minimum 8 characters. Enforced server-side via zod on the register input — the client-side checks in `Auth.tsx` are a UX nicety, never the source of truth.

### Login

1. Client submits `{ email, password }`.
2. Server looks up the user by email.
   - **If not found:** still runs a dummy `bcrypt.compare` against a fixed placeholder hash before responding, so the response time doesn't leak whether the email exists via a timing side-channel. Returns the same generic error as a wrong password.
   - **If found but password wrong:** returns the same generic error.
   - **Error message in both cases:** `"Invalid email or password"` — never distinguish which part was wrong. This is the account-enumeration protection for login specifically (unlike registration, where existence is intentionally revealed).
3. On success: issue JWT, set as `httpOnly` cookie, return the user's public fields.

### Logout

Server clears the cookie (sets it expired/empty). Client-side, `useAuth.ts` clears any cached copy of the user object it's holding for optimistic UI (see Server-authoritative identity, below) — but logout is only truly complete once the cookie is cleared server-side; there is no server-side session/token revocation list in this milestone (see Token refresh/expiry).

### Current-user retrieval (`me`)

`trpc.auth.me` reads the cookie, verifies the JWT (`jose`), loads the user from the database by the JWT's `userId`, and returns their current public fields. **This is the single source of truth for "who is logged in."** No other code path may assert identity.

### Password hashing

Unchanged: `bcryptjs`, cost factor 12, via `api/lib/password.ts`. Already correct.

### Session / token storage

Changed, per the verdict above: `httpOnly` + `Secure` (in any non-`localhost` environment) + `SameSite=Lax` cookie, not `localStorage`. `SameSite=Lax` (not `Strict`) so top-level navigation into the app from an external link still carries the cookie; not `None`, since there's no legitimate need for cross-site delivery here.

### Token refresh / expiry

**Keep it simple for this milestone: 7-day expiry, no refresh-token rotation.** When the JWT expires, `me` fails, the client treats that as logged-out, and the user re-authenticates. Building refresh-token rotation now would be speculative complexity for an MVP vertical slice — explicitly deferred to a later hardening milestone once there's a real reason to need it (e.g., mobile app sessions, much longer-lived sessions).

### Duplicate email handling

See Registration, above: revealed intentionally as "email already in use," a `409`-equivalent tRPC error.

### Invalid credentials

See Login, above: generic "Invalid email or password" for both nonexistent-email and wrong-password cases, including the dummy-hash timing mitigation.

### Role assignment

- Registration may only set `'talent'` or `'employer_member'` (see §3 of `docs/NEXT_MILESTONE.md` for the full role/tenant model — employer is an **organization**, not just a role, and organization membership is a separate concern from the platform-level `role` field).
- `'admin'` is never self-assignable — seeded/assigned out-of-band only (e.g., directly in the database by an operator).
- `'champion'` status is not part of the `role` enum at all in the target model — it's an earned status via the existing `ChampionApply` flow (approval process, out of scope for this milestone to build, but the schema shouldn't conflict with it existing later — see `docs/NEXT_MILESTONE.md`).

### Protected routes

Server-side: `authedProcedure` (already exists in `api/router.ts`, requires `ctx.user` to be present) gates any mutation/query that needs identity. For this milestone's talent-profile slice specifically: an ownership check (`ctx.user.userId === profile.userId`) gates update access — a talent can only ever modify their own profile, never another user's, verified server-side on every request regardless of what the client believes about its own state.

Client-side: `ProtectedRoute.tsx` continues to gate route rendering, but must be updated to treat `trpc.auth.me`'s result as authoritative (see next) rather than a `localStorage`-derived `isValidUser()` check.

### Server-authoritative identity

**The client must never trust its own cached state for authorization decisions.** Today, `useAuth.ts` blends `trpc.auth.me` with a `localStorage`-derived fallback (`localUser`), and because the backend has never run, the fallback is in practice the *only* thing driving auth state — this is precisely the fake-auth problem documented in `docs/SECURITY_AUDIT.md`. Going forward: `trpc.auth.me` (backed by the real, verified cookie/JWT) is the sole source of truth for "who is the current user." A cached copy of the last-known user object may still be kept client-side purely to avoid a flash-of-logged-out-state on page load, but it must be treated as a rendering hint only — every protected mutation is re-verified server-side regardless of what the client believes, and any mismatch (e.g., `me` returns null after a page's initial optimistic render) must immediately reflect the real, server-confirmed state.

## Sequence summary

```
Register:  client → POST register{email,password,role} → server checks email →
           hash password → insert user → sign JWT → Set-Cookie(httpOnly) → return user

Login:     client → POST login{email,password} → server looks up user (dummy-hash if missing) →
           compare bcrypt → sign JWT → Set-Cookie(httpOnly) → return user

Me:        client → GET me (cookie sent automatically) → verify JWT → load user → return user

Logout:    client → POST logout → server clears cookie

Protected: client → any authedProcedure call (cookie sent automatically) →
           verify JWT → ctx.user set → ownership/authorization check → proceed or reject
```
