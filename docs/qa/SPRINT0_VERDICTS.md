# Sprint 0 — Acceptance Verdicts

**Owner:** Claude (Product Command). Codex reads this; Codex does not edit it.
**Review date:** 2026-08-12 · **Reviewed against:** commit `0f11ffb` plus the uncommitted WP-0002 working tree.

Verdicts were produced by running the gates and the negative tests independently. Reports were read afterwards, not instead.

---

## Verdicts

| Packet | Verdict |
|---|---|
| **WP-0001** — Repository truth and authority reset | **ACCEPTED** |
| **WP-0002** — Real verification gates and CI | **WITHDRAWN — see §0. Awaiting re-review of the correct artifact** |
| **WP-0003** — Remove client-side WRI scoring | **ACCEPTED** |

WP-0001 and WP-0003 were accepted at `0f11ffb` in an earlier review; that commit is unchanged, is confirmed on `origin/agent/wp-0001-wp-0003` by SHA, and the verdict **stands**.

**The WP-0002 verdict is withdrawn.** See §0.

---

## 0. WITHDRAWN — WP-0002 was reviewed against the wrong artifact

**Recorded 2026-08-12, after Codex reported its environment state.**

Codex named two files that **do not exist** in the tree Claude reviewed:

| | Tree Claude reviewed | Codex's tree |
|---|---|---|
| Checker script | `scripts/typecheck-baseline.mjs` | `scripts/check-frontend-types.mjs` |
| Baseline file | `typecheck-baseline.json` | `typecheck.frontend-baseline.json` |
| Baseline count | 136 errors / 72 signatures | 135 errors / 72 signatures |
| Refusal path exit code | 0 — reported as defect D-0002-1 | 1 — already correct |

Different filenames, different counts, different behaviour. **These are two separate implementations of WP-0002, and the one Claude tested is not Codex's deliverable.**

**Provenance of what Claude tested:** uncommitted files on local branch `agent/wp-0002-verification-gates`, dated 12 August, on the product owner's machine. That branch has **never been pushed** and its author is unknown to Product Command. It may be an earlier attempt, another agent's work, or an abandoned draft. Claude should have established provenance before reviewing it and did not.

**Consequences:**

1. **The WP-0002 ACCEPTED verdict is withdrawn.** It is not transferable to Codex's implementation.
2. **Defect D-0002-1 is void.** It described the wrong artifact. Codex's refusal path already exits non-zero, which Codex verified in `scripts/check-frontend-types.mjs`.
3. **The 136-error baseline figure is not authoritative.** Codex's tree records 135. Neither has been reconciled against `origin/main`, and the correct figure is whatever a fresh checkout of the merged result produces.
4. **The uncommitted `agent/wp-0002-verification-gates` tree must not be merged.** Its provenance is unestablished. It should be set aside until someone can say where it came from.

**What is unaffected:** WP-0001 and WP-0003 were reviewed against commit `0f11ffb`, which is on `origin` and which Codex itself reported publishing as PR #15. That identification is by SHA, not by inference. Those verdicts stand.

**To re-review WP-0002**, Codex pushes its own branch and Claude reviews that, by SHA, with provenance established first.

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
| 3 | Baseline regeneration with an extra error | **Refuses.** "Refusing to grow the frontend baseline from 136 to 137." File unchanged at 136 |
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
