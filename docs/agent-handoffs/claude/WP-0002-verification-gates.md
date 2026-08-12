# WP-0002 — Real verification gates and CI

**Status:** READY_FOR_BUILD
**Sprint:** 0 · **Owner after handoff:** Codex
**Requirement IDs:** §46 Sprint 0 (Codex), §47.1, ENG-003, CODEX-005
**Audit classification:** MODIFY (`package.json` scripts, `tsconfig`) · BUILD (CI, error baseline)
**Related decisions:** PDR-0005

---

## Product problem

`npm run typecheck` exits 0. The frontend has 156 TypeScript errors. The script points only at `tsconfig.server.json`, and `npm run build` runs that same partial check before `vite build`.

Every agent, every CI job and every Definition-of-Done review that runs the documented gate receives a false pass. The Master PRD's Sprint 0 exit gate requires that "typecheck, tests and build have known verified states". Right now the state is known to be wrong and the gate reports it as fine.

There is also no CI. Nothing runs on push, so nothing prevents a regression from reaching `main`.

## User journey

None directly. This packet is what makes every later acceptance review mean something.

## In scope

1. **Make `typecheck` cover both projects.** `npm run typecheck` runs `tsconfig.server.json` **and** `tsconfig.app.json` and reports both. The server project must continue to exit non-zero on any error — it is clean today and stays clean.
2. **Commit a frontend error baseline** (PDR-0005). A checked-in file records the current known frontend errors, keyed stably enough to survive line moves (file + error code + message is acceptable; choose and justify). Provide `npm run typecheck:baseline` to regenerate it deliberately.
3. **Gate on the delta, not the total.** A new error not in the baseline fails. A reduced count updates the baseline in the same commit. **The baseline may never grow** — if a packet increases it, that packet fails.
4. **CI on push and pull request**, running: install, `npm run typecheck`, `npm test`, `npm run build`. All four must pass for green.
5. **Record the verified numbers** in `docs/implementation/IMPLEMENTATION_STATE.md` (create it if absent): test count, server error count, frontend baseline count, bundle size, build time. These are the reference figures Claude reviews future packets against.
6. **Lint decision.** `eslint.config.js` exists with none of its dependencies installed. Either install and configure it so it runs clean, and add it as a gate; or delete the orphan config and state in the report that lint is deferred. Do not leave a config file that cannot run — that is another false signal. §47.1 makes lint a gate only "once a working lint script and dependencies are intentionally configured".

## Out of scope

- **Fixing the 156 frontend errors.** They are recorded, not repaired. Fixing them wholesale is a frontend rewrite, and ENG-005/§48 forbid a blind rewrite.
- Bundle-size work (FINDING-06) — Sprint 10, or whichever Feed packet lands first.
- Test-coverage expansion beyond keeping the suite green.
- Any product behaviour change.

## Existing behaviour to preserve

- `npm test` keeps passing at ≥56 tests.
- `npm run build` keeps producing a working Vercel deployment. If `build` now runs a slower gate, keep total build time reasonable and report it.
- The server project stays at zero errors.

## Acceptance criteria

1. `npm run typecheck` reports errors from both projects. Demonstrated by introducing a deliberate error in a `src/` file and showing the command fail, then reverting.
2. A baseline file is committed, and its recorded count matches a fresh run at the time of the report.
3. A **new** frontend error fails the gate; an error already in the baseline does not. Both demonstrated with command output.
4. `npm run build` fails when `typecheck` fails. No path exists to a green build over a broken frontend type.
5. CI runs on push and pull request, executes all four steps, and is green on `main`. Provide the workflow file path and a run URL or log.
6. `docs/implementation/IMPLEMENTATION_STATE.md` exists and records the five verified figures with the date and commit they were measured at.
7. Lint is either a working gate or explicitly deferred with the orphan config removed. No third outcome.
8. Auth, routes and deployment behaviour are unchanged.

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

## Dependencies

**WP-0001** must be ACCEPTED first — the archived docs and deleted routers change what typechecks.

## Open product decisions

None. The lint choice in §6 is an engineering decision that belongs to Codex, provided the outcome is honest.

## Report back

§42.2 format. Include the exact baseline count, the CI workflow path, and the before/after build time.
