# Security and Privacy Review

**Status:** Read-only findings from this phase's audit. No secret values are reproduced anywhere in this document — only variable names, file locations, and risk categories, per the safety constraints this phase operated under.

## `main` — current, live codebase

| Finding | Severity | Detail |
|---|---|---|
| Fake client-side auth | High (by design, self-documented) | `Auth.tsx` issues a `demo_token_<timestamp>` to any email/password combination, no server round-trip. Already known/documented in `CLAUDE.md`. Must not be treated as real auth by any feature built before Stage C lands. |
| `server/routes/upload.ts`'s `getPresignedUrl` is fully unauthenticated | High if ever registered | `publicProcedure`, no auth, no key-prefix/ownership constraint — arbitrary anonymous S3 upload if this router is ever wired in as-is. Currently inert (unregistered), but must be fixed, not just left unregistered, before it's ever turned on. |
| `server/routes/application.ts` missing ownership checks | High if ever registered | `byJob` lets any authenticated user list applicants for any job; `updateStatus` lets any authenticated user change any application's status. Same "currently inert, must be fixed before registering" status as above. |
| `server/routes/notification.ts`'s `create` accepts an arbitrary `userId` | Medium if ever registered | Any authenticated user could address a notification to any other user, no relationship check. |
| `server/routes/employer.ts`'s `ctx.user.id` bug | Medium (already documented) | JWT payload only has `userId`; every procedure using `ctx.user.id` silently gets `undefined`. Already flagged in `docs/NEXT_MILESTONE.md` — confirmed still present. |
| `server/routes/job.ts`'s admin-bypass check references `ctx.user.role`, which doesn't exist | Low | Admin override silently never fires; the primary ownership check still functions for non-admins, so this fails safe rather than open. |
| Admin panel's `safeJSONParse` parameter-order bug | Not a security issue, but a trust/integrity issue | Documented in `FRONTEND_BACKEND_CONNECTION_MATRIX.md` — included here because "the admin dashboard silently shows fabricated data instead of real records" is exactly the kind of failure a security/trust review should flag even though it's not an access-control bug. |
| Frontend tRPC client is untyped (`createTRPCReact<any>()`) | Low/structural | Removes compile-time protection against calling nonexistent or mismatched procedures — already caused two live runtime failures (`NotificationBell.tsx`, dead `ReviewForm.tsx`) calling an unregistered `notification`/`review` namespace. Fix when Stage C work begins. |
| Login timing side-channel | Low | `server/routes/auth.ts`'s `login` short-circuits on "no such user" before any bcrypt compare — a timing difference exists between "user doesn't exist" and "wrong password," though the error message itself correctly doesn't distinguish them. `docs/AUTHENTICATION_ARCHITECTURE.md` already flags a dummy-hash mitigation as planned. |
| Backend dependency `@aws-sdk/client-s3`/`s3-request-presigner` used by `server/lib/s3.ts` but absent from `package.json` | Low/build-integrity | Would fail to resolve if the upload router is ever wired in and exercised outside whatever's transitively present in `node_modules` today. |

**No secrets found in `main`.** No `.env` is tracked (confirmed absent, `.gitignore` correctly excludes it); `.env.example` only lists variable names.

## `origin/backup-old-site` — archival only, never merged

**Highest-severity findings, ranked:**

