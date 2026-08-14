# Sprint 0 — Acceptance Verdicts

**Owner:** Claude (Product Command). Codex reads this; Codex does not edit it.
**Review date:** 2026-08-12 · **Reviewed against:** commit `0f11ffb` plus the uncommitted WP-0002 working tree.

Verdicts were produced by running the gates and the negative tests independently. Reports were read afterwards, not instead.

---

## Verdicts

| Packet | Verdict |
|---|---|
| **WP-0001** — Repository truth and authority reset | **ACCEPTED** |
| **WP-0002** — Real verification gates and CI | **ACCEPTED** — re-reviewed 2026-08-12, no defects |
| **WP-0003** — Remove client-side WRI scoring | **ACCEPTED** |

WP-0001 and WP-0003 were accepted at `0f11ffb` in an earlier review; that commit is unchanged, is confirmed on `origin/agent/wp-0001-wp-0003` by SHA, and the verdict **stands**.

**The WP-0002 verdict is withdrawn.** See §0.

---

## 0. WP-0002 — withdrawal resolved, packet ACCEPTED

**Sequence of record, so the history is not misleading.**

The WP-0002 verdict was withdrawn on 2026-08-12 after Codex reported filenames (`scripts/check-frontend-types.mjs`, `typecheck.frontend-baseline.json`) and a baseline count (135) that did not match the tree Claude had reviewed. On that evidence Claude could not establish that it had reviewed Codex's artifact, and withdrew rather than let an unverified acceptance stand.

Codex has since formally submitted `agent/wp-0002-verification-gates` for review. Claude re-verified that branch:

- The tree is **byte-identical** to what was originally reviewed — same content hashes, unchanged mtimes.
- Baseline is **136 errors across 72 signatures**, matching Codex's submission.
- Codex's earlier report described a **different environment**, not a different deliverable. That environment is not the one under review and is not relevant to this verdict.

**Withdrawal lifted. WP-0002 is ACCEPTED.**

### D-0002-1 is VOID — and the fault was Claude's measurement, not Codex's code

The original finding claimed `npm run typecheck:baseline` exits 0 when refusing to grow the baseline. **That was wrong.**

`scripts/typecheck-baseline.mjs:36` calls `process.exit(1)` on the refusal branch, and a direct re-measurement confirms **exit = 1**.

The error: the original check ran `npm run typecheck:baseline 2>&1 | tail -6; echo "exit = $?"`, which captured **`tail`'s** exit status rather than npm's. Piping before reading `$?` reports the wrong code.

That is precisely the failure mode WP-0002 exists to eliminate — a gate reported as passing when it was not measured properly — committed by the reviewer while reviewing the gate. Codex was correct when it stated the refusal path already exits non-zero.

**Correction to method, now standing:** exit codes are measured directly on the command, never through a pipe.

---

## Independent verification — what Claude ran

### Positive gates

| Check | Result |
|---|---|
| `npm test` | **56 passing across 9 files** |
| `npm run typecheck` | Passes. Server project clean; frontend **136 current / 136 baselined** |
| `npm run build` | Runs the full type gate before Vite |
| Baseline file | `count: 136`, **72 signatures**, identity = file + TS code + flattened message |
| CI (`.github/workflows/verify.yml`) | install → typecheck → test → build, on `push` and `pull_request`. No deploy step. No secrets required |
| Lint | Deferred; orphan `eslint.config.js` deleted. One of the two outcomes WP-0002 §6 permitted |

### Negative tests — all five verified

| # | Test | Result |
|---|---|---|
| 1 | New frontend error vs `npm run typecheck` | **Fails, exit 1.** Names the file, code and message |
| 2 | New frontend error vs `npm run build` | **Fails, exit 1, and Vite never runs** — no build output produced |
| 3 | Baseline regeneration with an extra error | **Refuses, exit 1.** "Refusing to grow the frontend baseline from 136 to 137." File unchanged at 136 |
| 4 | Reintroduced WRI-writing export | **Guard fails** (`src/lib/wriRetirement.test.ts`) |
| 5a | Adding a registered tRPC procedure | **Exact-surface test fails** |
| 5b | Removing a registered tRPC procedure | **Exact-surface test fails** |

Temporary files used for these tests were deleted and `server/router.ts` restored; the working tree was confirmed byte-identical to its pre-review state, and the full suite re-run green.

---

## Defects

### D-0002-1 — **VOID** — raised against the wrong artifact (see §0)

The finding below described `scripts/typecheck-baseline.mjs` in an unattributed local tree. Codex's implementation, `scripts/check-frontend-types.mjs`, already exits non-zero on refusal. Retained only so the record shows what was claimed and why it was withdrawn.

~~### D-0002-1 — S3 — `typecheck:baseline` reports success when it refuses~~

`npm run typecheck:baseline` correctly refuses to grow the baseline and correctly leaves the file unchanged — but **exits 0**.

A developer or script that runs it, sees exit 0 and assumes the baseline was regenerated will commit a stale baseline and be confused when CI disagrees.

This does not block acceptance: the enforcing gate (`typecheck`) exits 1 correctly, and CI runs that. It is recorded because it is the same failure shape this packet exists to remove — a command that reports success while not doing the thing. The refusal path should exit non-zero.

**Fix when convenient**, not as a blocking round.

---

## Re-review evidence — all sixteen submitted items verified

