# WP-0002 — Real verification gates and CI

**Status:** READY_FOR_BUILD · **AMENDED 2026-08-12** — re-read before building if you read this packet before that date
**Sprint:** 0 · **Owner after handoff:** Codex
**Requirement IDs:** §46 Sprint 0 (Codex), §47.1, ENG-003, CODEX-005
**Audit classification:** MODIFY (`package.json` scripts, `tsconfig`) · BUILD (CI, error baseline)
**Related decisions:** PDR-0005, PDR-0006 (item 7 sequencing)

---

## Amendment log

**2026-08-12 — measurement under the pinned toolchain.** The packet was written against figures taken before the server gate's true coverage was known. Nothing already in it was withdrawn; scope grew by two items in the same requirement set (§47.1, ENG-003), and two stated figures were wrong.

- **Added item 7** — convert `tsconfig.server.json` from its 12-file allowlist to globs. Sequenced after WP-0001, where it costs zero errors.
- **Added item 8** — no gate typechecks any test file.
- **Corrected item 1** — "the server project is clean today" was true only of an allowlisted 15 of 25 files.
- **Corrected item 2** — the frontend baseline is **136**, not 156.
- Added acceptance criteria 9 and 10, test scenarios 7 and 8, and a verified-figures table.

Kept in WP-0002 rather than split into a new packet: the additions carry the same requirement IDs, touch the same `tsconfig` and `package.json`, and share the WP-0001 dependency. A separate packet would contend for the same files with no independent path to green.

## Product problem

`npm run typecheck` exits 0. The frontend has 136 TypeScript errors. The script points only at `tsconfig.server.json` — which is itself an allowlist covering 15 of the 25 files in `server/` and `api/` — and `npm run build` runs that same partial check before `vite build`.

Every agent, every CI job and every Definition-of-Done review that runs the documented gate receives a false pass. The Master PRD's Sprint 0 exit gate requires that "typecheck, tests and build have known verified states". Right now the state is known to be wrong and the gate reports it as fine.

There is also no CI. Nothing runs on push, so nothing prevents a regression from reaching `main`.

## User journey

None directly. This packet is what makes every later acceptance review mean something.

## Verified figures at handoff

Measured on `claude/code-setup-plugin-install-b9sbzl` @ `e8f3ea3`, under `npm ci` with the pinned TypeScript 5.9.3. Codex should reproduce these before starting; a mismatch means the tree moved and this packet needs re-scoping.

| Figure | Value |
|---|---|
| `npm test` | 56 tests, 8 files, passing |
| `npm run typecheck` (server project, as shipped) | 0 errors — over 15 of 25 `server/`+`api/` files |
| Server project, globbed | 24 errors in 7 files (item 7) |
| `tsconfig.app.json` total | 156 errors — **136 `src/`**, 18 dead routers, 2 test files |
| `npm run build` | succeeds; 2,523.74 kB JS / 638.49 kB gzip, 133.80 kB CSS; 11.33s vite, ~15s wall |

**Do not measure any of these with `npx tsc` in an uninstalled tree.** It resolves TypeScript 6.0.2 from the registry instead of the pinned `~5.9`, which rejects `baseUrl` as a config error and exits before checking a single file — a false clean pass. Run `npm ci` and confirm `npx tsc --version` reports 5.9 first.

## In scope

1. **Make `typecheck` cover both projects.** `npm run typecheck` runs `tsconfig.server.json` **and** `tsconfig.app.json` and reports both. The server project must continue to exit non-zero on any error.

   **The server project is not as clean as it looks.** `tsconfig.server.json` includes a hand-maintained allowlist of 12 named files, so it checks 15 of the 25 files in `server/` and `api/` — three arrive transitively through `router.ts`, and ten are never checked at all. "Green server typecheck" today means "green on 60% of the server". Item 7 fixes this; until it lands, do not read the server project's exit code as covering the server.
2. **Commit a frontend error baseline** (PDR-0005). A checked-in file records the current known frontend errors, keyed stably enough to survive line moves (file + error code + message is acceptable; choose and justify). Provide `npm run typecheck:baseline` to regenerate it deliberately.

   **The baseline is 136, not 156.** `tsconfig.app.json` is not a frontend project — its include is `["src", "api", "server", "db", "contracts"]`, so it re-checks the whole server on looser settings and with tests included. Of its 156 errors, **136 are in `src/`**, 18 are in dead routers WP-0001 deletes, and 2 are in test files (item 8). Baselining 156 records 20 errors that are not frontend and that mostly disappear the moment WP-0001 lands, which fails acceptance criterion 2 on the next fresh run. Either narrow the app project to `src` or scope the baseline to `src/` and say which you chose. Running both configs unnarrowed also double-reports every server file — once strictly, once loosely.
3. **Gate on the delta, not the total.** A new error not in the baseline fails. A reduced count updates the baseline in the same commit. **The baseline may never grow** — if a packet increases it, that packet fails.
4. **CI on push and pull request**, running: install, `npm run typecheck`, `npm test`, `npm run build`. All four must pass for green.
5. **Record the verified numbers** in `docs/implementation/IMPLEMENTATION_STATE.md` (create it if absent): test count, server error count, frontend baseline count, bundle size, build time. These are the reference figures Claude reviews future packets against.
6. **Lint decision.** `eslint.config.js` exists with none of its dependencies installed. Either install and configure it so it runs clean, and add it as a gate; or delete the orphan config and state in the report that lint is deferred. Do not leave a config file that cannot run — that is another false signal. §47.1 makes lint a gate only "once a working lint script and dependencies are intentionally configured".