1. **HIGH — Tracked `.env` in git history.** Present since the branch's first commit, alongside a `.gitignore` that already listed `.env` — a classic force-add-before-ignore leak pattern. Names present (not values, not read): `APP_ID`, `APP_SECRET`, `DATABASE_URL`, `KIMI_AUTH_URL`, `KIMI_OPEN_URL`, `OWNER_UNION_ID`. **Every credential this file may have held must be treated as compromised and rotated if it was ever a real, live credential** — regardless of the fact that this branch is archived and will never be merged, because the git history (and anything derived from it, e.g. a prior deploy) may already have exposed it.
2. **HIGH — `Dockerfile` bakes `.env` into the built image** (`COPY .env ./`), independently re-leaking the same secret set into any registry push. Container also runs as root (no `USER` directive).
3. **HIGH — Session JWT (1-year expiry) outlives its carrying cookie (30-day expiry), with the same signing secret (`APP_SECRET`) reused across two independent auth systems** (Kimi OAuth and local email/password). A single secret compromise breaks both; no server-side revocation exists.
4. **MEDIUM — OAuth `state` parameter has no cryptographic integrity check**, only base64 decode — a real CSRF gap in the Kimi OAuth callback flow.
5. **MEDIUM — Brute-force protection depends entirely on a spoofable `x-forwarded-for`/`x-real-ip`-keyed rate limiter**, with no application-level account lockout.
6. **MEDIUM — Production CSP allows `'unsafe-inline'` for both `script-src` and `style-src`**, materially weakening its XSS protection despite CSP being present at all.
7. **MEDIUM — Local email/password auth is structurally disconnected from request context** — its JWT authenticates nothing except its own `me` query, because `createContext` only ever calls the Kimi OAuth verifier. Anyone reviving this pattern must finish that wiring or drop one of the two systems; do not port both as-is.
8. **LOW — `whatsapp-router.ts`'s outbound `send` procedure is fully public/unauthenticated** — abuse/cost risk if Twilio credentials were ever live.
9. **LOW — Systemic unimported-`env` bug** across four files (`impact-router.ts`, `payment-router.ts`, `whatsapp-router.ts`, `trigger-dispatcher.ts`) guarantees an unhandled exception on those error paths — an integrity/reliability issue more than a security one, but evidence the branch was never fully integration-tested.
10. **LOW/INFORMATIONAL — The branch's own self-audit (`PRODUCTION_AUDIT.md`) is stale relative to its own code** — it claims missing CORS and rate limiting that later commits on the same branch actually implemented (strict origin allowlist, dual rate limiters). Don't trust either the code or the self-audit alone without cross-checking, which is what this review did.

**Positive findings, for balance:** `api/boot.ts`'s CORS policy is genuinely well-scoped (explicit origin allowlist, not wildcarded), real security headers are applied, cookie flags (`httpOnly` always, `secure`/`sameSite` environment-conditional and correct in both directions) are handled properly, and password hashing (bcrypt, cost 12) is standard and reasonable in both auth systems. This is a more security-conscious codebase than a typical prototype, undermined by the specific gaps above rather than by general neglect.

## Cross-codebase privacy considerations for Phase One design

These aren't findings against existing code (neither codebase has built this domain yet) — they're requirements to design in from the start, per `DATABASE_DOMAIN_GAP_ANALYSIS.md`'s Evidence and consent domains:

- **Evidence confidence/verification state must be a first-class field**, not just for trust (`WRI_CONCEPTUAL_MODEL.md`) but for privacy — self-reported vs. verified data may need different retention/correction/dispute handling.
- **Consent must be explicit and revocable** wherever a third party (development organisation, endorser, mentor) contributes evidence about a person — this is new domain scope, not present in either audited codebase, and should be designed before Slice 12 (development-organisation evidence contribution) begins.
- **Feedback content between two parties (mentor/mentee, interviewer/candidate) needs its own access rule**, not inherited from either party's general profile visibility — flagged in `DATABASE_DOMAIN_GAP_ANALYSIS.md`.
- **Talent DNA's free-text culture/behavioural fields are a bias-and-privacy dual risk** — the translation-table requirement in `EMPLOYER_TALENT_DNA.md` exists specifically to prevent both discriminatory matching and the accidental capture of protected-characteristic-adjacent data in a criteria field never designed to hold it.

## What this review does not cover

No penetration testing, no dependency/CVE scan, no infrastructure/cloud configuration review (no live deployment exists to review), and no legal/regulatory (data-protection law) analysis — all out of scope for a code-level read-only audit and worth commissioning separately before any real user data is collected in Phase One.
