# CLAUDE.md

Read this first. For deeper context read, in order: `docs/CURRENT_STATE.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_SYSTEM_MAP.md`, `docs/SECURITY_AUDIT.md`, then the rest of `docs/`.

## Product purpose

Levav Talent is an early-stage prototype for "Africa's Workforce Intelligence Ecosystem," starting in Zambia. The intended journey is Potential → Capability → Contribution → Opportunity → Prosperity → Development, expressed through concepts like Levav ID, Workforce Readiness Index (WRI), Levav 28, Levav Learn, QuickWork, SkillSpace, Levav Impact, and Levav Champions.

**As of this audit, none of those concepts are backed by a real database or API.** The running application is a frontend-only, localStorage-and-mock-data prototype. See `docs/CURRENT_STATE.md` for the verified, page-by-page reality.

## Technology stack

- **Frontend (this is what actually runs):** Vite 6, React 19, TypeScript 5.9 (strict), Tailwind CSS 3, shadcn/ui (`new-york` style) + Radix primitives, React Router 7, TanStack Query 5, framer-motion 12.
- **Backend (written, exists in the tree, but disconnected — see below):** Hono server (`api/boot.ts`), tRPC v11 (`api/router.ts`), Drizzle ORM against MySQL (`db/schema.ts`), JWT via `jose`, password hashing via `bcryptjs`, S3 uploads via AWS SDK.
- **The backend's dependencies are not in `package.json`** and no npm script starts it. Do not assume it runs. See `docs/ARCHITECTURE.md` and `docs/DEPENDENCY_AUDIT.md`.

## Important commands

```bash
npm install       # frontend only — backend deps are NOT declared, see docs/DEPENDENCY_AUDIT.md
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # production build (does NOT type-check — see below)
npm run preview   # preview the production build
npx tsc --noEmit -p tsconfig.app.json   # typecheck (no npm script defined yet) — currently ~150 errors, see docs/CURRENT_STATE.md
```

There is no `lint` script and no `test` script. `eslint.config.js` exists but its dependencies (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) are not installed. There are no test files anywhere in the repo.

## Architectural rules

1. **Don't assume the backend works.** `api/`/`db/` contain real, mostly well-structured code, but it has never been run (confirmed: it fails on its first import due to a path-alias Node can't resolve at runtime) and its dependencies aren't installed. Any work that "wires up the backend" is a deliberate migration project, not a quick fix — see `docs/NEXT_MILESTONE.md`.
2. **Don't trust page-level "it renders" as "it works."** The large majority of `src/pages/*.tsx` and `src/components/admin/*.tsx` run on hardcoded `MOCK_*` arrays and/or localStorage, not the API. Check `docs/CURRENT_STATE.md` before describing any page as functional.
3. **`contracts/index.ts` is dead code** — unreferenced anywhere, stale relative to the current DB schema. Don't extend it; don't assume it's the source of truth for shared types.
4. **Path aliases (`@/`, `@db/`, `@api/`, `@contracts/`) only resolve inside Vite/tsc**, not under plain Node/tsx. If you make backend code runnable, it needs a runtime resolver (e.g. `tsconfig-paths`, or rewrite to relative imports).
5. **One canonical app.** A sibling `app/` folder (outside this git repo) exists from an earlier generation and should not be treated as a second source of truth. `levav-talent/` (this folder) is canonical.

## Testing requirements

There is currently no test suite. Any new business-logic code (auth, matching, WRI scoring, payments) must ship with tests — don't add more untested critical logic to a codebase that already has zero coverage.

## Security rules

- Auth is currently fake (client-side only, any email/password succeeds, `Math.random()` user IDs). This is a known, self-documented limitation (see `docs/SECURITY_AUDIT.md`) — don't build new features on top of it as if it were real auth.
- If/when the real backend is wired up: fix `api/routes/employer.ts`'s `ctx.user.id` bug (should be `ctx.user.userId`) before using it; `application.ts#updateStatus`, `notification.ts#create`, and `upload.ts#getPresignedUrl` currently have missing or insufficient authorization checks — do not deploy them as-is.
- Never weaken auth/authorization to make a feature "work." Never commit `.env` (it's gitignored — keep it that way).

## Design-system rules

- One component system: shadcn/ui + Radix + Tailwind. Don't introduce a second UI library.
- `framer-motion` is already in use (not `motion`); don't add both.
- Visual direction (per `CREATIVE_BRIEF.md`): premium, minimal, black-and-white foundation with controlled lime-green accents, strong typography, sparing glass/liquid effects. Don't add decorative flourishes at the expense of product flows.
- The production bundle is currently a single 2.38MB JS file — any new heavy dependency should consider code-splitting (`React.lazy` + dynamic import), not add to the monolith.

## Git rules

- This repo (`levav-talent/`) has its own clean git history, separate from a much larger, messier repo that used to be accidentally rooted at the parent `Downloads/` folder. Do not run git commands from outside this folder assuming they're scoped to this project.
- Never `git add -A` from outside `levav-talent/`.
- Commit only when asked. Never force-push. Never `--no-verify`.

## Required reading order

1. `docs/CURRENT_STATE.md` — what's real vs. mock, page by page.
2. `docs/ARCHITECTURE.md` — actual vs. intended architecture.
3. `docs/PRODUCT_SYSTEM_MAP.md` — Levav concept → code/schema reality.
4. `docs/SECURITY_AUDIT.md`
5. `docs/DEPENDENCY_AUDIT.md`
6. `docs/UI_UX_AUDIT.md`
7. `docs/REPOSITORY_AUDIT.md` — how the repo got here.
8. `docs/ROADMAP.md` and `docs/NEXT_MILESTONE.md` — where to go next.
9. `docs/DECISIONS.md` — log of decisions made during this audit.
