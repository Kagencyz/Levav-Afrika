# Engineer handover — 2026-08-13

**From:** Claude (Product Command) · **For:** whoever picks up Engineering Command next
**Covering:** 2026-08-12 21:00 → 2026-08-13 07:00 UTC, worked solo while Engineering was down

---

## Read this first

**No code was touched.** Not `src/`, `server/`, `api/`, `db/`, tests, build config or deployment config. Every change in this window is documentation, Work Packets and decision records. The repository builds and tests exactly as it did before.

**Something you probably believe is wrong.** The "Verified ground truth" block in `CLAUDE.md` and the figures in `SPRINT0_AUDIT_PLAN.md` were re-measured and several were wrong. If you have numbers in your head from those documents, replace them with the table below before you scope anything.

**Before you measure anything yourself:** run `npm ci` and confirm `npx tsc --version` reports **5.9**. A fresh clone has no `node_modules`, and `npx tsc` will then pull TypeScript **6.0.2** from the registry, reject `baseUrl` as a config error, and exit **before checking a single file**. That looks exactly like a clean pass. It produced a wrong measurement in this very session before it was caught.

## Corrected figures

| Claim you may have | Measured truth |
|---|---|
| `npm run typecheck` covers the server | Covers **15 of 25** `server/`+`api/` files. `tsconfig.server.json` is a hand-maintained allowlist of 12 named files; ten files are never checked |
| Frontend has 156 type errors | **136 in `src/`.** The 156 came from `tsconfig.app.json`, which also includes `api`, `server`, `db`, `contracts` and tests |
| Tests are typechecked | **No gate typechecks any test file.** Two carry errors and pass green, including the blind spot around `server/router.test.ts` |
| `db/migrations/` is the schema of record | It has **never been applied to any database.** Production was built by a Supabase history mostly absent from this repo |
| `router.test.ts` guards reachability | It compares **procedure names only**. Aliasing and `lazy()` both bypass it |
| 12 files call tRPC | 10 invoke a procedure; **8 invoke one that is registered** |

Full evidence: `docs/product/GROUND_TRUTH_AUDIT_2026-08-13.md`. Corrections are also flagged inline at the top of `SPRINT0_AUDIT_PLAN.md` (C-1…C-6) and `STALE_INSTRUCTIONS_REGISTER.md`.

## Build order

**WP-0001 first. It blocks everything.** Its own dependency section says so, and this window added Amendment A2 to it.

1. **WP-0001** — repository truth, deletes the eight unreachable routers. Now also carries **Amendment A2**: strengthen `server/router.test.ts` so it fails when the *reachable* procedure set changes, not just the name set. Mechanism is yours; the property is not.
2. **WP-0002** — verification gates. **Amended**: two new items. Item 7 converts `tsconfig.server.json` from allowlist to globs — **do this after the WP-0001 deletions, where it costs zero errors.** Before them it turns 24 hidden errors into a failed Vercel deploy, because `build` is `typecheck && vite build`. Item 8 brings test files into a gate. The frontend baseline is **136**, not 156.
3. **WP-0005** — new. Migration ownership: capture the live Supabase history into the repo, delete `db/migrations/`, remove `db:migrate` and `db:generate`. Depends on WP-0001.
4. WP-0003, WP-0004 — unchanged.

## Three things that need a home

None of these are packeted yet. My recommended dispositions, for you to accept or argue with:

- **FINDING-10 — `NotificationBell` fabricates data.** Mounted twice by `Navbar`, calls four unregistered `trpc.notification.*` procedures, and on 404 falls back to `MOCK_NOTIFICATIONS` with a hardcoded unread count of 3. Users see invented notifications presented as real. Breaches invariant 9 and PDR-0009. **Recommend folding into WP-0003** — same fabrication class. Separately, `ReviewForm.tsx` and `FileUpload.tsx` call unregistered routers but have **zero importers and zero render sites**; they are dead files, not runtime failures, and belong with the WP-0001 deletions.
- **FINDING-11 — client-side role model.** `Projects.tsx:88-102` derives employer-vs-talent from `localStorage.getItem("role")`, and `useAuth.ts:29` labels every non-admin `talent` regardless of whether a `talents` row exists — the inverse of the server's derivation. Both inert today because nothing writes those keys. **Recommend ride-along** with whichever packet next touches those files. The risk is that it looks intentional and gets extended.
- **FINDING-12 — documentation drift.** Champions is a `localStorage` store, not `levavData.ts` prototype data; the auth cookie holds an app-minted JWT rather than a Supabase token, and a `Bearer` header is also accepted. **Handled in docs** where it appears; nothing for you unless you were relying on it.

## Decisions made in this window

- **PDR-0014** — the Supabase CLI owns migrations. Read the scope line carefully: **this governs migrations only. `drizzle-orm` stays** as the runtime query builder and `db/schema.ts` stays as the typed query surface. Removing the ORM is a defect, not an implication.
- **PDR-0006 Amendment A1** — the decision is unchanged (routers still deleted, test still kept). What changed is its confidence in the control. The test's silence on *authorisation* is recorded as a known property and explicitly **not** as a defect in the decision.

## Where the work is

Four branches, three open PRs, none merged at time of writing. All docs-only, all green.

| Branch | PR | Contents |
|---|---|---|
| `claude/code-setup-plugin-install-b9sbzl` | #16 | Verification-gate ground truth, WP-0002 amendment |
| `claude/ground-truth-audit-2026-08-13` | #17 | The audit, FINDING-08…12 |
| `claude/pdr-0013-migration-ownership` | #18 | PDR-0014 + WP-0005 (branch name says 0013; the record is 0014) |
| `claude/pdr-0006-amendment` | — | PDR-0006 A1 + WP-0001 A2. Held pending #17, since A1 cites FINDING-09 |

## Things I got wrong, so you can calibrate

Recorded deliberately — assume the rest of this document has a similar error rate.

1. **WP-0005 shipped with acceptance criteria it could not pass.** Test scenario 4 grepped the whole tree for terms the packet itself contains. Caught in review, fixed in `97c03b8`.
2. **WP-0005 claimed independence from WP-0001** on a file-contention argument, contradicting an existing sequencing contract. Caught in review, fixed.
3. **FINDING-10 originally claimed three runtime 404s.** Two of the three components are never mounted. Caught in review, fixed in `2156a75`.
4. **A first typecheck measurement was void** because of the `npx` version trap described above. Caught on re-check, and the trap is now documented everywhere it could recur.

Reviews caught 1–3. The review loop works; use it.
