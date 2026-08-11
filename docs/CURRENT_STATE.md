# Current State

> **⚠️ STALE on backend claims (as of 2026-07-30).** The "Backend server (`api/boot.ts`)" row
> below and any statement that the backend "has never run" describe the pre-`bcfeb83` generation.
> The backend has since been rebuilt on Postgres/Supabase under `server/`, deployed as a real
> Vercel serverless function, with real auth/onboarding wired and tested end-to-end. See
> `docs/BACKEND_READINESS_REVIEW.md` for current, verified ground truth. The frontend-focused
> sections of this document (page-by-page mock/real status) are unaffected and still accurate.

The authoritative, verified snapshot of what works, what's mocked, and what's broken. Every claim here was confirmed by reading code or running a command — nothing is inferred from a file existing. Six statuses are used, and are kept distinct on purpose (don't collapse them):

- **Working** — functions correctly as intended, verified by reading the implementation and/or running it. Includes static content that needs no backend, and client-only logic that genuinely does what it claims (e.g., a real algorithm), not just backend-verified features — because right now, nothing in this app is backend-verified (the backend has never run).
- **LocalStorage-backed** — genuinely functional, real read/write logic, but the persistence layer is the browser's `localStorage`, not a server or database. Distinguished from *Mocked* because there is no fake seed data standing in for something else — this is an honest, working local-only feature. Distinguished from *Working* because it does not survive across devices/browsers and has no server backing it.
- **Mocked** — presents as if backed by real or shared data, but actually reads from a hardcoded array (`MOCK_*`, `mockTalents`, etc.), regardless of whether `localStorage` additionally persists a user's edits on top of that fake seed.
- **Broken** — throws, fails to compile, or is logically incorrect as written. Includes non-functional stubs (a named endpoint that deliberately does nothing).
- **Unverified** — not exercised in this pass; don't assume either way.
- **Planned** — named in product vision/docs (`CREATIVE_BRIEF.md`, the Levav concept list) but has zero implementation — no schema, no endpoint, no page — anywhere in the codebase. This is a concept-level status, not a page-level one: a page can be *Mocked* (it renders, using fake data) while the underlying *system* it's supposed to represent is *Planned* (never built server-side at all). See `docs/PRODUCT_SYSTEM_MAP.md` for the concept-level view.

## Tooling & process (Phase 3 verification results)

| Check | Status | Detail |
|---|---|---|
| `npm install` (frontend) | Working | 278 packages, 0 vulnerabilities |
| Lint | Broken | `eslint.config.js` references packages not in `package.json`; no `lint` script; `npx eslint .` fails immediately |
| Typecheck | Unverified in CI/scripts (Broken once run) | No `typecheck` script exists. Running `npx tsc --noEmit -p tsconfig.app.json` manually surfaces ~150 real errors across ~35 files (below). Vite's build does not type-check, so these ship silently today. |
| Production build | Working | Succeeds; single 2.38MB JS bundle, no code-splitting (see `docs/UI_UX_AUDIT.md`) |
| Dev server | Working | Boots clean, HTTP 200 |
| Backend server (`api/boot.ts`) | Broken | Dependencies not installed; even after installing them, fails on first import (`@db/connection` path alias unresolvable at runtime) — see `docs/ARCHITECTURE.md` |
| Test suite | Planned (doesn't exist) | No test files anywhere in the repo |

## Typecheck findings (once all deps are present)

One dominant root cause accounts for roughly 60% of all errors:

- **`ease: number[]` vs. `Easing` (framer-motion) — Broken.** ~90 errors across ~30 files (`Admin.tsx`, `Booking.tsx`, `ContentStudio.tsx`, `Learn.tsx`, every `src/sections/home/*.tsx`, and more). Every animation variant defines `ease: [n, n, n, n]` as a plain array; framer-motion 12's stricter types want a typed `Easing`/tuple. One shared, correctly-typed transition helper would fix nearly all of these at once.

Distinct, individually real bugs found (all **Broken**):

- **`src/components/ui/sidebar.tsx`** imports `@/hooks/use-mobile` — file does not exist. Broken import.
- **`src/components/ui/resizable.tsx`** calls `.Group`/`.Separator` on `react-resizable-panels`, not present on the installed version. Library/version mismatch.
- **`src/pages/Onboarding.tsx`** calls `safeJSONSet`/`safeJSONParse` at 3 call sites (lines 432, 455, 469) with no import in scope — will throw `ReferenceError` at runtime if that code path executes. Confirmed by direct inspection.
- **`src/pages/ProfileCreate.tsx`** — a piece of state resolves to type `never`, breaking 7 property accesses (lines 143-150).
- **`src/lib/levavData.ts:519`** — confirmed by direct inspection: `{ ..., completed: false, false: false, content: '...' }` — a stray literal `false: false` key duplicate, doesn't match the `LearnLesson` type.
- **tRPC client integration** (`src/providers/trpc.tsx`, `src/hooks/useAuth.ts`, `NotificationBell.tsx`, `ReviewForm.tsx`) — all fail to typecheck against the inferred `AppRouter`, with TypeScript reporting a "property collides with a built-in method" guard. No literal reserved-name collision was found in `auth`/`notification`/`review`'s procedure names; the more likely explanation is that real errors elsewhere in `appRouter` (the `employer.ts`/`job.ts` bugs below) are corrupting the whole router's inferred type. Not fully isolated — worth re-checking once those are fixed. (**Unverified** as to exact root cause.)
- **`api/routes/employer.ts`** — reads `ctx.user.id` (doesn't exist; should be `ctx.user.userId`) at lines 30, 75, 138. Confirmed broken as written.
- **`api/routes/job.ts:29`** — compares a Drizzle enum column against a plain `string` instead of the literal union type Drizzle expects. Type-unsafe filter.
- A handful of `string | null` vs. `string` strictness errors in admin components (`ApplicationsSection.tsx`, `CandidatesSection.tsx`, `EmployersSection.tsx`, `JobsSection.tsx`, `UsersSection.tsx`) — minor, but real.

## Frontend pages (`src/pages/*.tsx`, 34 files)

| Page | Status | Note |
|---|---|---|
| Home | Working | Composes 5 real section components per `CREATIVE_BRIEF.md`; static marketing page, no data dependency |
| About, Contact, NotFound | Working | Static content, no data needed |
| Auth | Mocked | Presents as real authentication but is fake end-to-end: accepts any email/password, `Math.random()` user id, `demo_token_*`. See `docs/SECURITY_AUDIT.md` |
| Admin | Mocked | `MOCK_EMPLOYERS`/`MOCK_APPLICATIONS`/`MOCK_ANALYTICS`-style arrays + localStorage edits on top |
| Booking | Mocked | `mockTalents` seed + localStorage-persisted profiles on top |
| ChampionApply | LocalStorage-backed | Form persists to localStorage; no fake seed data, no backend, and no real Champion role in the DB (see `docs/PRODUCT_SYSTEM_MAP.md`) |
| ContentStudio | Mocked | `mockCourses` seed; champion-gating is client-side only (`user?.role === 'champion'`), unenforceable server-side today |
| ContractWorkspace | Mocked | `MOCK_BOOKINGS` seeded into localStorage |
| Dashboard | Mocked | `MOCK_APPLICATIONS`/`MOCK_JOBS`/`MOCK_ACTIVITY`, plus a literal `const activeJobs = 12; // Mock value` |
| EmployerAnalytics, TalentAnalytics | Mocked | Static analytics data, no persistence |
| EmployerJobs | Mocked | Explicit in-UI "Mock data indicator" comment |
| Employers | Mocked | `MOCK_` verified-employer list |
| Impact | Planned | Static placeholder content; no backing system exists at all (see `docs/PRODUCT_SYSTEM_MAP.md`) |
| JobApply | Mocked | `MOCK_JOBS`; explicit comment "no API calls" |
| JobDetail | Mocked | `MOCK_JOBS` seed + localStorage on top |
| Learn | Mocked | Static course catalog (`levavData.ts`) + localStorage progress; underlying Levav Learn system is **Planned** (no schema/endpoint exists) |
| Levav28 | Mocked | Static day/task data + localStorage; has `alert("Certificate download coming soon!")`; underlying Levav 28 system is **Planned** |
| MarketIntel | Mocked | Static per-country talent-pool data |
| Messages | Mocked | `MockMessage`/`MockConversation` types, localStorage-seeded |
| MilestonePayments | Mocked | `MOCK_MILESTONES`/`MOCK_TRANSACTIONS`, no real payment integration |
| Onboarding | Broken | Contains a confirmed runtime bug (missing import, see above); also layers static data + localStorage on top |
| Opportunities | Mocked (self-labeled) | `MOCK_JOBS`; literal `const isUsingMockData = true` with a visible UI banner — good practice, keep it |
| ProfileCreate | Broken | Confirmed `never`-typed state bug (7 breakages); also documents S3 upload as "coming soon" (a **Planned** sub-feature) |
| Projects | Mocked | `mockProjects` drives all stats/lists, no persistence |
| QuickWork | Mocked | Static gig data + localStorage; underlying QuickWork system is **Planned** (no schema/endpoint) |
| Screening | Mocked | Falls back to default mock talents |
| Settings | LocalStorage-backed | Genuine localStorage-backed persistence via `settingsService.ts` — no fake seed, real logic, just not server-backed |
| ShaderDemo | Working | Standalone Three.js/shader visual demo, not part of main product flow, no persistence needed |
| SkillGap | Planned | Static placeholder content with dead resource links (`url: "#"`); underlying SkillSpace system is **Planned** |
| SmartMatch | Working | Genuine client-only algorithmic matching (does what it claims), no persistence, no backend |
| TalentAnalytics, TalentDirectory, TalentProfile | Mocked | `MOCK_TALENTS` seed + localStorage-created profiles on top |

## Admin components (`src/components/admin/*.tsx`, 20 files)

- **Mocked, with localStorage persisting edits on top** (`// Read from localStorage or fall back to mock`): `ApplicationsSection`, `JobsSection`, `EmployersSection`, `UsersSection`, `RecruitersSection`, `CandidatesSection`.
- **Mocked, with no persistence at all** (edits don't survive a refresh): `SubscriptionsSection`, `ReportsSection`, `Levav28Section`, `QuickWorkSection`, `CoursesSection`, `NotificationsSection`, `PaymentsSection`, `RolesSection`, `UniversitySection`, `ContentMgmtSection`, `ModerationSection`, `SupportSection`.
- **LocalStorage-backed** (genuine read/write via dedicated service modules, no fake seed): `AuditSection` (`auditService.ts`), `SettingsSection` (`settingsService.ts`), `ChampionApplicationsSection`.
- **None of the 20 admin sections call the real backend.**

## Backend (`api/`, `db/`) — see `docs/ARCHITECTURE.md` and `docs/SECURITY_AUDIT.md` for full detail

| Layer | Status | Note |
|---|---|---|
| `auth.ts`, `talent.ts`, `job.ts`, `message.ts` | Unverified (code reads as correct; never executed) | Real Drizzle queries, correct auth checks, but has never run against a live database — see `docs/ARCHITECTURE.md` for why |
| `employer.ts` | Broken | `ctx.user.id` bug at 3 call sites |
| `application.ts`, `notification.ts`, `review.ts`, `upload.ts` | Unverified + confirmed missing authorization checks | See `docs/SECURITY_AUDIT.md` for the specific gaps |
| `wri.ts` | Broken (stub) | `get` unconditionally returns `null` |
| `contracts/index.ts` | Broken (dead code) | Unreferenced anywhere, stale relative to current schema |
| Migrations | Planned (don't exist) | Never generated — `db/migrations/` doesn't exist |
| The server as a whole | Broken | Never successfully started even once — confirmed by direct attempt (`tsx api/boot.ts` fails on its first import) |

## Product-concept-to-system mapping (concept-level, not page-level)

See `docs/PRODUCT_SYSTEM_MAP.md` for the full table. Summary, using the same six statuses at the *system* level:

- **Planned** (no DB table, no API endpoint, exists only as a frontend page over static data): Levav 28, Levav Learn, QuickWork, Levav SkillSpace, Levav Impact, the Champions role, Subscriptions/commercial model, Volunteerism/verified contribution.
- **Broken** (has a table and a named endpoint, but the endpoint is a non-functional stub): Workforce Readiness Index.
- **Unverified/no evidence found**: Levav ID™, The Levav Code™ — no distinct implementation found anywhere in `src/`, `api/`, or `db/` beyond ordinary DB primary keys; not confirmed to exist as a concept in code at all.