Verified 2026-08-12 against `agent/wp-0002-verification-gates`, tree confirmed unchanged by content hash.

| # | Submitted claim | Verified |
|---|---|---|
| 1 | Baseline exactly 136 errors | ✅ 136 / 72 signatures |
| 2 | `typecheck` covers clean server + baselined frontend | ✅ both run; server clean |
| 3 | An existing baselined error passes | ✅ passes at 136 |
| 4 | New error raises 136 → 137 and fails the gate | ✅ fails, exit 1, names file/code/message |
| 5 | `build` fails at typecheck, Vite never runs | ✅ exit 1, no Vite output |
| 6 | `typecheck:baseline` refuses 136 → 137 | ✅ refuses, **exit 1**, file unchanged |
| 7 | Temporary proof error removed | ✅ tree carries only the six intended changes |
| 8 | `npm ci` succeeds | ✅ exit 0 — lockfile in sync with the modified `package.json` |
| 9 | 56 tests across 9 files | ✅ re-run after clean install |
| 10 | Production build succeeds on the clean tree | ✅ |
| 11 | CI runs install, typecheck, test, build on push and PR | ✅ `.github/workflows/verify.yml` |
| 12 | No deploy step; no `DATABASE_URL` or Supabase key | ✅ |
| 13 | `eslint.config.js` deleted, lint explicitly deferred | ✅ — one of the two outcomes WP-0002 §6 permitted |
| 14 | `IMPLEMENTATION_STATE.md` records verified figures | ✅ 56/9, 0 server errors, 136 baseline |
| 15 | `OPEN_DEFECTS.md` reads "None" | ✅ on this branch |
| 16 | Auth, routes, database, API and user-visible behaviour unchanged | ✅ no change under `src/`, `server/`, `db/`, `api/` |

## Authorisation and PR base

**Codex is authorised to commit, push `agent/wp-0002-verification-gates` and open a draft PR.**

**Base the PR on `agent/wp-0001-wp-0003`, not on `main`.** This branch is stacked on `0f11ffb`, which PR #15 carries. Basing on `main` would show WP-0001 and WP-0003 changes inside the WP-0002 diff and make the review meaningless. GitHub retargets a stacked PR to `main` automatically when #15 merges.

Merge order stays: **PR #15 first, then WP-0002** — that is the order the figures were measured in.

## Reporting discrepancies — for accuracy, not fault

The chat summary relayed to Claude said "135 errors" and "10 test files". The tree says **136** and **9**. `docs/implementation/IMPLEMENTATION_STATE.md` records **136** and **9** — so Codex's committed document is correct and the chat relay drifted. No action needed; noted so future reviews trust the committed figures over any summary.

---

## Blocking process finding — not a packet defect

**None of the accepted work is on `main`.**

| Item | Where it actually is |
|---|---|
| WP-0001 + WP-0003 (`0f11ffb`) | Pushed to `origin/agent/wp-0001-wp-0003`. **PR #15 is open and unmerged** |
| WP-0002 | **Uncommitted**, in a local working tree only. Not committed, not pushed |
| `docs/agent-handoffs/codex/WP-0002-ready-for-review.md` | **Does not exist** in any branch |
| `docs/agent-handoffs/codex/WP-0003-ready-for-review.md` | **Does not exist** in any branch |
| `docs/agent-handoffs/codex/WP-0001-ready-for-review.md` | Exists, on `origin/codex/check-system-status` only |
| `docs/implementation/IMPLEMENTATION_STATE.md` | On `origin/codex/check-system-status`, and uncommitted locally |

`main` today still contains `src/lib/wriService.ts`, `server/routes/employer.ts`, `contracts/index.ts`, `src/lib/auditService.ts` and the server-only `typecheck` script. **The defects WP-0001 and WP-0003 removed are still live on `main`.**

### Required actions, in order

1. **Commit WP-0002** on its branch and push it.
2. **Merge PR #15**, then the WP-0002 branch — or merge both together. WP-0002 was measured on top of `0f11ffb`, so that order is the tested one.
3. **Publish the WP-0002 and WP-0003 reports** to `docs/agent-handoffs/codex/`, and bring `IMPLEMENTATION_STATE.md` onto `main`.
4. Re-run CI on `main` after the merge and confirm green.

Acceptance is not delivery. Until this lands on `main`, a fabricated WRI and eight unreachable routers remain in the product's trunk.

---

## Next packet sequence — confirmed

Product Command confirms the order:

1. **WP-0004** — typed copy architecture. **May proceed immediately**, in parallel with the merges above. It touches `src/copy/`, `package.json` and three surfaces; it does not touch the evidence chain, the router surface or the baseline mechanism, so it cannot conflict with the merge.
2. **WP-0101** — career taxonomy
3. **WP-0102** — intelligent onboarding *(amended — see Amendment A1 and PDR-0014)*
4. **WP-0103** — professional profile
5. **WP-0105** — Personal Home on real services *(now issued)*
6. **WP-0106** — organisation membership, verification and employer context *(now issued)*
7. Evidence and WRI chain — Sprint 2, then Sprint 3 — only after the above are ACCEPTED

One standing constraint from `SPRINT2_PLAN.md`: Sprint 1 and Sprint 2 must not run concurrently on the migration chain (§43). WP-0104 remains the only packet safe to run in parallel with anything.