7. **Convert `tsconfig.server.json` from an allowlist to globs.** Replace the 12 named file entries with `api/**/*.ts` and `server/**/*.ts` (keep `db/**` and `contracts/**`, keep the `**/*.test.ts` exclude). An allowlist decays silently — every server file Codex adds from here on sits outside the gate until someone remembers to edit the include list, which is the same class of false signal this packet exists to remove.

   **Measured cost, `cf4ef15` under `npm ci` with the pinned TypeScript 5.9.3: zero, once WP-0001 lands.** Globbed today the server project reports 24 errors in 7 files — but every one of those files is deleted by WP-0001 step 4 under PDR-0006, except `server/lib/s3.ts` (2 errors, uninstalled `@aws-sdk/*`), which is imported only by `upload.ts` and is orphaned by the same deletion. Do this item **after** the WP-0001 deletions and it costs nothing. Do it before, and it converts 24 hidden errors into a failed Vercel deploy, because `build` is `typecheck && vite build`. If any error survives the deletions, stop and report rather than widening the exclude list — re-narrowing the gate to make it pass defeats the packet.

8. **Put test files inside a gate.** `tsconfig.server.json` excludes `**/*.test.ts` and Vitest does not typecheck, so no gate checks any test file. Two carry errors today and their tests still pass green: `server/routes/auth.test.ts(71,35)` — `Property 'setToken' does not exist on type '{}'` — and `server/lib/vercelRequest.test.ts(11,13)` — TS2352 on a `rawBody` cast. Both test files that WP-0001 keeps. A test asserting against a type the compiler would reject is a weak test, and `server/router.test.ts` — the control PDR-0006 explicitly preserves — sits in this same blind spot. Bring test files into a checked project and fix these two, or state why they stay excluded. Do not fix them by loosening the assertion to `any`.

## Out of scope

- **Fixing the 156 frontend errors.** They are recorded, not repaired. Fixing them wholesale is a frontend rewrite, and ENG-005/§48 forbid a blind rewrite.
- Bundle-size work (FINDING-06) — Sprint 10, or whichever Feed packet lands first.
- Test-coverage expansion beyond keeping the suite green.
- Any product behaviour change.

## Existing behaviour to preserve

- `npm test` keeps passing at ≥56 tests.
- `npm run build` keeps producing a working Vercel deployment. If `build` now runs a slower gate, keep total build time reasonable and report it.
- The server project stays at zero errors — and after item 7, at zero errors across all of `server/` and `api/`, not across an allowlisted subset of it.

## Acceptance criteria

1. `npm run typecheck` reports errors from both projects. Demonstrated by introducing a deliberate error in a `src/` file and showing the command fail, then reverting.
2. A baseline file is committed, and its recorded count matches a fresh run at the time of the report.
3. A **new** frontend error fails the gate; an error already in the baseline does not. Both demonstrated with command output.
4. `npm run build` fails when `typecheck` fails. No path exists to a green build over a broken frontend type.
5. CI runs on push and pull request, executes all four steps, and is green on `main`. Provide the workflow file path and a run URL or log.
6. `docs/implementation/IMPLEMENTATION_STATE.md` exists and records the five verified figures with the date and commit they were measured at.
7. Lint is either a working gate or explicitly deferred with the orphan config removed. No third outcome.
8. Auth, routes and deployment behaviour are unchanged.
9. `tsconfig.server.json` contains no per-file include entries for `server/` or `api/`, and `tsc -p tsconfig.server.json --listFiles` shows every non-test file in both directories. Report the file count and the error count; both must be stated, and the error count must be zero.
10. The committed baseline contains no `server/` entries, and its count matches a fresh `src/`-scoped run. A deliberate type error in a test file fails the gate, or the report states why test files remain unchecked.

## Data requirements

None.

## Privacy requirements

None. Confirm no secret, connection string or Supabase key is exposed in CI logs, and that CI does not require production credentials to run these four steps.

## Security considerations

- CI must not need `DATABASE_URL` or any Supabase key for typecheck, test or build. If a step does, isolate it and say so.
- Do not add a CI step that deploys. Deployment stays on the existing Vercel path.
- Keep the `server/router.test.ts` allowlist in the CI test run.

## Analytics and event requirements

None.

## UI states

None. Any user-visible change is a defect.

## Test scenarios

| # | Scenario | Expected |
|---|---|---|
| 1 | Introduce a type error in `src/pages/Dashboard.tsx` | `npm run typecheck` fails; `npm run build` fails; CI red |
| 2 | Introduce a type error in `server/routes/auth.ts` | Fails on the server project |
| 3 | Revert both | Green |
| 4 | Fix one baselined frontend error without regenerating the baseline | Gate passes; report notes the baseline can shrink |
| 5 | Add a new frontend error equal in count to one fixed | Fails — the delta is per-error, not per-count |
| 6 | Fresh clone, `npm ci`, run all four steps | All pass with no local-only state |
| 7 | Add a new file `server/routes/scratch.ts` containing a type error, without touching any tsconfig | `npm run typecheck` fails. Before item 7 it passes — that is the decay this packet closes |
| 8 | Introduce a type error in `server/middleware.ts` | Fails. It is unchecked today |

## Dependencies

**WP-0001** must be ACCEPTED first — the archived docs and deleted routers change what typechecks.

## Open product decisions

None. The lint choice in §6 is an engineering decision that belongs to Codex, provided the outcome is honest.

## Report back

§42.2 format. Include the exact baseline count, the CI workflow path, and the before/after build time.
