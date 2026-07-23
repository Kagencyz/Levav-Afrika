# AGENTS.md

Instructions for any AI coding agent working in this repository. See `CLAUDE.md` for full product/architecture context — this file is the short version for agents that don't read `CLAUDE.md` by convention.

## Before you touch anything

- This is `levav-talent/`, the canonical Levav Talent codebase, with its own dedicated git repository (`main` branch). It is nested inside a larger folder (`Levav Afrika  (1)/`) that also contains a stale, unrelated `app/` folder from an earlier generation — ignore `app/`, it is not part of this repo and not canonical.
- Read `docs/CURRENT_STATE.md` before claiming any feature works. Most pages run on hardcoded mock data or localStorage, not a real backend.

## Ground truth, verified by running commands (not assumed)

- `npm install && npm run dev` works — frontend boots on `http://localhost:5173`.
- `npm run build` works, but performs **no type checking** (Vite/esbuild transpile only).
- `npx tsc --noEmit -p tsconfig.app.json` currently reports ~150 real errors. There is no `lint` or `typecheck` npm script and no test suite.
- The `api/`/`db/` backend (Hono + tRPC + Drizzle + MySQL) is **not runnable as committed**: its npm dependencies are absent from `package.json`, and even after installing them, `tsx api/boot.ts` fails immediately because `api/routes/employer.ts` imports via the `@db/*` path alias, which only exists for Vite/tsc, not for a plain Node/tsx runtime.

## Rules

1. Do not describe a page, component, or system as "working" or "complete" because a file exists — verify against `docs/CURRENT_STATE.md` or by actually reading the data source (mock array vs. real query).
2. Do not wire a single page to the real backend as a drive-by fix. Wiring auth/DB for real is a scoped milestone (`docs/NEXT_MILESTONE.md`) with its own security review, not an incidental change.
3. Do not add a second UI library, a second animation library, or a second state-management pattern. Match what's already there: shadcn/ui, Radix, Tailwind, framer-motion, TanStack Query.
4. Do not weaken authentication/authorization to make something pass. The current fake auth is a known, acknowledged limitation, not a pattern to extend.
5. Do not run destructive git operations. This repo already had one accidental-scope incident (see `docs/REPOSITORY_AUDIT.md`) — treat git history and `.git` scope with care in this project family.
6. If you add backend logic, add tests. There are currently zero.
7. Keep documentation in `docs/` up to date if you materially change architecture or product state — don't let `CURRENT_STATE.md` go stale.
